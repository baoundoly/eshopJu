using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using EshopJu.Core.Entities;
using EshopJu.Core.Enums;
using EshopJu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static (DateTime from, DateTime to) Normalize(ReportFilterDto filter)
    {
        var from = filter.From?.ToUniversalTime() ?? DateTime.MinValue;
        var to   = filter.To?.ToUniversalTime()   ?? DateTime.UtcNow;
        return (from, to);
    }

    // ── Extended Dashboard ────────────────────────────────────────────────────

    public async Task<ExtendedDashboardDto> GetExtendedDashboardAsync()
    {
        var now        = DateTime.UtcNow;
        var todayStart = now.Date;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var last30Days = now.AddDays(-30);

        var allDelivered = _context.Orders.Where(o => o.Status == OrderStatus.Delivered);

        var totalRevenue   = await allDelivered.SumAsync(o => (decimal?)o.TotalAmount)   ?? 0m;
        var todayRevenue   = await allDelivered.Where(o => o.CreatedAt >= todayStart).SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;
        var monthlyRevenue = await allDelivered.Where(o => o.CreatedAt >= monthStart).SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

        // Profit = Revenue - Cost - Discounts  (shipping already in TotalAmount)
        var deliveredItems = await _context.OrderItems
            .Where(oi => oi.Order.Status == OrderStatus.Delivered)
            .Include(oi => oi.Variant).ThenInclude(v => v!.StockInItems)
            .ToListAsync();

        var totalCost = deliveredItems.Sum(oi =>
        {
            var avgCost = GetAvgPurchasePrice(oi.Variant);
            return avgCost * oi.Quantity;
        });
        var totalDiscount = await allDelivered.SumAsync(o => (decimal?)o.DiscountAmount) ?? 0m;
        var totalProfit = totalRevenue - totalCost - totalDiscount;

        var monthlyItems = await _context.OrderItems
            .Where(oi => oi.Order.Status == OrderStatus.Delivered && oi.Order.CreatedAt >= monthStart)
            .Include(oi => oi.Variant).ThenInclude(v => v!.StockInItems)
            .ToListAsync();
        var monthlyCost = monthlyItems.Sum(oi => GetAvgPurchasePrice(oi.Variant) * oi.Quantity);
        var monthlyDiscount = await allDelivered.Where(o => o.CreatedAt >= monthStart).SumAsync(o => (decimal?)o.DiscountAmount) ?? 0m;
        var monthlyProfit = monthlyRevenue - monthlyCost - monthlyDiscount;

        var totalOrders   = await _context.Orders.CountAsync();
        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Pending);
        var aov = totalOrders > 0
            ? (await allDelivered.SumAsync(o => (decimal?)o.TotalAmount) ?? 0m) / Math.Max(1, await allDelivered.CountAsync())
            : 0m;

        var totalProducts  = await _context.Products.CountAsync(p => p.IsActive);
        var lowStockCount  = await _context.ProductVariants.CountAsync(v => v.StockQuantity > 0 && v.StockQuantity <= v.LowStockThreshold);
        var totalCustomers = await _context.Users.CountAsync(u => u.IsActive && u.Role == UserRole.Customer);

        // Sales trend – last 30 days
        var trendOrders = await _context.Orders
            .Where(o => o.CreatedAt >= last30Days && o.Status != OrderStatus.Cancelled)
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Orders = g.Count(), Revenue = g.Sum(o => o.TotalAmount) })
            .OrderBy(x => x.Date)
            .ToListAsync();
        var salesTrend = trendOrders.Select(x => new SalesByDayDto
        {
            Date    = x.Date.ToString("yyyy-MM-dd"),
            Orders  = x.Orders,
            Revenue = x.Revenue
        }).ToList();

        // Top products
        var topProducts = await _context.OrderItems
            .GroupBy(oi => new { oi.ProductId, oi.ProductName })
            .Select(g => new TopProductDto
            {
                Id        = g.Key.ProductId,
                Name      = g.Key.ProductName,
                TotalSold = g.Sum(oi => oi.Quantity),
                Revenue   = g.Sum(oi => oi.TotalPrice)
            })
            .OrderByDescending(t => t.TotalSold)
            .Take(5)
            .ToListAsync();

        // Payment method breakdown
        var pmBreakdown = await _context.Orders
            .Where(o => o.Status == OrderStatus.Delivered)
            .GroupBy(o => o.PaymentMethod)
            .Select(g => new SalesByPaymentMethodDto
            {
                PaymentMethod = g.Key.ToString(),
                Count   = g.Count(),
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .ToListAsync();

        // Recent orders
        var recentOrders = await _context.Orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new RecentOrderDto
            {
                Id           = o.Id,
                OrderNumber  = o.OrderNumber,
                CustomerName = o.CustomerName,
                TotalAmount  = o.TotalAmount,
                Status       = o.Status.ToString(),
                CreatedAt    = o.CreatedAt
            })
            .ToListAsync();

        // Low stock items
        var lowStockItems = await _context.ProductVariants
            .Include(v => v.Product)
            .Where(v => v.StockQuantity <= v.LowStockThreshold)
            .OrderBy(v => v.StockQuantity)
            .Take(10)
            .Select(v => new InventoryVariantDto
            {
                VariantId         = v.Id,
                ProductId         = v.ProductId,
                ProductName       = v.Product.Name,
                Color             = v.Color,
                JerseyType        = v.JerseyType.ToString(),
                Size              = v.Size,
                Sku               = v.Sku,
                StockQuantity     = v.StockQuantity,
                LowStockThreshold = v.LowStockThreshold,
                IsLowStock        = true
            })
            .ToListAsync();

        return new ExtendedDashboardDto
        {
            TotalRevenue          = totalRevenue,
            TodayRevenue          = todayRevenue,
            MonthlyRevenue        = monthlyRevenue,
            TotalProfit           = totalProfit,
            MonthlyProfit         = monthlyProfit,
            AverageOrderValue     = Math.Round(aov, 2),
            TotalOrders           = totalOrders,
            PendingOrders         = pendingOrders,
            TotalProducts         = totalProducts,
            LowStockProducts      = lowStockCount,
            TotalCustomers        = totalCustomers,
            SalesTrend            = salesTrend,
            TopProducts           = topProducts,
            PaymentMethodBreakdown = pmBreakdown,
            RecentOrders          = recentOrders,
            LowStockItems         = lowStockItems
        };
    }

    // ── Sales Report ──────────────────────────────────────────────────────────

    public async Task<SalesReportDto> GetSalesReportAsync(ReportFilterDto filter)
    {
        var (from, to) = Normalize(filter);

        var orders = await _context.Orders
            .Where(o => o.CreatedAt >= from && o.CreatedAt <= to && o.Status != OrderStatus.Cancelled)
            .ToListAsync();

        var total       = orders.Sum(o => o.TotalAmount);
        var subTotal    = orders.Sum(o => o.SubTotal);
        var discounts   = orders.Sum(o => o.DiscountAmount);
        var shipping    = orders.Sum(o => o.DeliveryCharge);
        var aov         = orders.Count > 0 ? total / orders.Count : 0m;

        var byDay = orders
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new SalesByDayDto
            {
                Date    = g.Key.ToString("yyyy-MM-dd"),
                Orders  = g.Count(),
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .OrderBy(x => x.Date)
            .ToList();

        var byPM = orders
            .GroupBy(o => o.PaymentMethod)
            .Select(g => new SalesByPaymentMethodDto
            {
                PaymentMethod = g.Key.ToString(),
                Count   = g.Count(),
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .ToList();

        var byStatus = orders
            .GroupBy(o => o.Status)
            .Select(g => new SalesByStatusDto
            {
                Status  = g.Key.ToString(),
                Count   = g.Count(),
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .ToList();

        return new SalesReportDto
        {
            TotalRevenue      = total,
            TotalSubTotal     = subTotal,
            TotalDiscounts    = discounts,
            TotalShipping     = shipping,
            TotalOrders       = orders.Count,
            AverageOrderValue = Math.Round(aov, 2),
            ByDay             = byDay,
            ByPaymentMethod   = byPM,
            ByStatus          = byStatus
        };
    }

    // ── Profit Report ─────────────────────────────────────────────────────────

    public async Task<ProfitReportDto> GetProfitReportAsync(ReportFilterDto filter)
    {
        var (from, to) = Normalize(filter);

        var orders = await _context.Orders
            .Where(o => o.CreatedAt >= from && o.CreatedAt <= to && o.Status == OrderStatus.Delivered)
            .ToListAsync();

        var orderIds = orders.Select(o => o.Id).ToList();

        var items = await _context.OrderItems
            .Where(oi => orderIds.Contains(oi.OrderId))
            .Include(oi => oi.Variant).ThenInclude(v => v!.StockInItems)
            .ToListAsync();

        var totalRevenue  = orders.Sum(o => o.TotalAmount);
        var totalDiscount = orders.Sum(o => o.DiscountAmount);
        var totalShipping = orders.Sum(o => o.DeliveryCharge);

        decimal totalCost = items.Sum(oi => GetAvgPurchasePrice(oi.Variant) * oi.Quantity);
        decimal grossProfit = totalRevenue - totalCost;
        decimal netProfit   = grossProfit - totalDiscount;
        decimal margin      = totalRevenue > 0 ? Math.Round(netProfit / totalRevenue * 100, 2) : 0m;

        var byProduct = items
            .GroupBy(oi => new { oi.ProductId, oi.ProductName })
            .Select(g =>
            {
                var rev  = g.Sum(x => x.TotalPrice);
                var cost = g.Sum(x => GetAvgPurchasePrice(x.Variant) * x.Quantity);
                var gp   = rev - cost;
                return new ProfitByProductDto
                {
                    ProductId            = g.Key.ProductId,
                    ProductName          = g.Key.ProductName,
                    QuantitySold         = g.Sum(x => x.Quantity),
                    Revenue              = rev,
                    Cost                 = cost,
                    GrossProfit          = gp,
                    ProfitMarginPercent  = rev > 0 ? Math.Round(gp / rev * 100, 2) : 0m
                };
            })
            .OrderByDescending(x => x.GrossProfit)
            .ToList();

        return new ProfitReportDto
        {
            TotalRevenue              = totalRevenue,
            TotalCost                 = totalCost,
            TotalDiscounts            = totalDiscount,
            TotalShippingCollected    = totalShipping,
            GrossProfit               = grossProfit,
            NetProfit                 = netProfit,
            ProfitMarginPercent       = margin,
            ByProduct                 = byProduct
        };
    }

    // ── Inventory Report ──────────────────────────────────────────────────────

    public async Task<InventoryReportDto> GetInventoryReportAsync()
    {
        var variants = await _context.ProductVariants
            .Include(v => v.Product)
            .Include(v => v.StockInItems)
            .OrderBy(v => v.Product.Name)
            .ThenBy(v => v.Size)
            .ToListAsync();

        var items = variants.Select(v =>
        {
            var lastPrice  = v.StockInItems.OrderByDescending(s => s.CreatedAt).FirstOrDefault()?.PurchasePrice ?? 0m;
            var stockValue = lastPrice * v.StockQuantity;
            return new InventoryReportItemDto
            {
                VariantId         = v.Id,
                ProductId         = v.ProductId,
                ProductName       = v.Product.Name,
                Color             = v.Color,
                JerseyType        = v.JerseyType.ToString(),
                Size              = v.Size,
                Sku               = v.Sku,
                StockQuantity     = v.StockQuantity,
                LowStockThreshold = v.LowStockThreshold,
                IsLowStock        = v.StockQuantity > 0 && v.StockQuantity <= v.LowStockThreshold,
                IsOutOfStock      = v.StockQuantity == 0,
                LastPurchasePrice = lastPrice,
                StockValue        = stockValue
            };
        }).ToList();

        return new InventoryReportDto
        {
            TotalVariants     = items.Count,
            LowStockVariants  = items.Count(x => x.IsLowStock),
            OutOfStockVariants = items.Count(x => x.IsOutOfStock),
            TotalStockValue   = items.Sum(x => x.StockValue),
            Items             = items
        };
    }

    // ── Stock Movement Report ─────────────────────────────────────────────────

    public async Task<StockMovementReportDto> GetStockMovementReportAsync(ReportFilterDto filter)
    {
        var (from, to) = Normalize(filter);

        var movements = await _context.StockMovements
            .Where(m => m.CreatedAt >= from && m.CreatedAt <= to)
            .Include(m => m.ProductVariant).ThenInclude(v => v.Product)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        var items = movements.Select(m => new StockMovementReportItemDto
        {
            Id            = m.Id,
            ProductName   = m.ProductVariant.Product.Name,
            VariantLabel  = $"{m.ProductVariant.Color} {m.ProductVariant.JerseyType} {m.ProductVariant.Size}".Trim(),
            Quantity      = m.Quantity,
            MovementType  = m.MovementType.ToString(),
            ReferenceType = m.ReferenceType,
            ReferenceId   = m.ReferenceId,
            Notes         = m.Notes,
            Date          = m.CreatedAt
        }).ToList();

        return new StockMovementReportDto
        {
            TotalIn         = movements.Where(m => m.Quantity > 0).Sum(m => m.Quantity),
            TotalOut        = Math.Abs(movements.Where(m => m.MovementType == StockMovementType.Out).Sum(m => m.Quantity)),
            TotalAdjustment = movements.Count(m => m.MovementType == StockMovementType.Adjustment),
            Movements       = items
        };
    }

    // ── Discount Report ───────────────────────────────────────────────────────

    public async Task<DiscountReportDto> GetDiscountReportAsync(ReportFilterDto filter)
    {
        var (from, to) = Normalize(filter);

        var orders = await _context.Orders
            .Where(o => o.CreatedAt >= from && o.CreatedAt <= to && o.DiscountAmount > 0)
            .Include(o => o.Discounts)
            .ToListAsync();

        var couponUsage = orders
            .Where(o => !string.IsNullOrWhiteSpace(o.CouponCode))
            .GroupBy(o => o.CouponCode!)
            .Select(g => new CouponUsageDto
            {
                CouponCode        = g.Key,
                UsageCount        = g.Count(),
                TotalDiscountGiven = g.Sum(o => o.DiscountAmount),
                RevenueImpact     = g.Sum(o => o.TotalAmount)
            })
            .OrderByDescending(x => x.UsageCount)
            .ToList();

        var allDiscountRows = orders.SelectMany(o => o.Discounts).ToList();
        var bySource = allDiscountRows
            .GroupBy(d => d.Source)
            .Select(g => new DiscountBySourceDto
            {
                Source      = g.Key.ToString(),
                Count       = g.Count(),
                TotalAmount = g.Sum(d => d.DiscountAmount)
            })
            .ToList();

        return new DiscountReportDto
        {
            TotalDiscountGiven      = orders.Sum(o => o.DiscountAmount),
            TotalOrdersWithDiscount = orders.Count,
            CouponUsage             = couponUsage,
            BySource                = bySource
        };
    }

    // ── Shipping Report ───────────────────────────────────────────────────────

    public async Task<ShippingReportDto> GetShippingReportAsync(ReportFilterDto filter)
    {
        var (from, to) = Normalize(filter);

        var orders = await _context.Orders
            .Where(o => o.CreatedAt >= from && o.CreatedAt <= to && o.Status != OrderStatus.Cancelled)
            .Include(o => o.ShippingZone)
            .Include(o => o.ShippingMethod)
            .ToListAsync();

        var byZone = orders
            .Where(o => o.ShippingZone != null)
            .GroupBy(o => o.ShippingZone!.Name)
            .Select(g => new ShippingByZoneDto
            {
                ZoneName       = g.Key,
                DeliveryCount  = g.Count(),
                TotalCollected = g.Sum(o => o.DeliveryCharge)
            })
            .OrderByDescending(x => x.DeliveryCount)
            .ToList();

        var byMethod = orders
            .Where(o => o.ShippingMethod != null)
            .GroupBy(o => o.ShippingMethod!.Name)
            .Select(g => new ShippingByMethodDto
            {
                MethodName     = g.Key,
                DeliveryCount  = g.Count(),
                TotalCollected = g.Sum(o => o.DeliveryCharge)
            })
            .OrderByDescending(x => x.DeliveryCount)
            .ToList();

        return new ShippingReportDto
        {
            TotalShippingCollected = orders.Sum(o => o.DeliveryCharge),
            TotalOrdersWithShipping = orders.Count(o => o.DeliveryCharge > 0),
            FreeShippingOrders     = orders.Count(o => o.DeliveryCharge == 0),
            ByZone                 = byZone,
            ByMethod               = byMethod
        };
    }

    // ── Top Products Report ───────────────────────────────────────────────────

    public async Task<TopProductsReportDto> GetTopProductsReportAsync(ReportFilterDto filter, int top = 10)
    {
        var (from, to) = Normalize(filter);

        var items = await _context.OrderItems
            .Where(oi => oi.Order.CreatedAt >= from
                && oi.Order.CreatedAt <= to
                && oi.Order.Status != OrderStatus.Cancelled)
            .ToListAsync();

        var topProducts = items
            .GroupBy(oi => new { oi.ProductId, oi.ProductName })
            .Select(g => new TopProductReportItemDto
            {
                ProductId   = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                TotalSold   = g.Sum(x => x.Quantity),
                Revenue     = g.Sum(x => x.TotalPrice),
                OrderCount  = g.Select(x => x.OrderId).Distinct().Count()
            })
            .OrderByDescending(x => x.TotalSold)
            .Take(top)
            .ToList();

        var topVariants = items
            .Where(oi => oi.VariantId.HasValue)
            .GroupBy(oi => new { oi.VariantId, oi.ProductId, oi.ProductName, oi.Color, oi.JerseyType, oi.Size })
            .Select(g => new TopVariantReportItemDto
            {
                VariantId    = g.Key.VariantId!.Value,
                ProductId    = g.Key.ProductId,
                ProductName  = g.Key.ProductName,
                VariantLabel = $"{g.Key.Color} {g.Key.JerseyType} {g.Key.Size}".Trim(),
                TotalSold    = g.Sum(x => x.Quantity),
                Revenue      = g.Sum(x => x.TotalPrice)
            })
            .OrderByDescending(x => x.TotalSold)
            .Take(top)
            .ToList();

        return new TopProductsReportDto
        {
            Products = topProducts,
            Variants = topVariants
        };
    }

    // ── Customer Report ───────────────────────────────────────────────────────

    public async Task<CustomerReportDto> GetCustomerReportAsync(ReportFilterDto filter)
    {
        var (from, to) = Normalize(filter);

        var totalCustomers = await _context.Users
            .CountAsync(u => u.Role == UserRole.Customer && u.IsActive);

        var newCustomers = await _context.Users
            .CountAsync(u => u.Role == UserRole.Customer && u.IsActive
                && u.CreatedAt >= from && u.CreatedAt <= to);

        var orders = await _context.Orders
            .Where(o => o.CreatedAt >= from && o.CreatedAt <= to)
            .ToListAsync();

        var guestOrders = orders.Count(o => o.UserId == null);

        // Registered customers with >1 order = repeat
        var registeredByUser = orders
            .Where(o => o.UserId != null)
            .GroupBy(o => o.UserId)
            .ToList();
        var repeatCustomers = registeredByUser.Count(g => g.Count() > 1);

        // Top buyers (by phone for guests, by userId for registered)
        var topBuyers = orders
            .GroupBy(o => new { o.UserId, o.CustomerPhone, o.CustomerName })
            .Select(g => new TopBuyerDto
            {
                UserId        = g.Key.UserId,
                CustomerName  = g.Key.CustomerName,
                CustomerPhone = g.Key.CustomerPhone,
                OrderCount    = g.Count(),
                TotalSpent    = g.Sum(o => o.TotalAmount)
            })
            .OrderByDescending(x => x.TotalSpent)
            .Take(10)
            .ToList();

        return new CustomerReportDto
        {
            TotalCustomers  = totalCustomers,
            NewCustomers    = newCustomers,
            RepeatCustomers = repeatCustomers,
            GuestOrderCount = guestOrders,
            TopBuyers       = topBuyers
        };
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /// <summary>Weighted-average purchase price for a variant, or 0 if unknown.</summary>
    private static decimal GetAvgPurchasePrice(ProductVariant? variant)
    {
        if (variant == null || !variant.StockInItems.Any()) return 0m;
        var totalQty  = variant.StockInItems.Sum(s => s.Quantity);
        if (totalQty == 0) return 0m;
        var totalCost = variant.StockInItems.Sum(s => s.PurchasePrice * s.Quantity);
        return totalCost / totalQty;
    }
}
