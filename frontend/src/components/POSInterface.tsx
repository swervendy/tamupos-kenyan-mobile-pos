import React, { useState, useEffect, useCallback } from 'react';
import { useOrder } from '../contexts/OrderContext';
import { Order, OrderMode as GlobalOrderMode, MenuItemCreateRequest, MenuItemUpdateRequest } from '../types';
import { apiService } from '../services/api';
import { usePayment } from '../hooks/usePayment';
import ResponsiveOrderLayout from './ResponsiveOrderLayout';
import SettingsPage from './SettingsPage';
import MenuManagementPage from './MenuManagementPage';
import PastOrdersPage from './PastOrdersPage';
import ReceiptModal from './ReceiptModal';

interface POSInterfaceProps {
  mode: GlobalOrderMode;
  onNavigateToModeSelector: () => void;
  
  // Available Operating Modes Configuration
  tabModeEnabled: boolean;
  setTabModeEnabled: (enabled: boolean) => void;
  tableModeEnabled: boolean;
  setTableModeEnabled: (enabled: boolean) => void;
  takeAwayModeEnabled: boolean;
  setTakeAwayModeEnabled: (enabled: boolean) => void;
}

const POSInterface: React.FC<POSInterfaceProps> = ({ 
  mode, 
  onNavigateToModeSelector,
  // Available Operating Modes Configuration
  tabModeEnabled,
  setTabModeEnabled,
  tableModeEnabled,
  setTableModeEnabled,
  takeAwayModeEnabled,
  setTakeAwayModeEnabled,
}) => {
  const {
    state,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    createNewTab,
    selectOrder,
    clearActiveOrderSelection,
    completeOrder,
    setFoodItems,
    setCategories,
    setOrders,
    activeOrder,
    openTabs,
  } = useOrder();

  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [showMenuImages, setShowMenuImages] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenuManagement, setShowMenuManagement] = useState(false);
  const [showPastOrders, setShowPastOrders] = useState(false);

  // Restaurant & Receipt Configuration State
  const [restaurantName, setRestaurantName] = useState("Peponi's");
  const [restaurantAddress, setRestaurantAddress] = useState('Peponi Rd. and Thigiri Ridge Rd');
  const [restaurantPhone, setRestaurantPhone] = useState('0734567123');
  const [kraPin, setKraPin] = useState('P002456789M');
  const [mpesaPaybill, setMpesaPaybill] = useState('522100'); // Example, to be used as Paybill

  // New state for receipt modal
  const [receiptOrderData, setReceiptOrderData] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // New state to control ResponsiveOrderLayout's main view
  const [responsiveLayoutView, setResponsiveLayoutView] = useState<'open_tabs' | 'menu'>(
    mode === 'tab' ? 'open_tabs' : 'menu'
  );

  // Effect to synchronize responsiveLayoutView with mode changes
  useEffect(() => {
    setResponsiveLayoutView(mode === 'tab' ? 'open_tabs' : 'menu');
  }, [mode]);

  // Define the callback for usePayment with useCallback for stability
  const onPaymentSuccessForReceiptCallback = useCallback((orderForReceipt: Order) => {
    setReceiptOrderData(orderForReceipt);
    setShowReceiptModal(true);
  }, [setReceiptOrderData, setShowReceiptModal]); // Added dependencies

  // Use the payment hook to handle all payment logic
  const {
    status: paymentStatus,
    phoneNumber,
    testMode,
    setPhoneNumber,
    setTestMode,
    handlePayment,
    cancelPayment,
    resetPayment,
  } = usePayment(
    activeOrder,
    completeOrder,
    onPaymentSuccessForReceiptCallback // Pass the memoized callback
  );

  const [showMobileKeypad, setShowMobileKeypad] = useState(false);

  // For demo purposes - in real app this would come from auth context
  const userCanManageMenu = true; // Set to true for demo

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingMenu(true);
        const [categoriesData, itemsData] = await Promise.all([
          apiService.getCategories(),
          apiService.getFoodItems()
        ]);
        setCategories(categoriesData);
        
        // Transform backend food items to match frontend format
        const transformedItems = itemsData.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category?.name || item.category, // Handle both object and string
          description: item.description,
          imageUrl: item.imageUrl,
          available: item.available
        }));
        
        setFoodItems(transformedItems);

        // Load existing orders from database
        try {
          const openOrders = await apiService.getOrders('OPEN');
          const pendingOrders = await apiService.getOrders('PENDING_PAYMENT');
          const allOpenOrders = [...openOrders, ...pendingOrders];
          
          if (allOpenOrders.length > 0) {
            console.log(`Loaded ${allOpenOrders.length} existing orders from database`);
            setOrders(allOpenOrders);
            
            // For tab mode, auto-select the first open tab if no active order is set
            if (mode === 'tab') {
              const firstOpenTab = allOpenOrders.find(order => order.mode === 'tab');
              if (firstOpenTab && !state.activeOrderId) {
                console.log(`Auto-selecting first open tab: ${firstOpenTab.customerName} (${firstOpenTab.id})`);
                selectOrder(firstOpenTab.id);
              }
            }
          }
        } catch (orderError) {
          console.warn('Failed to load existing orders:', orderError);
          // Don't fail the entire load process if orders can't be loaded
        }

      } catch (error) {
        console.error('Failed to load initial menu data:', error);
      } finally {
        setIsLoadingMenu(false);
      }
    };
    loadInitialData();
  }, [setCategories, setFoodItems, setOrders, selectOrder, mode, state.activeOrderId, showPastOrders]);

  // Settings navigation handlers
  const handleNavigateToSettings = () => {
    setShowSettings(true);
    setShowPastOrders(false);
    setShowMenuManagement(false);
  };

  const handleBackFromSettings = () => {
    setShowSettings(false);
    // When backing from settings, ROL should show what it was showing before,
    // or default based on mode. responsiveLayoutView isn't changed here intentionally.
  };

  const handleNavigateToTabs = () => {
    setShowSettings(false);
    setShowMenuManagement(false);
    setShowPastOrders(false);
    setResponsiveLayoutView('open_tabs');
  };

  const handleBack = () => {
    // If we are in the 'menu' view, pressing back should take us to the 'open_tabs' view.
    if (responsiveLayoutView === 'menu') {
      setResponsiveLayoutView('open_tabs');
    }
    // If we are already at the 'open_tabs' view, then back should go to the main mode selector.
    else if (responsiveLayoutView === 'open_tabs') {
      onNavigateToModeSelector();
    }
    // Fallback for any other case
    else {
      onNavigateToModeSelector();
    }
  };

  const handleCancelTab = async (orderId: string) => {
    try {
      await apiService.cancelOrder(orderId);
      // Remove the cancelled order from the local state to update the UI
      setOrders(state.allOrders.filter(order => order.id !== orderId));
      // If the cancelled order was the active one, clear it
      if (activeOrder?.id === orderId) {
        clearActiveOrderSelection();
      }
    } catch (error) {
      console.error('Failed to cancel tab:', error);
      // Optionally show an error message to the user
    }
  };

  const handleNavigateToMenu = () => {
    setShowSettings(false);
    setShowMenuManagement(false);
    setShowPastOrders(false);
    setResponsiveLayoutView('menu');
  };

  // Menu Management navigation handlers
  const handleNavigateToMenuManagement = () => {
    setShowMenuManagement(true);
    setShowSettings(false);
    setShowPastOrders(false);
  };

  const handleBackFromMenuManagement = () => {
    setShowMenuManagement(false);
    setResponsiveLayoutView('menu'); // When coming back from menu management, show main menu
  };

  const handleNavigateToPastOrders = () => {
    setShowPastOrders(true);
    setShowSettings(false);
    setShowMenuManagement(false);
  };

  const handleBackFromPastOrders = () => {
    setShowPastOrders(false);
    setResponsiveLayoutView(mode === 'tab' && activeOrder ? 'menu' : (mode === 'tab' ? 'open_tabs' : 'menu'));
  };

  // Function to handle closing the receipt modal
  const handleCloseReceipt = () => {
    setShowReceiptModal(false);
    resetPayment(); // Reset payment UI state (phone number, status, etc.)
    
    // If the order that was shown on the receipt is now completed or paid,
    // clear it from being the active selection and navigate.
    if (receiptOrderData && (receiptOrderData.status === 'COMPLETED' || receiptOrderData.status === 'PAID')) {
      clearActiveOrderSelection(); 
    }

    // Navigate to open tabs if in tab mode, otherwise, the view will update based on cleared active order.
    if (mode === 'tab') {
      setResponsiveLayoutView('open_tabs');
    }
    setReceiptOrderData(null); // Clear the receipt data last
  };

  // Menu item CRUD operations
  const handleAddMenuItem = async (item: MenuItemCreateRequest) => {
    try {
      const newItemResponse = await apiService.createFoodItem(item);
      
      // Transform the response to match frontend format
      const transformedItem = {
        id: newItemResponse.id,
        name: newItemResponse.name,
        price: newItemResponse.price,
        category: (newItemResponse as any).category?.name || newItemResponse.category,
        description: newItemResponse.description,
        imageUrl: newItemResponse.imageUrl,
        available: newItemResponse.available
      };
      
      setFoodItems([...state.foodItems, transformedItem]);
    } catch (error) {
      console.error('Failed to add menu item:', error);
      // In a real app, show user-friendly error message
    }
  };

  const handleUpdateMenuItem = async (item: MenuItemUpdateRequest) => {
    try {
      const updatedItemResponse = await apiService.updateFoodItem(item.id, item);
      
      // Transform the response to match frontend format
      const transformedItem = {
        id: updatedItemResponse.id,
        name: updatedItemResponse.name,
        price: updatedItemResponse.price,
        category: (updatedItemResponse as any).category?.name || updatedItemResponse.category,
        description: updatedItemResponse.description,
        imageUrl: updatedItemResponse.imageUrl,
        available: updatedItemResponse.available
      };
      
      setFoodItems(state.foodItems.map(existing => 
        existing.id === item.id ? transformedItem : existing
      ));
    } catch (error) {
      console.error('Failed to update menu item:', error);
      // In a real app, show user-friendly error message
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      await apiService.deleteFoodItem(itemId);
      setFoodItems(state.foodItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      // In a real app, show user-friendly error message
    }
  };

  if (isLoadingMenu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Point of Sale...</p>
        </div>
      </div>
    );
  }

  // Show settings page
  if (showSettings) {
    return (
      <SettingsPage
        testMode={testMode}
        setTestMode={setTestMode}
        showMenuImages={showMenuImages}
        setShowMenuImages={setShowMenuImages}
        onBack={handleBackFromSettings}
        onNavigateToModeSelector={onNavigateToModeSelector}
        currentMode={mode}
        onNavigateToMenu={handleNavigateToMenu}
        onNavigateToMenuManagement={userCanManageMenu ? handleNavigateToMenuManagement : undefined}
        onNavigateToPastOrders={handleNavigateToPastOrders}
        // Restaurant settings props
        restaurantName={restaurantName}
        setRestaurantName={setRestaurantName}
        restaurantAddress={restaurantAddress}
        setRestaurantAddress={setRestaurantAddress}
        restaurantPhone={restaurantPhone}
        setRestaurantPhone={setRestaurantPhone}
        kraPin={kraPin}
        setKraPin={setKraPin}
        mpesaPaybill={mpesaPaybill}
        setMpesaPaybill={setMpesaPaybill}
        // Available Modes Config
        tabModeEnabled={tabModeEnabled}
        setTabModeEnabled={setTabModeEnabled}
        tableModeEnabled={tableModeEnabled}
        setTableModeEnabled={setTableModeEnabled}
        takeAwayModeEnabled={takeAwayModeEnabled}
        setTakeAwayModeEnabled={setTakeAwayModeEnabled}
      />
    );
  }

  // Show menu management page
  if (showMenuManagement && userCanManageMenu) {
    return (
      <MenuManagementPage
        foodItems={state.foodItems}
        categories={state.categories}
        onAddMenuItem={handleAddMenuItem}
        onUpdateMenuItem={handleUpdateMenuItem}
        onDeleteMenuItem={handleDeleteMenuItem}
        onBack={handleBackFromMenuManagement}
        onNavigateToModeSelector={onNavigateToModeSelector}
        currentMode={mode}
        onNavigateToMenu={handleNavigateToMenu}
        onNavigateToSettings={handleNavigateToSettings}
        onNavigateToMenuManagement={userCanManageMenu ? handleNavigateToMenuManagement : undefined}
        onNavigateToPastOrders={handleNavigateToPastOrders}
        userCanManageMenu={userCanManageMenu}
      />
    );
  }

  if (showPastOrders) {
    return (
      <PastOrdersPage
        onBack={handleBackFromPastOrders}
        onNavigateToModeSelector={onNavigateToModeSelector}
        currentOperatingMode={mode}
        onNavigateToMenu={handleNavigateToMenu}
        onNavigateToTabs={handleNavigateToTabs}
        onNavigateToSettings={handleNavigateToSettings}
        onNavigateToMenuManagement={userCanManageMenu ? handleNavigateToMenuManagement : undefined}
        onNavigateToPastOrders={handleNavigateToPastOrders}
      />
    );
  }

  return (
    <>
      {/* TODO: Mobile Layout needs proper integration with new order context
          For now, showing desktop layout on all screen sizes */}
      {/* <div className="lg:hidden">
        <MobileLayout 
          mode={mode}
          onBack={onBack}
        />
      </div> */}
      
      {/* Desktop Layout - now showing on all screen sizes temporarily */}
      <div>
        <ResponsiveOrderLayout
          currentOperatingMode={mode}
          activeOrder={activeOrder}
          openTabs={openTabs}
          
          selectOrder={selectOrder}
          createNewTab={createNewTab}
          clearActiveOrder={clearActiveOrderSelection}

          categories={state.categories}
          foodItems={state.foodItems}

          handleAddToCart={addToCart}
          removeFromCart={removeFromCart}
          updateCartItem={updateCartItemQuantity}
          
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          handlePayment={handlePayment}
          cancelPayment={cancelPayment}
          paymentStatus={paymentStatus}
          
          testMode={testMode}
          setTestMode={setTestMode}
          showMenuImages={showMenuImages}
          onNavigateToModeSelector={onNavigateToModeSelector}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToMenuManagement={userCanManageMenu ? handleNavigateToMenuManagement : undefined}
          onNavigateToPastOrders={handleNavigateToPastOrders}

          showMobileKeypad={showMobileKeypad}
          setShowMobileKeypad={setShowMobileKeypad}
          // New props for managing view
          viewToShow={responsiveLayoutView}
          onViewChange={setResponsiveLayoutView}
          onCancelTab={handleCancelTab}
          onBack={handleBack}
        />
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        order={receiptOrderData}
        onClose={handleCloseReceipt}
        restaurantName={restaurantName}
        restaurantAddress={restaurantAddress}
        restaurantPhone={restaurantPhone}
        kraPin={kraPin}
        mpesaPaybill={mpesaPaybill}
      />
    </>
  );
};

export default POSInterface; 