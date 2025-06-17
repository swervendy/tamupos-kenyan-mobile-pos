import React from 'react';
import { CartItem } from '../types';

interface OrderSummarySectionProps {
  orderType: 'tab' | 'table' | 'takeout';
  customerName?: string;
  tableNumber?: number;
  cartItems: CartItem[];
  orderTotal: number;
  className?: string;
}

const OrderSummarySection: React.FC<OrderSummarySectionProps> = ({
  orderType,
  customerName,
  tableNumber,
  cartItems,
  orderTotal,
  className,
}) => {
  return (
    <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-cyan-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9" />
          </svg>
          Order Summary
        </h3>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Service Type:</span>
          <span className="capitalize font-medium">{orderType}</span>
        </div>
        {customerName && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="font-medium">{customerName}</span>
          </div>
        )}
        {tableNumber && (
          <div className="flex justify-between">
            <span>Table:</span>
            <span className="font-medium">#{tableNumber}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Items:</span>
          <span className="font-medium">{cartItems.length}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t">
          <span>Total:</span>
          <span>KSh {orderTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummarySection; 