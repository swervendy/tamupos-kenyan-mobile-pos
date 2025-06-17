import React, { createContext, useContext, useReducer, ReactNode, useMemo, useCallback } from 'react';
import { OrderState, OrderAction, FoodItem, CartItem, Order, OrderStatus } from '../types';
import { orderReducer, initialState } from '../reducers/orderReducer';
import { apiService } from '../services/api';

interface OrderContextType {
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
  
  // --- Actions for ResponsiveOrderLayout --- 
  // Cart actions (operate on the active order)
  addToCart: (foodItem: FoodItem, quantity?: number, notes?: string) => void;
  removeFromCart: (foodItemId: string) => void;
  updateCartItemQuantity: (foodItemId: string, quantity: number, notes?: string) => void;
  clearActiveOrderCart: () => void;
  
  // Order creation and selection
  createNewTab: (customerName: string) => Promise<void>;
  createNewTableOrder: (tableNumber: string | number) => Promise<void>;
  selectOrder: (orderId: string) => void;
  clearActiveOrderSelection: () => void;
  completeOrder: (orderId: string, status: OrderStatus) => void;

  // For initializing menu data (e.g., from API)
  setFoodItems: (items: FoodItem[]) => void;
  setCategories: (categories: string[]) => void;
  setOrders: (orders: Order[]) => void;
  // If direct order creation/initialization is needed, can add:
  // initializeOrder: (order: Order) => void; // Dispatches CREATE_ORDER
  
  // --- Selectors / Computed values ---
  activeOrder: Order | null;
  openTabs: Order[];
  openTables: Order[];
  activeCartTotal: number;
  activeCartItemCount: number;
  // foodItems and categories are directly available from state.foodItems, state.categories
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // --- Action Dispatchers (memoized) ---
  const addToCart = useCallback((foodItem: FoodItem, quantity: number = 1, notes?: string) => {
    if (!state.activeOrderId) { 
      console.warn("addToCart failed: No active order selected."); 
      return; 
    }
    dispatch({ type: 'ADD_TO_CART', payload: { foodItem, quantity, notes } });
  }, [state.activeOrderId]);

  const removeFromCart = useCallback((foodItemId: string) => {
    if (!state.activeOrderId) { 
      console.warn("removeFromCart failed: No active order selected."); 
      return; 
    }
    dispatch({ type: 'REMOVE_FROM_CART', payload: { foodItemId } });
  }, [state.activeOrderId]);

  const updateCartItemQuantity = useCallback((foodItemId: string, quantity: number, notes?: string) => {
    if (!state.activeOrderId) { 
      console.warn("updateCartItemQuantity failed: No active order selected."); 
      return; 
    }
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { foodItemId, quantity, notes } });
  }, [state.activeOrderId]);

  const clearActiveOrderCart = useCallback(() => {
    if (!state.activeOrderId) { 
      console.warn("clearActiveOrderCart failed: No active order selected."); 
      return; 
    }
    dispatch({ type: 'CLEAR_CART' });
  }, [state.activeOrderId]);

  const createNewTab = useCallback(async (customerName: string) => {
    try {
      console.log(`Creating new tab for customer: ${customerName}`);
      const createdOrder = await apiService.createTab(customerName);
      console.log(`Tab created successfully:`, createdOrder);
      
      // Add the created order from the database to our local state
      dispatch({ type: 'CREATE_ORDER', payload: createdOrder });
      // Set it as the active order
      dispatch({ type: 'SELECT_ORDER', payload: { orderId: createdOrder.id } });
    } catch (error) {
      console.error("Error creating new tab:", error);
      throw error; // Re-throw so the UI can handle the error
    }
  }, []);

  const createNewTableOrder = useCallback(async (tableNumber: string | number) => {
    try {
      console.log(`Creating new table order for table: ${tableNumber}`);
      const createdOrder = await apiService.createTableOrder(tableNumber);
      console.log(`Table order created successfully:`, createdOrder);
      
      // Add the created order from the database to our local state
      dispatch({ type: 'CREATE_ORDER', payload: createdOrder });
      // Set it as the active order
      dispatch({ type: 'SELECT_ORDER', payload: { orderId: createdOrder.id } });
    } catch (error) {
      console.error("Error creating new table order:", error);
      throw error; // Re-throw so the UI can handle the error
    }
  }, []);

  const selectOrder = useCallback((orderId: string) => {
    dispatch({ type: 'SELECT_ORDER', payload: { orderId } });
  }, []);

  const clearActiveOrderSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_ACTIVE_ORDER' });
  }, []);

  const completeOrder = useCallback((orderId: string, status: OrderStatus) => {
    dispatch({ type: 'COMPLETE_ORDER', payload: { orderId, status } });
  }, []);

  const setFoodItems = useCallback((items: FoodItem[]) => {
    dispatch({ type: 'SET_FOOD_ITEMS', payload: items });
  }, []);

  const setCategories = useCallback((categories: string[]) => {
    dispatch({ type: 'SET_CATEGORIES', payload: categories });
  }, []);

  const setOrders = useCallback((orders: Order[]) => {
    dispatch({ type: 'SET_ORDERS', payload: orders });
  }, []);

  // --- Selectors / Computed Values (memoized) ---
  const activeOrder = useMemo(() => {
    if (!state.activeOrderId) return null;
    return state.allOrders.find(order => order.id === state.activeOrderId) || null;
  }, [state.activeOrderId, state.allOrders]);

  const openTabs = useMemo(() => {
    return state.allOrders.filter(order => order.mode === 'tab' && order.status === 'OPEN');
  }, [state.allOrders]);

  const openTables = useMemo(() => {
    return state.allOrders.filter(order => order.mode === 'table' && order.status === 'OPEN');
  }, [state.allOrders]);

  const activeCart = useMemo(() => activeOrder?.cart || [], [activeOrder]);

  const activeCartTotal = useMemo(() => {
    return activeCart.reduce(
      (total, item) => total + (item.foodItem.price * item.quantity),
      0
    );
  }, [activeCart]);

  const activeCartItemCount = useMemo(() => {
    return activeCart.reduce(
      (count, item) => count + item.quantity,
      0
    );
  }, [activeCart]);

  const value: OrderContextType = useMemo(() => ({
    state,
    dispatch,
    // Actions
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearActiveOrderCart,
    createNewTab,
    createNewTableOrder,
    selectOrder,
    clearActiveOrderSelection,
    completeOrder,
    setFoodItems,
    setCategories,
    setOrders,
    // initializeOrder, 
    // Selectors
    activeOrder,
    openTabs,
    openTables,
    activeCartTotal,
    activeCartItemCount
  }), [
    state, dispatch,
    addToCart, removeFromCart, updateCartItemQuantity, clearActiveOrderCart,
    createNewTab, createNewTableOrder, selectOrder, clearActiveOrderSelection, completeOrder,
    setFoodItems, setCategories, setOrders, /* initializeOrder, */
    activeOrder, openTabs, openTables, activeCartTotal, activeCartItemCount
  ]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}; 