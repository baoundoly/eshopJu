export interface ProductVariant {
  id: number;
  color: string;
  jerseyType: string; // "home" | "away" | "third" | "notApplicable"
  size: string;
  stockQuantity: number;
  sku?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  team?: string;
  category?: Category;
  categoryId: number;
  categoryName: string;
  description?: string;
  price: number;
  discountPrice?: number;
  totalStock: number;
  color?: string;
  jerseyType: string;
  images: string[];
  primaryImage?: string;
  variants: ProductVariant[];
  colors: string[];
  types: string[];
  isFeatured: boolean;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface CartItemDto {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  variantId?: number;
  size: string;
  color?: string;
  jerseyType?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartDto {
  id: number;
  items: CartItemDto[];
  totalAmount: number;
  itemCount: number;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  variantId?: number;
  size: string;
  color?: string;
  jerseyType?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItemDto[];
  subTotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: string; // "bKash" | "nagad" | "cashOnDelivery"
  paymentStatus: string; // "pending" | "verified" | "rejected"
  transactionId?: string;
  status: string; // "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  notes?: string;
  createdAt: string;
}

export interface AuthDto {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'customer';
  };
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  todayRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  recentOrders: RecentOrderStats[];
  topProducts: TopProductStats[];
}

export interface RecentOrderStats {
  id: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface TopProductStats {
  id: number;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  team?: string;
  color?: string;
  jerseyType?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  isFeatured?: boolean;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedProducts {
  items: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

