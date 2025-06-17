import { Router, Response } from 'express';
import prisma from '../lib/prisma'; // Import our Prisma client
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
// No longer needed, will be fetched from DB
// import { FoodItem, foodItems } from './items'; 

const router = Router();
// Apply the middleware to all routes in this file
router.use(authMiddleware);

// Helper function to generate order number - now database-based with proper atomicity
const generateOrderNumber = async (restaurantId: string): Promise<string> => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Try up to 10 times to find a unique order number
  for (let attempt = 1; attempt <= 10; attempt++) {
    // Get the highest order number for today for this restaurant
    const lastOrderToday = await prisma.order.findFirst({
      where: {
        restaurantId: restaurantId,
        orderNumber: {
          startsWith: `ORD-${dateStr}-`
        }
      },
      orderBy: {
        orderNumber: 'desc'
      }
    });
    
    let nextCounter = attempt; // Start with attempt number to handle race conditions
    if (lastOrderToday) {
      // Extract the counter from the last order number
      const lastCounterStr = lastOrderToday.orderNumber.split('-')[2];
      const lastCounter = parseInt(lastCounterStr) || 0;
      nextCounter = Math.max(lastCounter + 1, attempt);
    }
    
    const candidateOrderNumber = `ORD-${dateStr}-${nextCounter.toString().padStart(4, '0')}`;
    
    // Check if this order number is already taken
    const existing = await prisma.order.findFirst({
      where: {
        restaurantId: restaurantId,
        orderNumber: candidateOrderNumber
      }
    });
    
    if (!existing) {
      return candidateOrderNumber;
    }
  }
  
  // Fallback: use timestamp-based suffix if all attempts fail
  const timestamp = Date.now().toString().slice(-4);
  return `ORD-${dateStr}-${timestamp}`;
};

// GET all orders for the user's restaurant
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const { status, type } = req.query;
  const restaurantId = req.user!.restaurantId; // Get ID from the authenticated user

  try {
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: restaurantId, // Use the user's restaurant ID
        status: status ? (status as any) : undefined,
        mode: type ? (type as any) : undefined,
      },
      include: {
        items: {
          include: {
            foodItem: true, // Include the full food item details in the response
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET a specific order by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const restaurantId = req.user!.restaurantId;

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: id,
        restaurantId: restaurantId, // Ensure the order belongs to the user's restaurant
      },
      include: {
        items: {
          include: {
            foodItem: true, // Include the full food item details in the response
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// POST create a new order
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const { mode, customerName, tableNumber, items = [] } = req.body;
  const restaurantId = req.user!.restaurantId; // Get ID from the authenticated user

  if (!mode) {
    return res.status(400).json({ error: 'Order mode is required' });
  }

  // For TAB and TABLE modes, allow empty items arrays (items will be added later)
  // For other modes like TAKE_AWAY, items might be required
  if (!items || (items.length === 0 && !['TAB', 'TABLE'].includes(mode))) {
    return res.status(400).json({ error: 'Order items are required for this mode' });
  }

  try {
    // --- Transaction to ensure all or nothing ---
    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Calculate totals and prepare order item data
      let subtotal = 0;
      const orderItemsData = [];

      // Only process items if they exist
      if (items && items.length > 0) {
        for (const item of items) {
          const foodItem = await tx.foodItem.findUnique({
            where: { id: item.foodItemId },
          });

          if (!foodItem || foodItem.restaurantId !== restaurantId) {
            throw new Error(`Food item with id ${item.foodItemId} not found.`);
          }
          
          const itemTotal = foodItem.price * item.quantity;
          subtotal += itemTotal;

          orderItemsData.push({
            quantity: item.quantity,
            notes: item.notes,
            priceAtOrder: foodItem.price, // Snapshot the price
            foodItemId: foodItem.id,
          });
        }
      }

      const vat = subtotal * 0.16; // 16% VAT
      const cateringLevy = subtotal * 0.02; // 2% Catering Levy
      const total = subtotal + vat + cateringLevy;

      // 2. Create the Order and its OrderItems
      const createdOrder = await tx.order.create({
        data: {
          restaurantId: restaurantId, // Use the user's restaurant ID
          orderNumber: await generateOrderNumber(restaurantId),
          mode,
          customerName,
          tableNumber,
          subtotalAmount: subtotal,
          vatAmount: vat,
          cateringLevyAmount: cateringLevy,
          totalAmount: total,
          items: orderItemsData.length > 0 ? {
            create: orderItemsData,
          } : undefined,
        },
        include: {
          items: { include: { foodItem: true } },
        }
      });

      return createdOrder;
    });

    res.status(201).json({ message: 'Order created successfully', order: newOrder });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// PUT update an existing order
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, customerName, tableNumber } = req.body;
  const restaurantId = req.user!.restaurantId; // Get ID from the authenticated user

  try {
    const updatedOrder = await prisma.order.update({
      where: {
        id: id,
        restaurantId: restaurantId, // Ensure the order belongs to the user's restaurant
      },
      data: {
        status: status,
        customerName: customerName,
        tableNumber: tableNumber,
      },
    });
    res.json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    // P2025 is Prisma's error code for "record not found"
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// PATCH cancel an order
router.patch('/:id/cancel', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const restaurantId = req.user!.restaurantId;

  try {
    // We fetch the order first to ensure it exists and belongs to the user's restaurant
    const order = await prisma.order.findFirst({
      where: {
        id: id,
        restaurantId: restaurantId,
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // You could add logic here to prevent cancellation of already paid/completed orders
    if (order.status === 'PAID' || order.status === 'COMPLETED') {
      return res.status(400).json({ error: `Cannot cancel an order that is already ${order.status}.` });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: id,
      },
      data: {
        status: 'CANCELLED',
      },
    });
    res.json({ message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

// PATCH update an order's status
router.patch('/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const restaurantId = req.user!.restaurantId;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Optional: Add validation to ensure status is a valid OrderStatus enum value
  // if (!Object.values(OrderStatus).includes(status)) {
  //   return res.status(400).json({ error: 'Invalid status value' });
  // }

  try {
    const updatedOrder = await prisma.order.update({
      where: {
        id: id,
        restaurantId: restaurantId, // Security check
      },
      data: {
        status: status,
      },
    });
    res.json({ message: `Order status updated to ${status}`, order: updatedOrder });
  } catch (error) {
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// DELETE an order
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const restaurantId = req.user!.restaurantId; // Get ID from the authenticated user

  try {
    // Use a transaction to delete order items first, then the order
    await prisma.$transaction(async (tx) => {
      // Check if order exists and belongs to the restaurant
      const order = await tx.order.findUnique({
        where: { id: id, restaurantId: restaurantId }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });
      await tx.order.delete({
        where: { id: id },
      });
    });
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    if ((error as Error).message === 'Order not found') {
      return res.status(404).json({ error: 'Order not found' });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

export default router;
// We no longer export the in-memory array
// export { orders }; 