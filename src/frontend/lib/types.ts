export interface ProductSize {
  size: string;
  stock: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  team: string;
  category: Category | string;
  description?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  sizes: ProductSize[];
  featured: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  size: string;
  quantity: number;
  price: number;
}

export interface CartDto {
  _id: string;
  sessionId?: string;
  user?: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

export interface OrderItem {
  product: Product | string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export interface OrderDto {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: 'bkash' | 'nagad' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthDto {
  token: string;
  user: {
    _id: string;
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
  totalProducts: number;
  recentOrders: OrderDto[];
  topProducts: Array<{ product: Product; totalSold: number }>;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  team?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}
