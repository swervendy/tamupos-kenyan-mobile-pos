import React, { memo, useState, useMemo } from 'react';
// import { FiHome, FiMenu, FiFileText, FiTag, FiSettings } from 'react-icons/fi'; // Old icons
// import { HomeIcon, Bars3Icon, DocumentTextIcon, TagIcon, Cog6ToothIcon } from 'react-icons/hi2/outline'; // Attempted Heroicons v2
// import { HiOutlineHome, HiOutlineMenu, HiOutlineDocumentText, HiOutlineTag, HiOutlineCog } from 'react-icons/hi'; // Icons moved to LeftNavigationBar
import { FoodItem, Order, OrderMode as GlobalOrderMode } from '../types';
// import { OrderMode } from './POSInterface'; // This might be deprecated if types/index.ts has the primary OrderMode
import LeftNavigationBar from './LeftNavigationBar'; // Import the new component
import TabManagementView from './TabManagementView';
import MenuSection from './MenuSection';
import CartSidebar from './CartSidebar';
import MobileNavigation from './MobileNavigation';
import { useMediaQuery } from 'react-responsive';

// Helper function to get emoji for category
const getCategoryEmoji = (categoryName: string): string => {
  switch (categoryName.toLowerCase()) {
    case 'burgers': return '🍔';
    case 'pizza': return '🍕';
    case 'drinks':
    case 'beverages': // Added alias for drinks
    case 'appetizers':
    case 'main course':
      return '🍽️'; // Shared emoji for these categories
    case 'desserts': return '🍰';
    case 'salads': return '🥗';
    case 'sides': return '🍟';
    default: return '🍲'; // Default food emoji (changed to a steaming bowl for more variety)
  }
};

interface ResponsiveOrderLayoutProps {
  // New props for multi-order management
  currentOperatingMode: GlobalOrderMode;
  activeOrder: Order | null; // The currently active order object
  openTabs: Order[]; // For displaying in tab management view
  
  // Functions from parent state management
  selectOrder: (orderId: string) => void;
  createNewTab: (customerName: string) => void; // Should ideally return the new Order or its ID to auto-select
  clearActiveOrder: () => void; // To go back to tab/table selection view

  // Menu related (assuming these are still passed or derived globally)
  categories: string[];
  foodItems: FoodItem[]; // All available food items

  // Cart actions (now operate on the activeOrder via context, so orderId is not needed from here)
  handleAddToCart: (item: FoodItem, quantity?: number, notes?: string) => void;
  removeFromCart: (foodItemId: string) => void;
  updateCartItem: (foodItemId: string, quantity: number, notes?: string) => void;
  
  // Payment related (operates on activeOrder)
  phoneNumber: string; 
  setPhoneNumber: (phone: string) => void;
  handlePayment: (orderId: string) => void; // Payment might still need orderId if POSInterface handles it externally
  cancelPayment: () => void; // Function to cancel ongoing payment
  paymentStatus: 'idle' | 'processing' | 'success' | 'error';

  // Test mode for development
  testMode: boolean;
  setTestMode: (testMode: boolean) => void;

  // Menu settings
  showMenuImages: boolean;

  // General UI
  // onBack: () => void; // Replaced by clearActiveOrder for Tab mode context
  // getModeIcon and getModeTitle are no longer used for the main title
  onNavigateToModeSelector: () => void; // Added new prop for navigation
  onNavigateToSettings: () => void; // Added new prop for settings navigation
  onNavigateToMenuManagement?: () => void; // Added new prop for menu management navigation
  onNavigateToPastOrders?: () => void; // Add this prop for Past Orders navigation

  // Keypad state
  showMobileKeypad: boolean;
  setShowMobileKeypad: React.Dispatch<React.SetStateAction<boolean>>;

  // View control props from POSInterface
  viewToShow: 'open_tabs' | 'menu';
  onViewChange: (view: 'open_tabs' | 'menu') => void;

  // New props for Tab Management View
  onCancelTab: (orderId: string) => void;

  // New props for Back button
  onBack: () => void;
}

// type TabViewSection = 'open_tabs' | 'menu'; // No longer needed

