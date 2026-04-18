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

// ── Report types ─────────────────────────────────────────────────────────────

export interface SalesByDayDto { date: string; orders: number; revenue: number; }
export interface SalesByPaymentMethodDto { paymentMethod: string; count: number; revenue: number; }
export interface SalesByStatusDto { status: string; count: number; revenue: number; }

export interface SalesReportDto {
  totalRevenue: number;
  totalSubTotal: number;
  totalDiscounts: number;
  totalShipping: number;
  totalOrders: number;
  averageOrderValue: number;
  byDay: SalesByDayDto[];
  byPaymentMethod: SalesByPaymentMethodDto[];
  byStatus: SalesByStatusDto[];
}

export interface ProfitByProductDto {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  profitMarginPercent: number;
}

export interface ProfitReportDto {
  totalRevenue: number;
  totalCost: number;
  totalDiscounts: number;
  totalShippingCollected: number;
  grossProfit: number;
  netProfit: number;
  profitMarginPercent: number;
  byProduct: ProfitByProductDto[];
}

export interface InventoryReportItemDto {
  variantId: number;
  productId: number;
  productName: string;
  color: string;
  jerseyType: string;
  size: string;
  sku?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  lastPurchasePrice: number;
  stockValue: number;
}

export interface InventoryReportDto {
  totalVariants: number;
  lowStockVariants: number;
  outOfStockVariants: number;
  totalStockValue: number;
  items: InventoryReportItemDto[];
}

export interface StockMovementReportItemDto {
  id: number;
  productName: string;
  variantLabel: string;
  quantity: number;
  movementType: string;
  referenceType: string;
  referenceId?: number;
  notes?: string;
  date: string;
}

export interface StockMovementReportDto {
  totalIn: number;
  totalOut: number;
  totalAdjustment: number;
  movements: StockMovementReportItemDto[];
}

export interface CouponUsageDto { couponCode: string; usageCount: number; totalDiscountGiven: number; revenueImpact: number; }
export interface DiscountBySourceDto { source: string; count: number; totalAmount: number; }

export interface DiscountReportDto {
  totalDiscountGiven: number;
  totalOrdersWithDiscount: number;
  couponUsage: CouponUsageDto[];
  bySource: DiscountBySourceDto[];
}

export interface ShippingByZoneDto { zoneName: string; deliveryCount: number; totalCollected: number; }
export interface ShippingByMethodDto { methodName: string; deliveryCount: number; totalCollected: number; }

export interface ShippingReportDto {
  totalShippingCollected: number;
  totalOrdersWithShipping: number;
  freeShippingOrders: number;
  byZone: ShippingByZoneDto[];
  byMethod: ShippingByMethodDto[];
}

export interface TopProductReportItemDto {
  productId: number;
  productName: string;
  totalSold: number;
  revenue: number;
  orderCount: number;
}

export interface TopVariantReportItemDto {
  variantId: number;
  productId: number;
  productName: string;
  variantLabel: string;
  totalSold: number;
  revenue: number;
}

export interface TopProductsReportDto {
  products: TopProductReportItemDto[];
  variants: TopVariantReportItemDto[];
}

export interface TopBuyerDto {
  userId?: number;
  customerName: string;
  customerPhone: string;
  orderCount: number;
  totalSpent: number;
}

export interface CustomerReportDto {
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  guestOrderCount: number;
  topBuyers: TopBuyerDto[];
}

export interface ExtendedDashboardDto {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalProfit: number;
  monthlyProfit: number;
  averageOrderValue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  salesTrend: SalesByDayDto[];
  topProducts: TopProductStats[];
  paymentMethodBreakdown: SalesByPaymentMethodDto[];
  recentOrders: RecentOrderStats[];
  lowStockItems: InventoryVariantStats[];
}

export interface InventoryVariantStats {
  variantId: number;
  productId: number;
  productName: string;
  color: string;
  jerseyType: string;
  size: string;
  sku?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
}

