namespace EshopJu.Application.DTOs;

// ── Shared ────────────────────────────────────────────────────────────────────

public class ReportFilterDto
{
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
}

// ── Sales Report ──────────────────────────────────────────────────────────────

public class SalesReportDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalSubTotal { get; set; }
    public decimal TotalDiscounts { get; set; }
    public decimal TotalShipping { get; set; }
    public int TotalOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    public List<SalesByDayDto> ByDay { get; set; } = new();
    public List<SalesByPaymentMethodDto> ByPaymentMethod { get; set; } = new();
    public List<SalesByStatusDto> ByStatus { get; set; } = new();
}

public class SalesByDayDto
{
    public string Date { get; set; } = string.Empty;
    public int Orders { get; set; }
    public decimal Revenue { get; set; }
}

public class SalesByPaymentMethodDto
{
    public string PaymentMethod { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Revenue { get; set; }
}

public class SalesByStatusDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Revenue { get; set; }
}

// ── Profit Report ─────────────────────────────────────────────────────────────

public class ProfitReportDto
{
    public decimal TotalRevenue { get; set; }
    public decimal TotalCost { get; set; }
    public decimal TotalDiscounts { get; set; }
    public decimal TotalShippingCollected { get; set; }
    public decimal GrossProfit { get; set; }
    public decimal NetProfit { get; set; }
    public decimal ProfitMarginPercent { get; set; }
    public List<ProfitByProductDto> ByProduct { get; set; } = new();
}

public class ProfitByProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal Revenue { get; set; }
    public decimal Cost { get; set; }
    public decimal GrossProfit { get; set; }
    public decimal ProfitMarginPercent { get; set; }
}

// ── Inventory Report ──────────────────────────────────────────────────────────

public class InventoryReportDto
{
    public int TotalVariants { get; set; }
    public int LowStockVariants { get; set; }
    public int OutOfStockVariants { get; set; }
    public decimal TotalStockValue { get; set; }
    public List<InventoryReportItemDto> Items { get; set; } = new();
}

public class InventoryReportItemDto
{
    public int VariantId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string JerseyType { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; }
    public bool IsLowStock { get; set; }
    public bool IsOutOfStock { get; set; }
    public decimal LastPurchasePrice { get; set; }
    public decimal StockValue { get; set; }
}

// ── Stock Movement Report ─────────────────────────────────────────────────────

public class StockMovementReportDto
{
    public int TotalIn { get; set; }
    public int TotalOut { get; set; }
    public int TotalAdjustment { get; set; }
    public List<StockMovementReportItemDto> Movements { get; set; } = new();
}

public class StockMovementReportItemDto
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantLabel { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string MovementType { get; set; } = string.Empty;
    public string ReferenceType { get; set; } = string.Empty;
    public int? ReferenceId { get; set; }
    public string? Notes { get; set; }
    public DateTime Date { get; set; }
}

// ── Discount & Coupon Report ──────────────────────────────────────────────────

public class DiscountReportDto
{
    public decimal TotalDiscountGiven { get; set; }
    public int TotalOrdersWithDiscount { get; set; }
    public List<CouponUsageDto> CouponUsage { get; set; } = new();
    public List<DiscountBySourceDto> BySource { get; set; } = new();
}

public class CouponUsageDto
{
    public string CouponCode { get; set; } = string.Empty;
    public int UsageCount { get; set; }
    public decimal TotalDiscountGiven { get; set; }
    public decimal RevenueImpact { get; set; }
}

public class DiscountBySourceDto
{
    public string Source { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal TotalAmount { get; set; }
}

// ── Shipping Report ───────────────────────────────────────────────────────────

public class ShippingReportDto
{
    public decimal TotalShippingCollected { get; set; }
    public int TotalOrdersWithShipping { get; set; }
    public int FreeShippingOrders { get; set; }
    public List<ShippingByZoneDto> ByZone { get; set; } = new();
    public List<ShippingByMethodDto> ByMethod { get; set; } = new();
}

public class ShippingByZoneDto
{
    public string ZoneName { get; set; } = string.Empty;
    public int DeliveryCount { get; set; }
    public decimal TotalCollected { get; set; }
}

public class ShippingByMethodDto
{
    public string MethodName { get; set; } = string.Empty;
    public int DeliveryCount { get; set; }
    public decimal TotalCollected { get; set; }
}

// ── Top Products Report ───────────────────────────────────────────────────────

public class TopProductsReportDto
{
    public List<TopProductReportItemDto> Products { get; set; } = new();
    public List<TopVariantReportItemDto> Variants { get; set; } = new();
}

public class TopProductReportItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int TotalSold { get; set; }
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}

public class TopVariantReportItemDto
{
    public int VariantId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantLabel { get; set; } = string.Empty;
    public int TotalSold { get; set; }
    public decimal Revenue { get; set; }
}

// ── Customer Report ───────────────────────────────────────────────────────────

public class CustomerReportDto
{
    public int TotalCustomers { get; set; }
    public int NewCustomers { get; set; }
    public int RepeatCustomers { get; set; }
    public int GuestOrderCount { get; set; }
    public List<TopBuyerDto> TopBuyers { get; set; } = new();
}

public class TopBuyerDto
{
    public int? UserId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public int OrderCount { get; set; }
    public decimal TotalSpent { get; set; }
}

// ── Extended Dashboard ────────────────────────────────────────────────────────

public class ExtendedDashboardDto
{
    // KPI cards
    public decimal TotalRevenue { get; set; }
    public decimal TodayRevenue { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal MonthlyProfit { get; set; }
    public decimal AverageOrderValue { get; set; }
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public int TotalProducts { get; set; }
    public int LowStockProducts { get; set; }
    public int TotalCustomers { get; set; }

    // Charts
    public List<SalesByDayDto> SalesTrend { get; set; } = new();
    public List<TopProductDto> TopProducts { get; set; } = new();
    public List<SalesByPaymentMethodDto> PaymentMethodBreakdown { get; set; } = new();

    // Tables
    public List<RecentOrderDto> RecentOrders { get; set; } = new();
    public List<InventoryVariantDto> LowStockItems { get; set; } = new();
}
