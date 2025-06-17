import React from 'react';
import { Order, CartItem } from '../types';
import { downloadOrderPdf } from '../utils/generatePdfReceipt';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  kraPin: string;
  mpesaPaybill: string;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ 
  order, 
  isOpen, 
  onClose, 
  restaurantName,
  restaurantAddress,
  restaurantPhone,
  kraPin,
  mpesaPaybill,
}) => {
  if (!isOpen || !order) return null;

  // Transform backend order items to cart format if needed
  const getCartItems = (order: Order): CartItem[] => {
    // If order already has cart property, use it directly
    if (order.cart && Array.isArray(order.cart)) {
      return order.cart;
    }
    
    // If order has items property (backend format), transform it to cart format
    if ((order as any).items && Array.isArray((order as any).items)) {
      return (order as any).items.map((item: any) => ({
        foodItemId: item.foodItem.id,
        foodItem: item.foodItem,
        quantity: item.quantity,
        notes: item.notes,
      }));
    }
    
    // Fallback to empty array
    return [];
  };

  const cartItems = getCartItems(order);

  const handleDownloadPdf = () => {
    downloadOrderPdf(order, {
      name: restaurantName,
      address: restaurantAddress,
      phone: restaurantPhone,
      kraPin: kraPin,
      mpesaPaybill: mpesaPaybill,
    });
  };

  const renderCartItem = (item: CartItem) => (
    <div key={item.foodItemId} className="py-2 border-b border-slate-200 flex justify-between items-center">
      <div>
        <p className="font-medium text-slate-700">{item.foodItem.name} (x{item.quantity})</p>
        {item.notes && <p className="text-xs text-slate-500">Notes: {item.notes}</p>}
      </div>
      <p className="text-slate-600">KSh {(item.foodItem.price * item.quantity).toFixed(2)}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        {/* Payment Complete Status */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-800">Payment Complete</h1>
              <p className="text-sm text-green-600">Transaction successful</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">Transaction Details</h2>
          <p className="text-sm text-slate-500">Order ID: {order.id.substring(0, 8)}</p>
          {order.mode === 'tab' && order.customerName && (
            <p className="text-sm text-slate-500">Customer: {order.customerName}</p>
          )}
          {order.mode === 'table' && order.tableNumber && (
            <p className="text-sm text-slate-500">Table: {order.tableNumber}</p>
          )}
        </div>

        <div className="mb-4 max-h-60 overflow-y-auto">
          {cartItems.map(renderCartItem)}
          {cartItems.length === 0 && <p className="text-slate-500 text-center py-4">No items in this order.</p>}
        </div>

        <div className="border-t border-slate-300 pt-4 mt-4">
          <div className="flex justify-between items-center text-sm mb-1">
            <p className="text-slate-600">Subtotal:</p>
            <p className="text-slate-600">KSh {order.subtotalAmount.toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center text-sm mb-1">
            <p className="text-slate-600">VAT (16%):</p>
            <p className="text-slate-600">KSh {order.vatAmount.toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center text-sm mb-3">
            <p className="text-slate-600">Catering Levy (2%):</p>
            <p className="text-slate-600">KSh {order.cateringLevyAmount.toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center mb-2 pt-3 border-t border-slate-200">
            <p className="text-lg font-semibold text-slate-700">Total Amount:</p>
            <p className="text-lg font-bold text-slate-800">KSh {order.totalAmount.toFixed(2)}</p>
          </div>
          <p className="text-xs text-slate-500 text-center mt-3">Thank you for your order!</p>
        </div>

        <div className="mt-6 space-y-3 sm:space-y-0 sm:flex sm:space-x-3">
          <button
            onClick={handleDownloadPdf}
            className="w-full sm:flex-1 bg-slate-500 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150"
          >
            Show Receipt
          </button>
          <button
            onClick={onClose}
            className="w-full sm:flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal; 