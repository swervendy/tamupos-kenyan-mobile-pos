import React from 'react';

interface PaymentStatusDisplayProps {
  status: 'processing' | 'success' | 'error';
  phoneNumber: string;
  orderTotal: number;
  errorMessage?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

const PaymentStatusDisplay: React.FC<PaymentStatusDisplayProps> = ({
  status,
  phoneNumber,
  orderTotal,
  errorMessage,
  onRetry,
  onCancel,
}) => {
  if (status === 'processing') {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"></div>
          <p className="text-gray-600">Awaiting customer payment</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-blue-800 text-sm">
              📱 A payment request has been sent to {phoneNumber}
            </p>
          </div>
          <p className="text-blue-600 text-xs">
            Customer will complete payment on their mobile device
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel Payment
          </button>
        )}
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-600 mb-2">Payment Complete!</h3>
        <p className="text-gray-600 mb-4">Order has been successfully paid</p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm font-medium">
            Order Total: KSh {orderTotal.toFixed(2)}
          </p>
          <p className="text-green-600 text-xs mt-1">
            Customer will receive SMS confirmation shortly
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-600 mb-2">Payment Failed</h3>
        <p className="text-gray-600 mb-4">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return null;
};

export default PaymentStatusDisplay; 