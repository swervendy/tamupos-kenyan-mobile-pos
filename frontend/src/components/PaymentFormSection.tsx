import React, { useRef, useEffect } from 'react';

interface PaymentFormSectionProps {
  phoneNumber: string;
  onPhoneNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  orderTotal: number;
  errorMessage: string;
  isProcessing: boolean;
  onPayment: () => void;
}

const PaymentFormSection: React.FC<PaymentFormSectionProps> = ({
  phoneNumber,
  onPhoneNumberChange,
  orderTotal,
  errorMessage,
  isProcessing,
  onPayment,
}) => {
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phoneInputRef.current) {
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 100);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={onPhoneNumberChange}
          placeholder="0712345678 or 254712345678"
          autoComplete="tel"
          autoFocus
          ref={phoneInputRef}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter customer's Safaricom number for M-Pesa payment
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={onPayment}
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
  );
};

export default PaymentFormSection; 