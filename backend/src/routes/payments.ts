import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import MPesaService, { MpesaConfig } from '../services/mpesa';
import { Order, OrderStatus, Restaurant } from '../generated/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// TODO: This will be replaced by user authentication middleware
const TEMP_RESTAURANT_ID = "167e832b-6730-46c5-b185-68da53356eb1";

// Helper to format phone number to Safaricom's required format
const formatPhoneNumber = (phone: string) => {
  // Remove any non-digit characters
  const cleaned = ('' + phone).replace(/\\D/g, '');
  // Check if it starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  }
  // Check if it already starts with 254
  if (cleaned.startsWith('254')) {
    return cleaned;
  }
  // For other formats (e.g., starting with 7), prepend 254
  return '254' + cleaned;
};

/**
 * POST /api/payments/stk-push
 * Initiates an M-Pesa STK push for a given order.
 */
router.post('/stk-push', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { phoneNumber, amount, orderId } = req.body;
  const restaurantId = req.user!.restaurantId;

  if (!phoneNumber || !amount || !orderId) {
    return res.status(400).json({ error: 'Phone number, amount, and order ID are required' });
  }

  try {
    // 1. Fetch the restaurant's M-Pesa credentials from the database
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || !restaurant.mpesaConsumerKey || !restaurant.mpesaConsumerSecret || !restaurant.mpesaPasskey || !restaurant.mpesaPaybill) {
      console.error(`❌ M-Pesa credentials not configured for restaurant ${restaurantId}`);
      return res.status(500).json({ error: 'Payment gateway is not configured for this restaurant.' });
    }

    // 2. Create a new M-Pesa service instance with the restaurant's credentials
    //    We'll use env vars for URLs as a temporary measure.
    //    Ideally, these might also be configurable per restaurant.
    const mpesaConfig: MpesaConfig = {
      consumerKey: restaurant.mpesaConsumerKey,
      consumerSecret: restaurant.mpesaConsumerSecret,
      passkey: restaurant.mpesaPasskey,
      shortcode: restaurant.mpesaPaybill,
      callbackUrl: process.env.MPESA_CALLBACK_URL || '',
      baseUrl: process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke'
    };
    
    const mpesaService = new MPesaService(mpesaConfig);

    // 3. Initiate the STK push
    const stkResponse = await mpesaService.initiateSTKPush({
      phoneNumber,
      amount: Math.round(amount), // Ensure amount is an integer
      orderId,
      accountReference: `Order-${orderId}`,
    });

    // 4. Store the CheckoutRequestID with the order for callback processing
    await prisma.order.update({
      where: {
        id: orderId,
        restaurantId: restaurantId,
      },
      data: { transactionId: stkResponse.CheckoutRequestID },
    });

    res.json({
      message: 'STK Push initiated successfully',
      checkoutRequestId: stkResponse.CheckoutRequestID,
      merchantRequestId: stkResponse.MerchantRequestID,
    });
  } catch (error: any) {
    console.error('STK Push initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// M-Pesa callback handler
router.post('/callback', async (req: Request, res: Response) => {
  console.log('--- M-PESA CALLBACK RECEIVED ---');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request Body:', JSON.stringify(req.body, null, 2));

  try {
    const { Body } = req.body;
    
    if (Body && Body.stkCallback) {
      const { CheckoutRequestID, ResultCode, ResultDesc } = Body.stkCallback;
      
      console.log(`Processing callback for CheckoutRequestID: ${CheckoutRequestID}`);
      console.log(`ResultCode: ${ResultCode}, ResultDesc: ${ResultDesc}`);
      
      // Find the order using the CheckoutRequestID, which we stored in transactionId
      const orderToUpdate = await prisma.order.findFirst({
        where: { transactionId: CheckoutRequestID }
      });

      if (!orderToUpdate) {
        console.error(`CALLBACK ERROR: No order found with CheckoutRequestID: ${CheckoutRequestID}`);
        // Still acknowledge, but log an error.
        return res.json({ ResultCode: 0, ResultDesc: 'Success' });
      }

      console.log(`Found order: ${orderToUpdate.orderNumber} (ID: ${orderToUpdate.id})`);

      if (ResultCode === 0) {
        // Payment successful
        console.log('✅ Payment successful for CheckoutRequestID:', CheckoutRequestID);
        
        await prisma.order.update({
          where: { id: orderToUpdate.id },
          data: { 
            status: 'PAID',
            paymentMethod: 'M-Pesa',
            updatedAt: new Date()
          }
        });
        console.log(`✅ Order ${orderToUpdate.orderNumber} marked as PAID`);

      } else {
        // Payment failed or cancelled
        console.log(`❌ Payment failed for CheckoutRequestID: ${CheckoutRequestID}`);
        console.log(`❌ Reason: ${ResultDesc} (Code: ${ResultCode})`);
        
        await prisma.order.update({
          where: { id: orderToUpdate.id },
          data: { 
            status: 'CANCELLED',
            updatedAt: new Date()
          }
        });
        console.log(`❌ Order ${orderToUpdate.orderNumber} marked as CANCELLED`);
      }
    } else {
      console.log('❌ Invalid callback body structure received');
      console.log('Expected Body.stkCallback but got:', req.body);
    }
    
    // Always respond with success to M-Pesa to acknowledge receipt
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('--- M-PESA CALLBACK CRITICAL ERROR ---', error);
    // Still acknowledge success to M-Pesa to prevent retries, but log the failure
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
});

/**
 * GET /api/payments/status/:checkoutRequestId
 * Queries the status of an M-Pesa transaction.
 */
router.get('/status/:checkoutRequestId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { checkoutRequestId } = req.params;
  const restaurantId = req.user!.restaurantId;

  try {
    // To query status, we need the credentials of the restaurant that initiated the request.
    const order = await prisma.order.findFirst({
      where: { 
        transactionId: checkoutRequestId,
        restaurantId: restaurantId 
      },
      include: {
        restaurant: true,
      }
    });

    if (!order || !order.restaurant) {
      return res.status(404).json({ error: 'Transaction not found or does not belong to this restaurant.' });
    }

    const { restaurant } = order;
    if (!restaurant.mpesaConsumerKey || !restaurant.mpesaConsumerSecret || !restaurant.mpesaPasskey || !restaurant.mpesaPaybill) {
      console.error(`❌ M-Pesa credentials not configured for restaurant ${restaurant.id} during status check.`);
      return res.status(500).json({ error: 'Payment gateway is not configured for this restaurant.' });
    }
    
    const mpesaConfig: MpesaConfig = {
      consumerKey: restaurant.mpesaConsumerKey,
      consumerSecret: restaurant.mpesaConsumerSecret,
      passkey: restaurant.mpesaPasskey,
      shortcode: restaurant.mpesaPaybill,
      callbackUrl: process.env.MPESA_CALLBACK_URL || '',
      baseUrl: process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke'
    };

    const mpesaService = new MPesaService(mpesaConfig);
    const status = await mpesaService.querySTKPushStatus(checkoutRequestId);
    res.status(200).json({ message: 'Payment status retrieved successfully', data: status });
  } catch (error: any) {
    console.error("STK Push status query error:", error);
    res.status(500).json({ message: 'Failed to query payment status', error: error.message });
  }
});

/**
 * GET /api/payments/orders/:id/status
 * Check the current status of an order
 */
router.get('/orders/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const order = await prisma.order.findUnique({ 
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        transactionId: true,
        paymentMethod: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log(`📊 Order status check for ${order.orderNumber}:`, {
      status: order.status,
      transactionId: order.transactionId,
      paymentMethod: order.paymentMethod
    });

    res.json({ 
      message: 'Order status retrieved successfully', 
      order: order,
      callbackReceived: !!order.paymentMethod // If paymentMethod is set, callback was processed
    });
  } catch (error) {
    console.error(`Failed to get order status for ${id}:`, error);
    res.status(500).json({ error: 'Failed to get order status' });
  }
});

// ==================================================================
// DEBUGGING ENDPOINT - DO NOT USE IN PRODUCTION
// Manually marks an order as paid, simulating a successful callback.
// ==================================================================
router.patch('/orders/:id/mark-as-paid', async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`--- DEBUG: Manually marking order ${id} as PAID ---`);
  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'PAID', updatedAt: new Date() },
    });
    
    console.log(`--- DEBUG: Order ${id} successfully marked as PAID ---`);
    res.json({ message: 'Order manually marked as paid', order: updatedOrder });
  } catch (error) {
    console.error(`--- DEBUG: Failed to mark order ${id} as paid ---`, error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router; 