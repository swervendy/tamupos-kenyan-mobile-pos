import React, { useState, useEffect } from 'react';
import { useOrder } from '../contexts/OrderContext';
import apiService from '../services/api';
import PaymentStatusDisplay from './PaymentStatusDisplay';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeOrder, clearActiveOrderCart, completeOrder } = useOrder();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  // Derivations from activeOrder
  const orderTotal = activeOrder?.totalAmount || 0;
  const orderType = activeOrder?.mode;
  const customerName = activeOrder?.customerName;
  const cartItems = activeOrder?.cart || [];

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^\d+]/g, '');
    setPhoneNumber(cleanValue);
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.length === 9) {
      return '254' + cleaned;
    }
    return cleaned;
  };

  const pollPaymentStatus = async (checkoutId: string) => {
    if (!activeOrder) return;
    try {
      const statusResponse = await apiService.queryPaymentStatus(checkoutId);
      console.log('Payment status:', statusResponse);
      
      if (statusResponse.data.ResultCode === '0') {
        setPaymentStatus('success');
        
        // Fetch the updated order from backend to sync status
        try {
          const updatedOrder = await apiService.getOrderById(activeOrder.id);
          if (updatedOrder && updatedOrder.status === 'PAID') {
            completeOrder(activeOrder.id, 'PAID');
            console.log('✅ Order status synced from backend:', updatedOrder.status);
          } else {
            console.warn('⚠️ Backend order status not yet updated, using frontend status');
            completeOrder(activeOrder.id, 'PAID');
          }
        } catch (error) {
          console.warn('⚠️ Failed to fetch updated order from backend, using frontend status', error);
          completeOrder(activeOrder.id, 'PAID');
        }
        
        clearActiveOrderCart();
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        setTimeout(() => {
          onClose();
          setPaymentStatus('idle');
          setPhoneNumber('');
        }, 3000);
      } else if (statusResponse.data.ResultCode && statusResponse.data.ResultCode !== '1032') {
        setPaymentStatus('error');
        setErrorMessage(statusResponse.data.ResultDesc || 'Payment failed');
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    } catch (error: any) {
      console.error('Error polling payment status:', error);
    }
  };

  const handlePayment = async () => {
    if (!activeOrder || !orderType) {
      setErrorMessage('No active order to process payment for.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter a phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const paymentResponse = await apiService.initiateSTKPush(
        formattedPhone,
        orderTotal,
        activeOrder.id
      );

      console.log('Payment initiated:', paymentResponse);
      
      if (paymentResponse.data && paymentResponse.data.CheckoutRequestID) {
        const interval = setInterval(() => {
          pollPaymentStatus(paymentResponse.data.CheckoutRequestID);
        }, 3000);
        setPollingInterval(interval);
        
        setTimeout(() => {
          if (interval) {
            clearInterval(interval);
            setPollingInterval(null);
            if (paymentStatus === 'processing') {
              setPaymentStatus('error');
              setErrorMessage('Payment timeout. Please try again.');
            }
          }
        }, 120000); 
      } else {
        throw new Error('Invalid response from payment service');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      onClose();
      setPaymentStatus('idle');
      setPhoneNumber('');
      setErrorMessage('');
    }
  };

  const handleRetry = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setPaymentStatus('idle');
    setErrorMessage('');
  };

  if (!isOpen || !activeOrder || !orderType) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
            {!isProcessing && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {(paymentStatus === 'processing' || paymentStatus === 'success' || paymentStatus === 'error') ? (
          /* Payment Status Display - Full Height */
          <div className="flex-1 flex items-center justify-center">
            <PaymentStatusDisplay
              status={paymentStatus}
              phoneNumber={phoneNumber}
              orderTotal={orderTotal}
              errorMessage={errorMessage}
              onRetry={handleRetry}
            />
          </div>
        ) : (
          /* Payment Form Layout */
          <>
            {/* Order Summary Header */}
            <div className="flex-shrink-0 p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-cyan-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9" />
                </svg>
                Order Summary
              </h3>
              <p className="text-sm text-gray-600">
                For: {customerName || (activeOrder?.tableNumber ? `Table #${activeOrder.tableNumber}` : 'Customer')}
              </p>
            </div>

            {/* Scrollable Cart Items */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-4 space-y-3">
                {cartItems.map((item) => (
                  <div key={item.foodItemId} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800 text-sm">{item.foodItem.name}</h4>
                        <p className="text-xs text-slate-600">KSh {item.foodItem.price.toFixed(2)} each</p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="font-semibold text-slate-800 text-sm">
                          KSh {(item.foodItem.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded border border-slate-200">
                        <span className="text-slate-600 text-xs">Qty:</span>
                        <span className="font-medium text-slate-800 text-sm">{item.quantity}</span>
                      </div>
                      {item.notes && (
                        <div className="text-xs text-slate-600 italic max-w-32 truncate">
                          Note: {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Footer - Fixed */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50">
              <div className="p-6 space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-lg font-semibold text-slate-800">Total:</span>
                  <span className="text-xl font-bold text-green-600">KSh {orderTotal.toFixed(2)}</span>
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="0712345678 or 254712345678"
                    autoComplete="tel"
                    autoFocus
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter customer's Safaricom number for M-Pesa payment
                  </p>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{errorMessage}</p>
                  </div>
                )}

                {/* Payment Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handlePayment}
                    disabled={!phoneNumber.trim() || isProcessing}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-teal-600 hover:shadow-lg transform hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                    Checkout KSh {orderTotal.toFixed(2)} with M-Pesa
                  </button>

                  <button
                    disabled
                    className="w-full flex items-center justify-center bg-gray-200 text-gray-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z" />
                    </svg>
                    Checkout with Card (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal; 