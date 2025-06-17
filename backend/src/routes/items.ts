import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// GET all food items for the user's restaurant
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const restaurantId = req.user!.restaurantId; // Get ID from the authenticated user
  
  try {
    const items = await prisma.foodItem.findMany({
      where: { restaurantId: restaurantId },
      include: {
        category: true, // Also include the category name
      },
      orderBy: {
        name: 'asc',
      }
    });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch food items" });
  }
});

// POST - Create a new food item
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const restaurantId = req.user!.restaurantId;
  
  try {
    const { name, description, price, category, available = true } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    // Find the category for this restaurant
    const categoryRecord = await prisma.category.findUnique({
      where: {
        restaurantId_name: {
          restaurantId,
          name: category
        }
      }
    });

    if (!categoryRecord) {
      return res.status(400).json({ error: 'Category not found for this restaurant' });
    }

    const newItem = await prisma.foodItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        available,
        restaurantId,
        categoryId: categoryRecord.id
      },
      include: {
        category: true
      }
    });

    res.status(201).json({ message: 'Food item created successfully', item: newItem });
  } catch (error) {
    console.error('Error creating food item:', error);
    res.status(500).json({ error: 'Failed to create food item' });
  }
});

// PUT - Update a food item
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const restaurantId = req.user!.restaurantId;
  const { id } = req.params;
  
  try {
    const { name, description, price, category, available } = req.body;

    // First, check if the item exists and belongs to this restaurant
    const existingItem = await prisma.foodItem.findFirst({
      where: {
        id,
        restaurantId
      }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    // If category is being updated, find the new category
    let categoryId = existingItem.categoryId;
    if (category) {
      const categoryRecord = await prisma.category.findUnique({
        where: {
          restaurantId_name: {
            restaurantId,
            name: category
          }
        }
      });

      if (!categoryRecord) {
        return res.status(400).json({ error: 'Category not found for this restaurant' });
      }
      categoryId = categoryRecord.id;
    }

    const updatedItem = await prisma.foodItem.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(available !== undefined && { available }),
        categoryId
      },
      include: {
        category: true
      }
    });

    res.json({ message: 'Food item updated successfully', item: updatedItem });
  } catch (error) {
    console.error('Error updating food item:', error);
    res.status(500).json({ error: 'Failed to update food item' });
  }
});

// DELETE - Delete a food item
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const restaurantId = req.user!.restaurantId;
  const { id } = req.params;
  
  try {
    // First, check if the item exists and belongs to this restaurant
    const existingItem = await prisma.foodItem.findFirst({
      where: {
        id,
        restaurantId
      }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    await prisma.foodItem.delete({
      where: { id }
    });

    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Error deleting food item:', error);
    res.status(500).json({ error: 'Failed to delete food item' });
  }
});

export default router; 