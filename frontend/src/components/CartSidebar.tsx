import React, { useMemo } from 'react';
import { Order, OrderMode, CartItem } from '../types';
import MobileKeypad from './MobileKeypad';

interface CartSidebarProps {
  activeOrder: Order | null;
  currentOperatingMode: OrderMode;
  mobileView: 'menu' | 'cart' | 'payment';
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  testMode: boolean;
  setTestMode: (testMode: boolean) => void;
  paymentStatus: 'idle' | 'processing' | 'success' | 'error';
  removeFromCart: (foodItemId: string) => void;
  updateCartItem: (foodItemId: string, quantity: number, notes?: string) => void;
  handlePayment: (orderId: string) => void;
  cancelPayment: () => void;
  onMobileViewChange?: (view: 'menu') => void;

  // Keypad state
  showMobileKeypad: boolean;
  setShowMobileKeypad: React.Dispatch<React.SetStateAction<boolean>>;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  activeOrder,
  currentOperatingMode,
  mobileView,
  phoneNumber,
  setPhoneNumber,
  testMode,
  paymentStatus,
  removeFromCart,
  updateCartItem,
  handlePayment,
  cancelPayment,
  onMobileViewChange,
  showMobileKeypad,
  setShowMobileKeypad,
}) => {
  const activeCart = useMemo(() => activeOrder?.cart || [], [activeOrder]);
  
  const { subtotal, vatAmount, cateringLevy, total } = useMemo(() => {
    const subtotal = activeCart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
    const vatAmount = subtotal * 0.16; // 16% VAT
    const cateringLevy = subtotal * 0.02; // 2% Catering Levy
    const total = subtotal + vatAmount + cateringLevy;
    return { subtotal, vatAmount, cateringLevy, total };
  }, [activeCart]);

  return (
    <div className={`w-full lg:w-80 bg-slate-100 flex flex-col h-full shadow-lg relative
      ${mobileView === 'cart' ? 'block' : 'hidden'} lg:block 
      ${(currentOperatingMode === 'tab' && !activeOrder) ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* Keypad Modal - Positioned independently */}
      {showMobileKeypad && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 md:p-4">
          <div className="w-full h-full md:w-full md:max-w-md md:h-auto bg-white flex flex-col md:rounded-xl md:shadow-2xl overflow-hidden md:max-h-[90vh] pb-20 md:pb-0">
            <MobileKeypad 
              value={phoneNumber} 
              onChange={setPhoneNumber} 
              onSubmit={() => {
                if (activeOrder) handlePayment(activeOrder.id);
                setShowMobileKeypad(false);
              }}
              onClose={() => setShowMobileKeypad(false)}
            />
          </div>
        </div>
      )}

      {/* Payment Success Status - If shown, takes its own space */}
      {paymentStatus === 'success' && (
        <div className="flex-shrink-0 bg-emerald-50 border-b border-emerald-200 p-3 sm:p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-800">Payment Complete</h3>
              <p className="text-sm text-emerald-700">Order successfully paid.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200 bg-white">
        <h2 className="text-lg font-semibold text-slate-800">
          {currentOperatingMode === 'tab' && !activeOrder ? 'Cart (No Tab)' : 'Order Summary'}
        </h2>
        {activeOrder && activeOrder.customerName && (
          <p className="text-sm text-slate-600">
            For: {activeOrder.customerName}
          </p>
        )}
      </div>
      
      {/* Main Content: Cart Items or Empty Message - With bottom padding for footer */}
      <div className="flex-1 bg-slate-50 overflow-y-auto pb-32">
        {activeCart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-slate-300 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <p className="text-slate-500 text-lg font-medium mb-2">Your cart is empty</p>
            <p className="text-sm text-slate-400 mb-6">Add items from the menu to get started.</p>
            {onMobileViewChange && (
              <button
                onClick={() => onMobileViewChange('menu')}
                className="lg:hidden bg-sky-600 text-white px-6 py-2.5 rounded-lg hover:bg-sky-700 transition-colors shadow-md text-sm font-medium"
              >
                Browse Menu
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {activeCart.map((item: CartItem) => (
              <div key={item.foodItemId} className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2.5">
                  <div className="flex-1 pr-2">
                    <h4 className="font-medium text-slate-800 text-sm leading-tight">{item.foodItem.name}</h4>
                    <p className="text-xs text-slate-500">KSh {item.foodItem.price.toFixed(2)} each</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.foodItemId)}
                    className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 transition-colors flex-shrink-0"
                    aria-label="Remove item"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-md border border-slate-200">
                    <button
                      onClick={() => updateCartItem(item.foodItemId, Math.max(1, item.quantity - 1))}
                      className="w-7 h-7 rounded flex items-center justify-center text-md font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium text-slate-800 min-w-[1.25rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItem(item.foodItemId, item.quantity + 1)}
                      className="w-7 h-7 rounded flex items-center justify-center text-md font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">
                    KSh {(item.foodItem.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Total and Checkout Buttons - ABSOLUTELY POSITIONED AT BOTTOM */}
      {activeCart.length > 0 && (
        <div className="absolute bottom-20 md:bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 space-y-3">
          <div className="space-y-2 pb-2 border-b border-dashed border-slate-300">
            <div className="flex justify-between items-center text-sm">
              <p className="text-slate-500">Subtotal</p>
              <p className="font-medium">KSh {subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center text-sm">
              <p className="text-slate-500">VAT (16%)</p>
              <p className="font-medium">KSh {vatAmount.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center text-sm">
              <p className="text-slate-500">Catering Levy (2%)</p>
              <p className="font-medium">KSh {cateringLevy.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-semibold text-slate-800">Total:</span>
            <span className="text-xl font-bold text-slate-900">
              KSh {total.toFixed(2)}
            </span>
          </div>

          {/* Payment Status Indicators - MOVED HERE (Above Buttons, Below Total) */}
          {paymentStatus === 'processing' && (
            <div className="text-sm text-sky-600 text-center bg-sky-50 p-3 rounded-lg border border-sky-100">
              <div className="flex items-center justify-center mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500 mr-2"></div>
                Awaiting M-Pesa payment on phone...
              </div>
              <button
                onClick={cancelPayment}
                className="bg-gray-500 text-white px-4 py-1.5 rounded-md hover:bg-gray-600 transition-colors text-xs"
              >
                Cancel Payment
              </button>
            </div>
          )}
          {paymentStatus === 'error' && activeOrder && (
            <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-100">
              Payment failed or cancelled. Please try again.
            </div>
          )}
          {/* Note: A success message could also go here if needed for this specific context */}
          
          {/* Checkout Buttons */}
          <div className="space-y-3 pt-1"> {/* Added pt-1 for a little space if status is shown */}
            <button
              onClick={() => {
                if (!activeOrder) return;
                setShowMobileKeypad(true); 
              }}
              disabled={!activeOrder || paymentStatus === 'processing'}
              className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
              <span className="text-center">
                {paymentStatus === 'processing' ? 'Processing...' : `Checkout KSh ${total.toFixed(2)}`}
              </span>
            </button>

            <button
              disabled 
              className="w-full flex items-center justify-center bg-slate-200 text-slate-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z" />
              </svg>
              <span className="text-center">Pay with Card</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSidebar; 