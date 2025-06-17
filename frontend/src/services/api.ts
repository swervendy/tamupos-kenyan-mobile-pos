import axios from 'axios';
import { FoodItem, Order, LoginRequest, RegisterRequest, AuthResponse } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      // Optionally redirect to login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<{ message: string; userId: string }> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Categories
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  addCategory: async (name: string): Promise<void> => {
    await api.post('/categories', { name });
  },

  // Food Items
  getFoodItems: async (category?: string): Promise<FoodItem[]> => {
    const params = category ? { category } : {};
    const response = await api.get('/items', { params });
    return response.data;
  },

  addFoodItem: async (item: Omit<FoodItem, 'id' | 'available'>): Promise<FoodItem> => {
    const response = await api.post('/items', item);
    return response.data.item;
  },

  // Menu Management CRUD operations
  createFoodItem: async (item: Omit<FoodItem, 'id'>): Promise<FoodItem> => {
    const response = await api.post('/items', item);
    return response.data.item;
  },

  updateFoodItem: async (id: string, updates: Partial<FoodItem>): Promise<FoodItem> => {
    const response = await api.put(`/items/${id}`, updates);
    return response.data.item;
  },

  deleteFoodItem: async (id: string): Promise<void> => {
    await api.delete(`/items/${id}`);
  },

  // Orders
  getOrders: async (status?: string): Promise<Order[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/orders', { params });
    
    // Transform backend order format to frontend format
    return response.data.map((order: any) => ({
      ...order,
      // Convert backend mode format to frontend format
      mode: order.mode?.toLowerCase() || order.mode,
      // Transform 'items' array to 'cart' array to match frontend expectations
      cart: order.items ? order.items.map((item: any) => ({
        foodItemId: item.foodItem.id,
        foodItem: item.foodItem,
        quantity: item.quantity,
        notes: item.notes,
      })) : [],
      // Convert timestamps to numbers for frontend compatibility
      createdAt: new Date(order.createdAt).getTime(),
      updatedAt: new Date(order.updatedAt).getTime(),
    }));
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    const order = response.data;
    
    // Transform backend order format to frontend format
    return {
      ...order,
      // Convert backend mode format to frontend format
      mode: order.mode?.toLowerCase() || order.mode,
      // Transform 'items' array to 'cart' array to match frontend expectations
      cart: order.items ? order.items.map((item: any) => ({
        foodItemId: item.foodItem.id,
        foodItem: item.foodItem,
        quantity: item.quantity,
        notes: item.notes,
      })) : [],
      // Convert timestamps to numbers for frontend compatibility
      createdAt: new Date(order.createdAt).getTime(),
      updatedAt: new Date(order.updatedAt).getTime(),
    };
  },

  createOrder: async (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const response = await api.post('/orders', order);
    return response.data.order;
  },

  createTab: async (customerName: string): Promise<Order> => {
    const orderPayload = {
      mode: 'TAB',
      customerName,
      items: []
    };
    const response = await api.post('/orders', orderPayload);
    const order = response.data.order;
    
    // Transform backend order format to frontend format
    return {
      ...order,
      mode: 'tab', // Convert back to frontend format
      cart: order.items ? order.items.map((item: any) => ({
        foodItemId: item.foodItem.id,
        foodItem: item.foodItem,
        quantity: item.quantity,
        notes: item.notes,
      })) : [],
      createdAt: new Date(order.createdAt).getTime(),
      updatedAt: new Date(order.updatedAt).getTime(),
    };
  },

  createTableOrder: async (tableNumber: string | number): Promise<Order> => {
    const orderPayload = {
      mode: 'TABLE',
      tableNumber: String(tableNumber),
      items: []
    };
    const response = await api.post('/orders', orderPayload);
    const order = response.data.order;
    
    // Transform backend order format to frontend format
    return {
      ...order,
      mode: 'table', // Convert back to frontend format
      cart: order.items ? order.items.map((item: any) => ({
        foodItemId: item.foodItem.id,
        foodItem: item.foodItem,
        quantity: item.quantity,
        notes: item.notes,
      })) : [],
      createdAt: new Date(order.createdAt).getTime(),
      updatedAt: new Date(order.updatedAt).getTime(),
    };
  },

  updateOrder: async (id: string, updates: Partial<Order>): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, updates);
    return response.data.order;
  },

  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  cancelOrder: async (id: string): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data.order;
  },

  // Payments
  initiateSTKPush: async (phoneNumber: string, amount: number, orderId: string): Promise<any> => {
    const response = await api.post('/payments/stk-push', {
      phoneNumber,
      amount,
      orderId
    });
    return response.data;
  },

  queryPaymentStatus: async (checkoutRequestId: string): Promise<any> => {
    const response = await api.get(`/payments/status/${checkoutRequestId}`);
    return response.data;
  },

  // User Settings
  updateDefaultMode: async (defaultMode: string): Promise<{ message: string; user: any }> => {
    const response = await api.patch('/auth/default-mode', { defaultMode });
    return response.data;
  },
};

export default apiService; 