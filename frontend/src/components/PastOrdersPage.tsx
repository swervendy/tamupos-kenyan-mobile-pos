import React, { useState, useMemo, useEffect } from 'react';
import { useOrder } from '../contexts/OrderContext';
import { Order, OrderStatus } from '../types';
import ReceiptModal from './ReceiptModal';
import LeftNavigationBar from './LeftNavigationBar';
import MobileNavigation from './MobileNavigation';
import { apiService } from '../services/api';

interface PastOrdersPageProps {
  onBack: () => void;
  onNavigateToModeSelector: () => void;
  currentOperatingMode: Order['mode'];
  onNavigateToMenu: () => void;
  onNavigateToTabs: () => void;
  onNavigateToSettings: () => void;
  onNavigateToMenuManagement?: () => void;
  onNavigateToPastOrders?: () => void;
}

const PastOrdersPage: React.FC<PastOrdersPageProps> = ({
  onBack,
  onNavigateToModeSelector,
  currentOperatingMode,
  onNavigateToMenu,
  onNavigateToTabs,
  onNavigateToSettings,
  onNavigateToMenuManagement,
  onNavigateToPastOrders,
}) => {
  const { state, setOrders } = useOrder();
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPastOrders = async () => {
      try {
        setIsLoading(true);
        const paidOrders = await apiService.getOrders('PAID');
        const completedOrders = await apiService.getOrders('COMPLETED');
        const cancelledOrders = await apiService.getOrders('CANCELLED');
        
        setOrders([...paidOrders, ...completedOrders, ...cancelledOrders]);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch past orders:", err);
        setError('Failed to load order history.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPastOrders();
  }, [setOrders]);

  const pastOrders = useMemo(() => {
    const validStatuses: OrderStatus[] = ['COMPLETED', 'PAID', 'CANCELLED'];
    return state.allOrders
      .filter(order => validStatuses.includes(order.status))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [state.allOrders]);

  const handleViewReceipt = (order: Order) => {
    setSelectedOrderForReceipt(order);
  };

  const handleCloseReceipt = () => {
    setSelectedOrderForReceipt(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 md:flex-row flex-col">
      {/* Desktop Navigation */}
      <div className="hidden md:block md:relative">
        <LeftNavigationBar
          onNavigateHome={onBack}
          currentMode={currentOperatingMode}
          activeSection="bills"
          onSelectMenu={onNavigateToMenu}
          onNavigateToSettings={onNavigateToSettings}
          onNavigateToMenuManagement={onNavigateToMenuManagement}
          onNavigateToPastOrders={onNavigateToPastOrders}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-slate-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="md:hidden text-gray-600 hover:text-gray-800 mr-2 p-2 rounded-md hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h1 className="text-xl text-slate-700 flex-1 truncate text-center">Past Orders</h1>
            <div className="w-10 md:hidden"></div> {/* Spacer for mobile */}
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto pb-20 md:pb-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">Loading order history...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-red-500">{error}</p>
            </div>
          ) : pastOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Past Orders</h2>
              <p className="text-gray-500 text-lg mb-8 max-w-md">
                Completed orders will appear here once you start processing payments.
              </p>
            </div>
          ) : (
            <ul className="space-y-3 sm:space-y-4">
              {pastOrders.map(order => (
                <li key={order.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex-1 mb-2 sm:mb-0">
                      <p className="text-sm font-medium text-cyan-600">ID: {order.id.substring(0, 8)}</p>
                      {order.customerName && <p className="text-slate-700 text-sm">Customer: {order.customerName}</p>}
                      {order.tableNumber && <p className="text-slate-700 text-sm">Table: {order.tableNumber}</p>}
                      <p className="text-xs text-slate-500">Date: {new Date(order.updatedAt).toLocaleString()}</p>
                      <p className={`text-xs font-semibold mt-1 px-2 py-0.5 inline-block rounded-full ${
                        order.status === 'COMPLETED' || order.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        Status: {order.status}
                      </p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                        <p className="text-base sm:text-lg font-semibold text-slate-800 whitespace-nowrap">KSh {order.totalAmount.toFixed(2)}</p>
                        <button 
                            onClick={() => handleViewReceipt(order)} 
                            className="w-full sm:w-auto bg-slate-500 hover:bg-slate-600 text-white text-xs sm:text-sm font-medium py-2 px-3 rounded-md transition-colors whitespace-nowrap">
                            View Receipt
                        </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ReceiptModal
        isOpen={!!selectedOrderForReceipt}
        order={selectedOrderForReceipt}
        onClose={handleCloseReceipt}
        restaurantName="Tamu Grill"
        restaurantAddress="123 Delicious St, Nairobi"
        restaurantPhone="0712345678"
        kraPin="A123456789B"
        mpesaPaybill="123456"
      />
      
      <MobileNavigation 
        currentView="past_orders"
        onNavigateTabs={onNavigateToTabs} 
        onNavigateMenu={onNavigateToMenu} 
        onNavigateToPastOrders={onNavigateToPastOrders || (() => {})}
        isMenuDisabled={false}
      />
    </div>
  );
};

export default PastOrdersPage; 