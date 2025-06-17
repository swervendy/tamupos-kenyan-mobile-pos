import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../types';
import { apiService } from '../services/api';

export interface PaymentState {
  status: 'idle' | 'processing' | 'success' | 'error';
  phoneNumber: string;
  testMode: boolean;
  checkoutRequestId: string;
  pollingInterval: number | null;
}

export interface PaymentActions {
  setPhoneNumber: (phone: string) => void;
  setTestMode: (testMode: boolean) => void;
  handlePayment: (orderId: string) => Promise<void>;
  cancelPayment: () => void;
  resetPayment: () => void;
}

export const usePayment = (
  activeOrderFromProps: Order | null,
  completeOrderAction: (orderId: string, status: OrderStatus) => void,
  onPaymentSuccessForReceipt: (order: Order) => void
): PaymentState & PaymentActions => {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string>('');
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const pollPaymentStatus = useCallback(async (checkoutId: string, orderForPayment: Order) => {
    const now = Date.now();
    const pollingDuration = pollingStartTime ? (now - pollingStartTime) / 1000 : 0;

    // Overall timeout for the entire process
    if (pollingDuration > 90) { // 90-second total timeout
      console.log(`⏰ Polling timeout reached (${pollingDuration.toFixed(1)}s). Stopping.`);
      setPaymentStatus('error');
      if (pollingInterval) clearInterval(pollingInterval);
      setPollingInterval(null);
      setPollingStartTime(null);
      return;
    }

    try {
      // 1. Always check our own database first. It's the source of truth.
      const updatedOrder = await apiService.getOrderById(orderForPayment.id);
      if (updatedOrder && updatedOrder.status === 'PAID') {
        console.log('✅✅ Order confirmed as PAID in our database!');
        setPaymentStatus('success');
        completeOrderAction(updatedOrder.id, 'PAID');
        onPaymentSuccessForReceipt(updatedOrder);
        if (pollingInterval) clearInterval(pollingInterval);
        setPollingInterval(null);
        setPollingStartTime(null);
        return;
      }

      // 2. If our DB is not updated, query M-Pesa for an intermediate status.
      console.log(`🔍 Polling M-Pesa for status of CheckoutID: ${checkoutId}`);
      const statusResponse = await apiService.queryPaymentStatus(checkoutId);
      
      if (statusResponse && statusResponse.data) {
        const result = statusResponse.data;
        console.log('📊 M-Pesa status response:', result);

        switch (result.ResultCode) {
          case '0':
            // SUCCESS on M-Pesa side.
            // This is great, but we still wait for our backend to get the callback for final confirmation.
            console.log('✅ Payment successful on M-Pesa side. Waiting for backend callback to confirm.');
            // Continue polling, our DB check above will catch it when it's updated.
            return;

          case '1032':
            // USER CANCELLED
            console.log('❌ Payment cancelled by user (M-Pesa ResultCode: 1032)');
            setPaymentStatus('error');
            if (pollingInterval) clearInterval(pollingInterval);
            setPollingInterval(null);
            setPollingStartTime(null);
            // Optionally, update the order in the backend to 'CANCELLED'
            // await apiService.updateOrder(orderForPayment.id, { status: 'CANCELLED' });
            return;

          case '1':
          case '2001':
          case '1037':
          case '1025':
          case '1001':
             // Other definitive failure codes
            console.log(`❌ Payment failed with M-Pesa ResultCode: ${result.ResultCode} (${result.ResultDesc})`);
            setPaymentStatus('error');
            if (pollingInterval) clearInterval(pollingInterval);
            setPollingInterval(null);
            setPollingStartTime(null);
            return;

          default:
            // This includes pending statuses.
            console.log(`⏳ Payment status uncertain or pending (${result.ResultDesc}). Continuing to poll.`);
            return;
        }
      } else {
        console.log('⏳ M-Pesa query returned no data, will retry...');
      }
    } catch (error) {
      console.warn('⚠️ Error during polling, will retry...', error);
    }
  }, [pollingInterval, pollingStartTime, completeOrderAction, onPaymentSuccessForReceipt]);

  const handlePayment = async (orderId: string) => {
    const orderAtPaymentStart = activeOrderFromProps;

    if (!orderAtPaymentStart || orderAtPaymentStart.id !== orderId) {
      console.error("Payment attempted on invalid or non-active order.");
      return;
    }

    if (!phoneNumber.trim() || !phoneNumber.match(/^0[71]\d{8}$/)) {
      console.error("Invalid phone number format");
      setPaymentStatus('error');
      return;
    }

    setPaymentStatus('processing');
    console.log('Initiating M-Pesa payment for order:', orderId, 'with phone:', phoneNumber);
    
    if (testMode) {
      console.log('🧪 Test mode: Simulating payment success');
      setTimeout(() => {
        setPaymentStatus('success');
        completeOrderAction(orderAtPaymentStart.id, 'PAID');
        onPaymentSuccessForReceipt(orderAtPaymentStart);
      }, 3000);
      return;
    }

    try {
      const response = await apiService.initiateSTKPush(
        phoneNumber,
        orderAtPaymentStart.totalAmount,
        orderId
      );
      
      if (response.checkoutRequestId) {
        const checkoutId = response.checkoutRequestId;
        console.log('✅ STK Push initiated. CheckoutRequestID:', checkoutId);
        setCheckoutRequestId(checkoutId);
        setPollingStartTime(Date.now());
        
        const interval = setInterval(() => {
          pollPaymentStatus(checkoutId, orderAtPaymentStart);
        }, 3500); // Poll every 3.5 seconds
        
        setPollingInterval(interval as unknown as number);
      } else {
        console.error('❌ STK Push initiation failed. No checkoutRequestId received.');
        setPaymentStatus('error');
      }
    } catch (error: any) {
      console.error('💥 Payment failed with error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      setPaymentStatus('error');
    }
  };

  const resetPayment = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    setPaymentStatus('idle');
    setCheckoutRequestId('');
    setPollingInterval(null);
    setPollingStartTime(null);
    setPhoneNumber('');
  };

  const cancelPayment = () => {
    console.log('🛑 User manually cancelled payment');
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    setPollingStartTime(null);
    setPaymentStatus('idle');
    setCheckoutRequestId('');
  };

  return {
    status: paymentStatus,
    phoneNumber,
    testMode,
    checkoutRequestId,
    pollingInterval,
    setPhoneNumber,
    setTestMode,
    handlePayment,
    cancelPayment,
    resetPayment,
  };
}; 