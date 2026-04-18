import axios from 'axios';
import type {
  AuthDto,
  CartDto,
  Category,
  CustomerReportDto,
  DashboardStats,
  DiscountReportDto,
  ExtendedDashboardDto,
  InventoryReportDto,
  OrderDto,
  PaginatedProducts,
  Product,
  ProductFilters,
  ProductVariant,
  ProfitReportDto,
  SalesReportDto,
  ShippingReportDto,
  StockMovementReportDto,
  TopProductsReportDto,
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

export const getProduct = (id: number) =>
  api.get<Product>(`/products/${id}`).then((r) => r.data);

export const getProductBySlug = (slug: string) =>
  api.get<Product>(`/products/slug/${slug}`).then((r) => r.data);

export const createProduct = (data: object) =>
  api.post<Product>('/products', data).then((r) => r.data);

export const updateProduct = (id: number, data: object) =>
  api.put<Product>(`/products/${id}`, data).then((r) => r.data);

export const deleteProduct = (id: number) =>
  api.delete(`/products/${id}`).then((r) => r.data);

// Categories
export const getCategories = () =>
  api.get<Category[]>('/categories').then((r) => r.data);

export const getCategory = (id: number) =>
  api.get<Category>(`/categories/${id}`).then((r) => r.data);

// Cart
export const getCart = (sessionId?: string) =>
  api.get<CartDto>('/cart', { params: sessionId ? { sessionId } : {} }).then((r) => r.data);

export const addToCart = (
  item: { productId: number; variantId?: number; size: string; color?: string; jerseyType?: string; quantity: number },
  sessionId?: string,
) => api.post<CartDto>('/cart', { ...item, sessionId }).then((r) => r.data);

export const updateCartItem = (itemId: number, quantity: number, sessionId?: string) =>
  api.put<CartDto>(`/cart/${itemId}`, { quantity, sessionId }).then((r) => r.data);

export const removeFromCart = (itemId: number, sessionId?: string) =>
  api
    .delete<CartDto>(`/cart/${itemId}`, { params: sessionId ? { sessionId } : {} })
    .then((r) => r.data);

export const clearCart = (sessionId?: string) =>
  api
    .delete<CartDto>('/cart', { params: sessionId ? { sessionId } : {} })
    .then((r) => r.data);

// Orders
export const createOrder = (data: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: number; // 0=BKash, 1=Nagad, 2=CashOnDelivery
  transactionId?: string;
  sessionId?: string;
  notes?: string;
  items: { productId: number; variantId?: number; size: string; color?: string; jerseyType?: string; quantity: number }[];
}) => api.post<OrderDto>('/orders', data).then((r) => r.data);

export const getOrderByNumber = (orderNumber: string) =>
  api.get<OrderDto>(`/orders/number/${orderNumber}`).then((r) => r.data);

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

export const getOrders = (params?: { status?: string; page?: number; pageSize?: number }) =>
  api.get<PaginatedProducts>('/admin/orders', { params }).then((r) => r.data);

export const updateOrderStatus = (id: number, status: number) =>
  api.put<OrderDto>(`/admin/orders/${id}/status`, { status }).then((r) => r.data);

export const verifyPayment = (id: number, data: { paymentStatus: number; transactionId?: string }) =>
  api.put<OrderDto>(`/admin/orders/${id}/verify-payment`, data).then((r) => r.data);

// Admin – Variant management
export const getVariants = (productId: number) =>
  api.get<ProductVariant[]>(`/admin/products/${productId}/variants`).then((r) => r.data);

export const addVariant = (productId: number, data: object) =>
  api.post<ProductVariant>(`/admin/products/${productId}/variants`, data).then((r) => r.data);

export const updateVariant = (productId: number, variantId: number, data: object) =>
  api.put<ProductVariant>(`/admin/products/${productId}/variants/${variantId}`, data).then((r) => r.data);

export const deleteVariant = (productId: number, variantId: number) =>
  api.delete(`/admin/products/${productId}/variants/${variantId}`).then((r) => r.data);

// Reports
type DateParams = { from?: string; to?: string };

export const getExtendedDashboard = () =>
  api.get<ExtendedDashboardDto>('/reports/dashboard').then((r) => r.data);

export const getSalesReport = (params?: DateParams) =>
  api.get<SalesReportDto>('/reports/sales', { params }).then((r) => r.data);

export const getProfitReport = (params?: DateParams) =>
  api.get<ProfitReportDto>('/reports/profit', { params }).then((r) => r.data);

export const getInventoryReport = () =>
  api.get<InventoryReportDto>('/reports/inventory').then((r) => r.data);

export const getStockMovementReport = (params?: DateParams) =>
  api.get<StockMovementReportDto>('/reports/stock-movements', { params }).then((r) => r.data);

export const getDiscountReport = (params?: DateParams) =>
  api.get<DiscountReportDto>('/reports/discounts', { params }).then((r) => r.data);

export const getShippingReport = (params?: DateParams) =>
  api.get<ShippingReportDto>('/reports/shipping', { params }).then((r) => r.data);

export const getTopProductsReport = (params?: DateParams & { top?: number }) =>
  api.get<TopProductsReportDto>('/reports/top-products', { params }).then((r) => r.data);

export const getCustomerReport = (params?: DateParams) =>
  api.get<CustomerReportDto>('/reports/customers', { params }).then((r) => r.data);

export default api;