const ResponsiveOrderLayout: React.FC<ResponsiveOrderLayoutProps> = memo(({
  currentOperatingMode,
  activeOrder,
  openTabs,
  selectOrder,
  createNewTab,
  clearActiveOrder,
  categories,
  foodItems,
  handleAddToCart,
  removeFromCart,
  updateCartItem,
  phoneNumber,
  setPhoneNumber,
  handlePayment,
  cancelPayment,
  paymentStatus,
  testMode,
  setTestMode,
  showMenuImages,
  onNavigateToModeSelector,
  onNavigateToSettings,
  onNavigateToMenuManagement,
  onNavigateToPastOrders,
  showMobileKeypad,
  setShowMobileKeypad,
  viewToShow,
  onViewChange,
  onCancelTab,
  onBack,
}) => {
  const [mobileView, setMobileView] = useState<'menu' | 'cart' | 'payment'>('menu');
  // const [currentViewSection, setCurrentViewSection] = useState<TabViewSection>(
  //   currentOperatingMode === 'tab' ? 'open_tabs' : 'menu'
  // ); // Removed internal state, will use viewToShow prop

  // useEffect(() => {
  //   setCurrentViewSection(currentOperatingMode === 'tab' ? 'open_tabs' : 'menu');
  // }, [currentOperatingMode]); // Removed this effect

  const activeCart = useMemo(() => activeOrder?.cart || [], [activeOrder]);

  // Calculate total quantity for cart badge
  const totalCartItems = useMemo(() => {
    return activeCart.reduce((total, item) => total + item.quantity, 0);
  }, [activeCart]);

  const handleSelectOpenTabsView = () => {
    // setCurrentViewSection('open_tabs');
    onViewChange('open_tabs'); // Call prop to change view
  };
  
  const handleSelectMenuView = () => {
    // setCurrentViewSection('menu');
    onViewChange('menu'); // Call prop to change view
    setMobileView('menu');
  };

  const handleGoToCartForTab = (orderId: string) => {
    selectOrder(orderId);
    // setCurrentViewSection('menu');
    onViewChange('menu'); // Call prop to change view
    setMobileView('cart');
  };

  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Tab Management View
  if (currentOperatingMode === 'tab' && viewToShow === 'open_tabs') {
    return (
      <TabManagementView
        activeOrder={activeOrder}
        openTabs={openTabs}
        selectOrder={selectOrder}
        createNewTab={createNewTab}
        clearActiveOrder={clearActiveOrder}
        onNavigateToModeSelector={onNavigateToModeSelector}
        onSelectMenu={handleSelectMenuView}
        onCheckoutMobile={handleGoToCartForTab}
        onNavigateToSettings={onNavigateToSettings}
        onNavigateToMenuManagement={onNavigateToMenuManagement}
        onNavigateToPastOrders={onNavigateToPastOrders}
        onCancelTab={onCancelTab}
      />
    );
  }
  
  // Loading/Empty State for non-Tab modes or when Menu view is selected but no active tab
  if (currentOperatingMode !== 'tab' && !activeOrder) {
    return (
      <div className="flex min-h-screen bg-slate-100 md:flex-row flex-col">
        <div className="hidden md:block md:relative">
          <LeftNavigationBar 
            onNavigateHome={clearActiveOrder}
            currentMode={currentOperatingMode}
            activeSection="menu"
            onSelectMenu={handleSelectMenuView}
            onNavigateToSettings={onNavigateToSettings}
            onNavigateToMenuManagement={onNavigateToMenuManagement}
            onNavigateToPastOrders={onNavigateToPastOrders}
          />
        </div>
        <div className="flex-1 flex flex-col md:flex-row md:ml-20">
          <div className="flex-1 flex flex-col p-6 justify-center items-center">
            <h1 className="text-2xl font-bold text-gray-700">
              Initializing {currentOperatingMode} order...
            </h1>
          </div>
          {/* Cart Sidebar - Empty state but consistent layout */}
          <div className="hidden md:block md:w-72 lg:w-80 md:h-full">
            <CartSidebar
              activeOrder={null}
              currentOperatingMode={currentOperatingMode}
              mobileView={mobileView}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              testMode={testMode}
              setTestMode={setTestMode}
              paymentStatus={paymentStatus}
              removeFromCart={removeFromCart}
              updateCartItem={updateCartItem}
              handlePayment={handlePayment}
              cancelPayment={cancelPayment}
              onMobileViewChange={setMobileView}
              showMobileKeypad={showMobileKeypad}
              setShowMobileKeypad={setShowMobileKeypad}
            />
          </div>
        </div>
      </div>
    );
  }

  // Main Order View / Menu View
  return (
    <div className="flex h-screen bg-slate-100 md:flex-row flex-col">
      <div className="hidden md:block md:relative">
        <LeftNavigationBar 
          onNavigateHome={currentOperatingMode === 'tab' ? handleSelectOpenTabsView : clearActiveOrder}
          currentMode={currentOperatingMode}
          activeSection={viewToShow}
          onSelectMenu={handleSelectMenuView}
          onNavigateToSettings={onNavigateToSettings}
          onNavigateToMenuManagement={onNavigateToMenuManagement}
          onNavigateToPastOrders={onNavigateToPastOrders}
        />
      </div>
      
      <div className="flex-1 flex flex-col md:ml-20 h-full">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-slate-200 p-3 sm:p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Mobile Back Button */}
            <button 
              onClick={() => {
                // Consistent back button behavior based on current state
                if (currentOperatingMode === 'tab') {
                  if (viewToShow === 'menu' && activeOrder) {
                    // From menu with active tab -> go to tabs view
                    handleSelectOpenTabsView();
                  } else {
                    // From tabs view -> go to mode selector
                    onNavigateToModeSelector();
                  }
                } else {
                  // For non-tab modes -> go to mode selector
                  onNavigateToModeSelector();
                }
              }}
              className="md:hidden text-gray-600 hover:text-gray-800 mr-2 p-2 rounded-md hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            <h1 className="text-xl text-slate-700 flex-1 truncate text-center">
              {currentOperatingMode === 'tab' ? 
                (activeOrder ? `Tab: ${activeOrder.customerName}` : "Menu (No Active Tab)") :
                (activeOrder ? `Order: ${activeOrder.customerName || activeOrder.id}`: `${currentOperatingMode} Mode`)
              }
            </h1>
            {/* Cart Icon Button - Mobile Only - Now md:hidden */}
            <button 
              onClick={() => setMobileView('cart')}
              className="md:hidden relative text-gray-600 hover:text-gray-800 ml-2 p-2 rounded-md hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                {/* Preferred Cart Icon with strokeWidth={1.5} */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9" />
              </svg>
              {activeCart.length > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main content area */}
        {currentOperatingMode === 'tab' && viewToShow === 'menu' && !activeOrder && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center py-12">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Active Tab Selected</h2>
            <p className="text-gray-500 text-lg mb-8 max-w-md">Please select an existing tab or create a new one to start adding items.</p>
            <button
              onClick={handleSelectOpenTabsView} // This now calls onViewChange('open_tabs')
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 transform hover:scale-105"
            >
              Go to Open Tabs
            </button>
          </div>
        )}

        {!(currentOperatingMode === 'tab' && viewToShow === 'menu' && !activeOrder) && (
          <div className="flex flex-1 flex-col md:flex-row h-full md:overflow-hidden">
            {/* Menu Section */}
            <div className={`${mobileView === 'menu' ? 'flex flex-1 flex-col overflow-y-auto' : 'hidden'} md:block md:flex-1 md:overflow-y-auto`}>
              <MenuSection
                categories={categories}
                foodItems={foodItems}
                currentOperatingMode={currentOperatingMode}
                hasActiveOrder={!!activeOrder}
                activeCart={activeCart}
                onAddToCart={handleAddToCart}
                updateCartItem={updateCartItem}
                removeFromCart={removeFromCart}
                showMenuImages={showMenuImages}
              />
            </div>

            {/* Cart Sidebar */}
            <div className={`md:w-72 lg:w-80 h-full ${mobileView === 'cart' || mobileView === 'payment' ? 'block' : 'hidden'} md:block`}>
              <CartSidebar
                activeOrder={activeOrder}
                currentOperatingMode={currentOperatingMode}
                mobileView={mobileView}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                testMode={testMode}
                setTestMode={setTestMode}
                paymentStatus={paymentStatus}
                removeFromCart={removeFromCart}
                updateCartItem={updateCartItem}
                handlePayment={handlePayment}
                cancelPayment={cancelPayment}
                onMobileViewChange={setMobileView}
                showMobileKeypad={showMobileKeypad}
                setShowMobileKeypad={setShowMobileKeypad}
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        <MobileNavigation
          currentView={
            // Determine current view based on the actual state
            currentOperatingMode === 'tab' && viewToShow === 'open_tabs' ? 'tabs' :
            'menu'
          }
          onNavigateTabs={currentOperatingMode === 'tab' ? handleSelectOpenTabsView : () => {
            // For non-tab modes, go back to tab selection or clear active order
            clearActiveOrder();
          }}
          onNavigateMenu={() => {
            // Ensure we're in menu view and have proper state
            if (currentOperatingMode === 'tab' && viewToShow === 'open_tabs') {
              handleSelectMenuView();
            } else {
              setMobileView('menu');
            }
          }}
          onNavigateToPastOrders={onNavigateToPastOrders || (() => {})}
          isMenuDisabled={false}
        />

        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-white shadow-md sticky top-0 z-10">
          <div className="flex items-center">
            {/* Conditional Back Button */}
            {(isMobile && viewToShow === 'menu' && currentOperatingMode === 'tab') && (
              <button 
                onClick={onBack}
                className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors mr-2"
                aria-label="Back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
            <h1 className="text-xl text-slate-800 font-semibold text-center flex-1">
              {viewToShow === 'menu' ? (activeOrder?.customerName || 'Menu') : 'Manage Tabs'}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ResponsiveOrderLayout;