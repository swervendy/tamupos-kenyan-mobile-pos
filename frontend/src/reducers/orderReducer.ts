import { v4 as uuidv4 } from 'uuid';
import { FoodItem, Order, OrderMode, OrderStatus, CartItem, OrderAction as GlobalOrderAction } from '../types';

// Define tax and levy rates
const VAT_RATE = 0.16; // 16%
const CATERING_LEVY_RATE = 0.02; // 2%

// Helper function to calculate order totals
const calculateOrderTotals = (cart: CartItem[]) => {
  const subtotalAmount = cart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
  const vatAmount = subtotalAmount * VAT_RATE;
  const cateringLevyAmount = subtotalAmount * CATERING_LEVY_RATE;
  const totalAmount = subtotalAmount + vatAmount + cateringLevyAmount;
  return { subtotalAmount, vatAmount, cateringLevyAmount, totalAmount };
};

export interface OrderState {
  allOrders: Order[];
  activeOrderId: string | null;
  foodItems: FoodItem[];
  categories: string[];
}

export const initialState: OrderState = {
  allOrders: [],
  activeOrderId: null,
  foodItems: [],
  categories: []
};

export const orderReducer = (state: OrderState, action: GlobalOrderAction): OrderState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      if (!state.activeOrderId) return state;
      const { foodItem, quantity = 1, notes } = action.payload;

      return {
        ...state,
        allOrders: state.allOrders.map(order => {
          if (order.id === state.activeOrderId) {
            const existingItemIndex = order.cart.findIndex(
              item => item.foodItemId === foodItem.id
            );
            let updatedCart;
            if (existingItemIndex >= 0) {
              updatedCart = [...order.cart];
              updatedCart[existingItemIndex] = {
                ...updatedCart[existingItemIndex],
                quantity: updatedCart[existingItemIndex].quantity + quantity,
                notes: notes || updatedCart[existingItemIndex].notes
              };
            } else {
              updatedCart = [
                ...order.cart,
                { foodItemId: foodItem.id, foodItem, quantity, notes } as CartItem
              ];
            }
            const { subtotalAmount, vatAmount, cateringLevyAmount, totalAmount } = calculateOrderTotals(updatedCart);
            return { ...order, cart: updatedCart, subtotalAmount, vatAmount, cateringLevyAmount, totalAmount, updatedAt: Date.now() };
          }
          return order;
        })
      };
    }

    case 'REMOVE_FROM_CART': {
      if (!state.activeOrderId) return state;
      const { foodItemId } = action.payload;
      return {
        ...state,
        allOrders: state.allOrders.map(order => {
          if (order.id === state.activeOrderId) {
            const updatedCart = order.cart.filter(
              item => item.foodItemId !== foodItemId
            );
            const { subtotalAmount, vatAmount, cateringLevyAmount, totalAmount } = calculateOrderTotals(updatedCart);
            return { ...order, cart: updatedCart, subtotalAmount, vatAmount, cateringLevyAmount, totalAmount, updatedAt: Date.now() };
          }
          return order;
        })
      };
    }

    case 'UPDATE_CART_ITEM': {
      if (!state.activeOrderId) return state;
      const { foodItemId, quantity, notes } = action.payload;
      return {
        ...state,
        allOrders: state.allOrders.map(order => {
          if (order.id === state.activeOrderId) {
            const updatedCart = order.cart.map(item =>
              item.foodItemId === foodItemId
                ? { ...item, quantity, notes: notes !== undefined ? notes : item.notes }
                : item
            ).filter(item => item.quantity > 0);
            const { subtotalAmount, vatAmount, cateringLevyAmount, totalAmount } = calculateOrderTotals(updatedCart);
            return { ...order, cart: updatedCart, subtotalAmount, vatAmount, cateringLevyAmount, totalAmount, updatedAt: Date.now() };
          }
          return order;
        })
      };
    }

    case 'CLEAR_CART': {
      if (!state.activeOrderId) return state;
      return {
        ...state,
        allOrders: state.allOrders.map(order =>
          order.id === state.activeOrderId
            ? { ...order, cart: [], subtotalAmount: 0, vatAmount: 0, cateringLevyAmount: 0, totalAmount: 0, updatedAt: Date.now() }
            : order
        )
      };
    }

    case 'CREATE_TAB': {
      const { customerName } = action.payload;
      const newOrder: Order = {
        id: uuidv4(),
        mode: 'tab',
        customerName,
        cart: [],
        status: 'OPEN',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        subtotalAmount: 0,
        vatAmount: 0,
        cateringLevyAmount: 0,
        totalAmount: 0,
      };
      return {
        ...state,
        allOrders: [...state.allOrders, newOrder],
        activeOrderId: newOrder.id
      };
    }

    case 'CREATE_TABLE': {
      const { tableNumber } = action.payload;
      const newOrder: Order = {
        id: uuidv4(),
        mode: 'table',
        tableNumber: String(tableNumber),
        cart: [],
        status: 'OPEN',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        subtotalAmount: 0,
        vatAmount: 0,
        cateringLevyAmount: 0,
        totalAmount: 0,
      };
      return {
        ...state,
        allOrders: [...state.allOrders, newOrder],
        activeOrderId: newOrder.id,
      };
    }

    case 'SELECT_ORDER': {
      const orderId = (action.payload as { orderId: string }).orderId;
      if (state.allOrders.find(o => o.id === orderId)) {
        return { ...state, activeOrderId: orderId };
      }
      return state;
    }

    case 'CLEAR_ACTIVE_ORDER': {
      return { ...state, activeOrderId: null };
    }

    case 'COMPLETE_ORDER': {
      const payload = action.payload as { orderId: string, status: OrderStatus };
      return {
        ...state,
        allOrders: state.allOrders.map(order => 
          order.id === payload.orderId 
            ? { ...order, status: payload.status, updatedAt: Date.now() }
            : order
        ),
        activeOrderId: state.activeOrderId === payload.orderId ? null : state.activeOrderId
      };
    }

    case 'CREATE_ORDER': {
      const newOrder = action.payload as Order;
      if (state.allOrders.find(o => o.id === newOrder.id)) return state;
      return {
        ...state,
        allOrders: [...state.allOrders, newOrder]
      };
    }

    case 'SET_FOOD_ITEMS': {
      return { ...state, foodItems: action.payload as FoodItem[] };
    }

    case 'SET_CATEGORIES': {
      return { ...state, categories: action.payload as string[] };
    }

    case 'SET_ORDERS': {
      return { ...state, allOrders: action.payload as Order[] };
    }

    default:
      const unknownAction = action as any;
      if (unknownAction.type) {
        console.warn(`Unhandled action type: ${unknownAction.type}`);
      }
      return state;
  }
}; 