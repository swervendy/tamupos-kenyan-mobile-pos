import React, { useState } from 'react';
import { Order, OrderMode } from '../types';
import LeftNavigationBar from './LeftNavigationBar';
import MobileNavigation from './MobileNavigation';
import CreateTabModal from './CreateTabModal';

interface TabManagementViewProps {
  activeOrder: Order | null;
  openTabs: Order[];
  selectOrder: (orderId: string) => void;
  createNewTab: (customerName: string) => void;
  clearActiveOrder: () => void;
  onNavigateToModeSelector: () => void;
  onSelectMenu: () => void;
  onCheckoutMobile: (orderId: string) => void;
  onNavigateToSettings: () => void;
  onNavigateToMenuManagement?: () => void;
  onNavigateToPastOrders?: () => void;
  onCancelTab: (orderId: string) => void;
}

const TabManagementView: React.FC<TabManagementViewProps> = ({
  activeOrder,
  openTabs,
  selectOrder,
  createNewTab,
  clearActiveOrder,
  onNavigateToModeSelector,
  onSelectMenu,
  onCheckoutMobile,
  onNavigateToSettings,
  onNavigateToMenuManagement,
  onNavigateToPastOrders,
  onCancelTab,
}) => {
  const [isCreateTabModalOpen, setIsCreateTabModalOpen] = useState(false);

  const handleOpenCreateTabModal = () => setIsCreateTabModalOpen(true);
  const handleCloseCreateTabModal = () => setIsCreateTabModalOpen(false);

  const handleActualCreateNewTab = async (customerName: string) => {
    try {
      await createNewTab(customerName);
      handleCloseCreateTabModal();
      onSelectMenu();
    } catch (error) {
      console.error('Failed to create new tab:', error);
      // You could add error state and show error message to user here
      // For now, we'll just close the modal and let the user try again
      handleCloseCreateTabModal();
    }
  };

  const handleSelectOpenTabsView = () => {
    // This component is already the open tabs view
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-100">
      {/* Left Navigation Bar - Visible on md screens and up */}
      <div className="hidden md:block">
        <LeftNavigationBar 
          onNavigateHome={handleSelectOpenTabsView}
          currentMode={'tab' as OrderMode}
          activeSection="open_tabs"
          onSelectMenu={onSelectMenu}
          onNavigateToSettings={onNavigateToSettings}
          onNavigateToMenuManagement={onNavigateToMenuManagement}
          onNavigateToPastOrders={onNavigateToPastOrders}
        />
      </div>

      {/* Main Content Column (to the right of LeftNav on desktop/tablet) */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-20">
        {/* Header with Title (Back button removed for mobile to avoid confusion) */}
        <div className="p-4 bg-white shadow-md sticky top-0 z-10 md:relative md:shadow-none md:border-b md:border-slate-200">
          <div className="flex items-center justify-center">
            <h1 className="text-xl text-slate-700 text-center">Manage Tabs</h1>
          </div>
        </div>

        {/* Scrollable Content Area for Tabs or Empty State */}
        <div className="flex-1 flex flex-col p-4 md:p-6 md:pt-2 overflow-y-auto pb-20 md:pb-6"> {/* Adjusted md:pt-2 */}
          {openTabs.length > 0 ? (
            <>
              {/* Desktop "Create New Tab" Button - When tabs exist (bigger, right-aligned, below list) */}
              <div className="hidden md:flex justify-end py-3"> {/* py-3 for spacing */}
                <button 
                  onClick={handleOpenCreateTabModal}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors justify-center"
                >
                  Create New Tab
                </button>
              </div>

              {/* List of Open Tabs */}
              <div className="space-y-3 sm:space-y-4 flex-1"> {/* Added flex-1 for pushing button down if list is short */}
                {openTabs.map(tab => (
                  <div
                    key={tab.id}
                    onClick={() => { 
                      selectOrder(tab.id);
                      onSelectMenu();
                    }}
                    className={`w-full p-4 bg-white shadow rounded-lg transition-colors flex flex-row justify-between items-center border-2 cursor-pointer ${
                      activeOrder?.id === tab.id 
                        ? 'border-cyan-500 bg-cyan-50' 
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Left Side: Customer Name and Opened Time */}
                    <div className="flex-1 min-w-0 mr-3 sm:mr-4"> 
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-lg sm:text-xl font-bold truncate ${
                          activeOrder?.id === tab.id ? 'text-cyan-700' : 'text-gray-800'
                        }`}>
                          {tab.customerName}
                        </h3>
                        {activeOrder?.id === tab.id && (
                          <span className="bg-cyan-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        Opened: {new Date(tab.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Right Side: Details and Action Buttons */}
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0"> 
                      {tab.cart && typeof tab.totalAmount === 'number' && 
                        <div className="text-right mb-1 sm:mb-0">
                          <p className="text-sm text-gray-700">{tab.cart.length} items</p>
                          <p className="text-md sm:text-lg font-semibold text-gray-800">KSh {tab.totalAmount.toFixed(2)}</p>
                        </div>
                      }
                      
                      {/* Mobile Buttons (side-by-side) */}
                      <div className="sm:hidden w-full flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to cancel the tab for "${tab.customerName}"?`)) {
                              onCancelTab(tab.id);
                            }
                          }}
                          className="flex-1 py-2.5 px-4 border border-slate-300 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCheckoutMobile(tab.id);
                          }}
                          className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm whitespace-nowrap transition-colors shadow-sm hover:shadow-md"
                        >
                          Checkout
                        </button>
                      </div>

                      {/* Desktop Buttons (side-by-side, cancel on left) */}
                      <div className="hidden sm:flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to cancel the tab for "${tab.customerName}"?`)) {
                              onCancelTab(tab.id);
                            }
                          }}
                          className="py-2.5 px-4 border border-slate-300 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectOrder(tab.id);
                            onSelectMenu();
                          }}
                          className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm whitespace-nowrap transition-colors shadow-sm hover:shadow-md"
                        >
                          View Tab
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // EMPTY STATE: Centered content with big "Create Tab" button
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="mb-6">
                <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Open Tabs</h2>
              <p className="text-gray-500 text-lg mb-8 max-w-md">
                Get started by creating your first tab. You can manage multiple customer orders simultaneously.
              </p>
              <button
                onClick={handleOpenCreateTabModal}
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 transform hover:scale-105"
              >
                Create Tab
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Create New Tab Button - Fixed at bottom, above main navigation */}
      <div className="md:hidden fixed bottom-[76px] left-0 right-0 p-3 bg-white border-t border-slate-200 shadow-md z-20">
        <button 
          onClick={handleOpenCreateTabModal}
          className="w-full px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
        >
          Create New Tab
        </button>
      </div>

      {/* Standardized Mobile Navigation (md:hidden is handled within MobileNavigation itself) */}
      <MobileNavigation 
        currentView="tabs"
        onNavigateTabs={handleSelectOpenTabsView}
        onNavigateMenu={onSelectMenu}
        onNavigateToPastOrders={onNavigateToPastOrders || (() => {})}
        isMenuDisabled={!activeOrder}
      />

      {/* Create Tab Modal */}
      <CreateTabModal 
        isOpen={isCreateTabModalOpen}
        onClose={handleCloseCreateTabModal}
        onCreateTab={handleActualCreateNewTab}
      />
    </div>
  );
};

export default TabManagementView; 