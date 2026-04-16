import axios from 'axios';
import type {
  AuthDto,
  CartDto,
  Category,
  DashboardStats,
  OrderDto,
  PaginatedProducts,
  Product,
  ProductFilters,
} from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email: string, password: string) =>
  api.post<AuthDto>('/auth/login', { email, password }).then((r) => r.data);

export const register = (name: string, email: string, phone: string, password: string) =>
  api.post<AuthDto>('/auth/register', { name, email, phone, password }).then((r) => r.data);

// Products
export const getProducts = (filters: ProductFilters = {}) =>
  api.get<PaginatedProducts>('/products', { params: filters }).then((r) => r.data);

export const getFeatured = (count = 8) =>
  api.get<Product[]>('/products/featured', { params: { count } }).then((r) => r.data);

export const getProduct = (id: string) =>
  api.get<Product>(`/products/${id}`).then((r) => r.data);

export const getProductBySlug = (slug: string) =>
  api.get<Product>(`/products/slug/${slug}`).then((r) => r.data);

// Categories
export const getCategories = () =>
  api.get<Category[]>('/categories').then((r) => r.data);

export const getCategory = (id: string) =>
  api.get<Category>(`/categories/${id}`).then((r) => r.data);

// Cart
export const getCart = (sessionId?: string) =>
  api.get<CartDto>('/cart', { params: sessionId ? { sessionId } : {} }).then((r) => r.data);

export const addToCart = (
  item: { productId: string; size: string; quantity: number },
  sessionId?: string,
) => api.post<CartDto>('/cart', { ...item, sessionId }).then((r) => r.data);

export const updateCartItem = (itemId: string, quantity: number, sessionId?: string) =>
  api.put<CartDto>(`/cart/${itemId}`, { quantity, sessionId }).then((r) => r.data);

export const removeFromCart = (itemId: string, sessionId?: string) =>
  api
    .delete<CartDto>(`/cart/${itemId}`, { params: sessionId ? { sessionId } : {} })
    .then((r) => r.data);

export const clearCart = (sessionId?: string) =>
  api
    .delete<CartDto>('/cart', { params: sessionId ? { sessionId } : {} })
    .then((r) => r.data);

// Orders
export const createOrder = (data: {
  customer: { name: string; phone: string; address: string; email?: string };
  paymentMethod: string;
  transactionId?: string;
  sessionId?: string;
  notes?: string;
}) => api.post<OrderDto>('/orders', data).then((r) => r.data);

export const getOrderByNumber = (orderNumber: string) =>
  api.get<OrderDto>(`/orders/track/${orderNumber}`).then((r) => r.data);

export const generateWhatsAppLink = (data: {
  orderNumber: string;
  customerName: string;
  total: number;
}) => {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801XXXXXXXXX';
  const msg = encodeURIComponent(
    `Hi! I just placed Order #${data.orderNumber}.\nCustomer: ${data.customerName}\nTotal: ৳${data.total}\nPlease confirm my order.`,
  );
  return `https://wa.me/${phone}?text=${msg}`;
};

// Admin
export const getDashboard = () =>
  api.get<DashboardStats>('/admin/dashboard').then((r) => r.data);

export const getOrders = (params?: { status?: string; page?: number; limit?: number }) =>
  api.get<{ orders: OrderDto[]; total: number; pages: number }>('/admin/orders', { params }).then((r) => r.data);

export const updateOrderStatus = (id: string, status: string) =>
  api.put<OrderDto>(`/admin/orders/${id}/status`, { status }).then((r) => r.data);

export const verifyPayment = (id: string, data: { transactionId?: string }) =>
  api.put<OrderDto>(`/admin/orders/${id}/verify-payment`, data).then((r) => r.data);

export default api;
