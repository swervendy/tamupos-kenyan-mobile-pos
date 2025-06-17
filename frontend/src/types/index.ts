export interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  available: boolean;
  // dietaryTags?: string[]; // e.g., vegetarian, gluten-free
  // allergens?: string[];
}

export interface CartItem {
  foodItemId: string;
  foodItem: FoodItem; // Embed the full FoodItem for easier access
  quantity: number;
  notes?: string;
}

// New Order type
export type OrderMode = 'takeAway' | 'delivery' | 'table' | 'tab';

export type OrderStatus = 'OPEN' | 'PENDING_PAYMENT' | 'PAID' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string; // Unique order ID
  mode: OrderMode;
  cart: CartItem[];
  status: OrderStatus;
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
  customerName?: string; // For 'tab' and potentially 'delivery'/'takeAway'
  tableNumber?: string;  // For 'table' mode
  // Delivery specific fields
  deliveryAddress?: string;
  deliveryContact?: string;
  deliveryInstructions?: string;
  // Financial details
  subtotalAmount: number; // Sum of (item.price * item.quantity) for all items in cart
  vatAmount: number;      // VAT calculated on the subtotalAmount
  cateringLevyAmount: number; // 2% levy on subtotal
  totalAmount: number;    // subtotalAmount + vatAmount (and any other applicable charges in future)
  // Payment related
  paidAmount?: number;
  paymentMethod?: string; // e.g., 'mpesa', 'card', 'cash'
  transactionId?: string; // For M-Pesa or card payments
}

export interface Tab {
  id: string;
  customerName: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
}

export interface Table {
  id: string;
  tableNumber: number;
  items: CartItem[];
  total: number;
  occupied: boolean;
  createdAt: Date;
}

export interface OrderState {
  allOrders: Order[]; 
  activeOrderId: string | null; 
  // Add foodItems and categories here to match the reducer's state
  foodItems: FoodItem[];
  categories: string[];
}

// Potentially an AppState or POSState that combines OrderState with other states
// export interface AppState {
//   menu: {
//     foodItems: FoodItem[];
//     categories: string[];
//   };
//   orders: OrderState;
//   ui: {
//     currentOperatingMode: OrderMode; // Moved from POSInterface internal state to a more global UI state
//     // ... other UI related states
//   };
//   // ...
// }

// You'll likely have functions in your state logic like:
// getActiveOrder(): Order | null;
// getOpenTabs(): Order[];
// getOpenTables(): Order[];
// createNewTab(customerName: string): Order;
// selectOrder(orderId: string): void;
// addItemToActiveOrder(foodItem: FoodItem): void;
// etc.

export type OrderAction =
  | { type: 'ADD_TO_CART'; payload: { foodItem: FoodItem; quantity?: number; notes?: string } }
  | { type: 'REMOVE_FROM_CART'; payload: { foodItemId: string } }
  | { type: 'UPDATE_CART_ITEM'; payload: { foodItemId: string; quantity: number; notes?: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'CREATE_TAB'; payload: { customerName: string } }
  | { type: 'CREATE_TABLE'; payload: { tableNumber: string | number } }
  | { type: 'SELECT_ORDER'; payload: { orderId: string } }
  | { type: 'CLEAR_ACTIVE_ORDER' }
  | { type: 'COMPLETE_ORDER'; payload: { orderId: string; status: OrderStatus } }
  | { type: 'CREATE_ORDER'; payload: Order }
  | { type: 'SET_FOOD_ITEMS'; payload: FoodItem[] }
  | { type: 'SET_CATEGORIES'; payload: string[] }
  | { type: 'SET_ORDERS'; payload: Order[] };

// User Role and Permission Types for Menu Management access control
export type UserRole = 'admin' | 'manager' | 'staff';

export interface UserPermissions {
  canManageMenu: boolean;
  canManageOrders: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
}

// Menu Management specific types
export interface MenuItemCreateRequest {
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  available: boolean;
}

export interface MenuItemUpdateRequest extends Partial<MenuItemCreateRequest> {
  id: string;
}

// Authentication types
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurantId: string;
  defaultMode?: OrderMode;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  restaurantName: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
} 