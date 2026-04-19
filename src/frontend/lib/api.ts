import axios from 'axios';
import type {
  AuthDto,
  CartDto,
  Category,
  CouponDto,
  CouponValidationResultDto,
  CustomerReportDto,
  DashboardStats,
  DiscountReportDto,
  DiscountRuleDto,
  ExtendedDashboardDto,
  InventoryDashboardDto,
  InventoryReportDto,
  InventoryVariantDto,
  OrderDto,
  PagedResult,
  PaginatedProducts,
  Product,
  ProductFilters,
  ProductVariant,
  ProfitReportDto,
  SalesReportDto,
  ShippingMethodDto,
  ShippingOptionDto,
  ShippingRateDto,
  ShippingReportDto,
  ShippingZoneDto,
  SlideDto,
  StockInDto,
  StockMovementDto,
  StockMovementReportDto,
  SupplierDto,
  TopProductsReportDto,
  UserProfileDto,
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

export const createCategory = (data: { name: string; description?: string; imageUrl?: string }) =>
  api.post<Category>('/categories', data).then((r) => r.data);

export const updateCategory = (id: number, data: { name: string; description?: string; imageUrl?: string; isActive: boolean }) =>
  api.put<Category>(`/categories/${id}`, data).then((r) => r.data);

export const deleteCategory = (id: number) =>
  api.delete(`/categories/${id}`).then((r) => r.data);

// Cart
const sessionHeaders = (sessionId?: string) =>
  sessionId ? { headers: { 'X-Session-Id': sessionId } } : {};

export const getCart = (sessionId?: string) =>
  api.get<CartDto>('/cart', sessionHeaders(sessionId)).then((r) => r.data);

export const addToCart = (
  item: { productId: number; variantId?: number; size: string; color?: string; jerseyType?: string; quantity: number },
  sessionId?: string,
) => api.post<CartDto>('/cart/items', item, sessionHeaders(sessionId)).then((r) => r.data);

export const updateCartItem = (itemId: number, quantity: number, sessionId?: string) =>
  api.put<CartDto>(`/cart/items/${itemId}`, { quantity }, sessionHeaders(sessionId)).then((r) => r.data);

export const removeFromCart = (itemId: number, sessionId?: string) =>
  api.delete<CartDto>(`/cart/items/${itemId}`, sessionHeaders(sessionId)).then((r) => r.data);

export const clearCart = (sessionId?: string) =>
  api.delete<CartDto>('/cart', sessionHeaders(sessionId)).then((r) => r.data);

// Orders
export const createOrder = (data: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district?: string;
  thana?: string;
  shippingMethodId?: number;
  paymentMethod: number; // 0=BKash, 1=Nagad, 2=CashOnDelivery
  transactionId?: string;
  sessionId?: string;
  notes?: string;
  couponCode?: string;
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

// Coupons (Admin)
export const getCoupons = (params?: { page?: number; pageSize?: number }) =>
  api.get<PagedResult<CouponDto>>('/coupons', { params }).then((r) => r.data);

export const createCoupon = (data: object) =>
  api.post<CouponDto>('/coupons', data).then((r) => r.data);

export const updateCoupon = (id: number, data: object) =>
  api.put<CouponDto>(`/coupons/${id}`, data).then((r) => r.data);

export const deleteCoupon = (id: number) =>
  api.delete(`/coupons/${id}`).then((r) => r.data);

export const getDiscountRules = () =>
  api.get<DiscountRuleDto[]>('/coupons/rules').then((r) => r.data);

export const createDiscountRule = (data: object) =>
  api.post<DiscountRuleDto>('/coupons/rules', data).then((r) => r.data);

export const updateDiscountRule = (id: number, data: object) =>
  api.put<DiscountRuleDto>(`/coupons/rules/${id}`, data).then((r) => r.data);

export const deleteDiscountRule = (id: number) =>
  api.delete(`/coupons/rules/${id}`).then((r) => r.data);

export const validateCoupon = (code: string, orderAmount: number) =>
  api.post<CouponValidationResultDto>('/coupons/validate', { code, orderAmount }).then((r) => r.data);

// Shipping (Public)
export const getShippingOptions = (district: string, thana: string | undefined, orderAmount: number) =>
  api.post<ShippingOptionDto[]>('/shipping/options', { district, thana, orderAmount }).then((r) => r.data);

// Shipping (Admin)
export const getShippingZones = () =>
  api.get<ShippingZoneDto[]>('/shipping/zones').then((r) => r.data);

export const createShippingZone = (data: object) =>
  api.post<ShippingZoneDto>('/shipping/zones', data).then((r) => r.data);

export const updateShippingZone = (id: number, data: object) =>
  api.put<ShippingZoneDto>(`/shipping/zones/${id}`, data).then((r) => r.data);

export const deleteShippingZone = (id: number) =>
  api.delete(`/shipping/zones/${id}`).then((r) => r.data);

export const getShippingMethods = () =>
  api.get<ShippingMethodDto[]>('/shipping/methods').then((r) => r.data);

export const createShippingMethod = (data: object) =>
  api.post<ShippingMethodDto>('/shipping/methods', data).then((r) => r.data);

export const updateShippingMethod = (id: number, data: object) =>
  api.put<ShippingMethodDto>(`/shipping/methods/${id}`, data).then((r) => r.data);

export const deleteShippingMethod = (id: number) =>
  api.delete(`/shipping/methods/${id}`).then((r) => r.data);

export const getShippingRates = () =>
  api.get<ShippingRateDto[]>('/shipping/rates').then((r) => r.data);

export const createShippingRate = (data: object) =>
  api.post<ShippingRateDto>('/shipping/rates', data).then((r) => r.data);

export const updateShippingRate = (id: number, data: object) =>
  api.put<ShippingRateDto>(`/shipping/rates/${id}`, data).then((r) => r.data);

export const deleteShippingRate = (id: number) =>
  api.delete(`/shipping/rates/${id}`).then((r) => r.data);

// Inventory (Admin)
export const getInventoryDashboard = () =>
  api.get<InventoryDashboardDto>('/inventory/dashboard').then((r) => r.data);

export const getInventory = (productId?: number) =>
  api.get<InventoryVariantDto[]>('/inventory', { params: productId ? { productId } : {} }).then((r) => r.data);

export const getSuppliers = () =>
  api.get<SupplierDto[]>('/inventory/suppliers').then((r) => r.data);

export const createSupplier = (data: object) =>
  api.post<SupplierDto>('/inventory/suppliers', data).then((r) => r.data);

export const getStockIns = (params?: { page?: number; pageSize?: number }) =>
  api.get<PagedResult<StockInDto>>('/inventory/stock-in', { params }).then((r) => r.data);

export const addStock = (data: object) =>
  api.post<StockInDto>('/inventory/stock-in', data).then((r) => r.data);

export const adjustStock = (variantId: number, quantityChange: number, notes?: string) =>
  api.post<StockMovementDto>(`/inventory/variants/${variantId}/adjust`, { quantityChange, notes }).then((r) => r.data);

export const getStockHistory = (params?: { variantId?: number; productId?: number; page?: number; pageSize?: number }) =>
  api.get<PagedResult<StockMovementDto>>('/inventory/history', { params }).then((r) => r.data);

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

// Slides (public)
export const getActiveSlides = () =>
  api.get<SlideDto[]>('/slides').then((r) => r.data);

// Slides (admin)
export const getAllSlides = () =>
  api.get<SlideDto[]>('/slides/all').then((r) => r.data);

export const createSlide = (data: object) =>
  api.post<SlideDto>('/slides', data).then((r) => r.data);

export const updateSlide = (id: number, data: object) =>
  api.put<SlideDto>(`/slides/${id}`, data).then((r) => r.data);

export const deleteSlide = (id: number) =>
  api.delete(`/slides/${id}`).then((r) => r.data);

// Me – profile
export const getMyProfile = () =>
  api.get<UserProfileDto>('/me/profile').then((r) => r.data);

export const updateMyProfile = (data: { name?: string; phone?: string }) =>
  api.put<UserProfileDto>('/me/profile', data).then((r) => r.data);

export const changeMyPassword = (data: { currentPassword: string; newPassword: string }) =>
  api.put('/me/password', data).then((r) => r.data);

export default api;
