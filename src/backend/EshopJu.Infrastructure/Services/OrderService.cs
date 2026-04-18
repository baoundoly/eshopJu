using System.Net;
using System.Text;
using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using EshopJu.Core.Entities;
using EshopJu.Core.Enums;
using EshopJu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace EshopJu.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IDiscountService _discountService;
    private readonly IShippingService _shippingService;

    public OrderService(AppDbContext context, IConfiguration configuration,
        IDiscountService discountService, IShippingService shippingService)
    {
        _context = context;
        _configuration = configuration;
        _discountService = discountService;
        _shippingService = shippingService;
    }

    public async Task<PagedResult<OrderDto>> GetOrdersAsync(int page = 1, int pageSize = 20, string? status = null)
    {
        var query = _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .Include(o => o.Discounts)
            .Include(o => o.ShippingZone)
            .Include(o => o.ShippingMethod)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<OrderStatus>(status, ignoreCase: true, out var parsedStatus))
        {
            query = query.Where(o => o.Status == parsedStatus);
        }

        query = query.OrderByDescending(o => o.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<OrderDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .Include(o => o.Discounts)
            .Include(o => o.ShippingZone)
            .Include(o => o.ShippingMethod)
            .FirstOrDefaultAsync(o => o.Id == id);

        return order == null ? null : MapToDto(order);
    }

    public async Task<OrderDto?> GetOrderByNumberAsync(string orderNumber)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .Include(o => o.Discounts)
            .Include(o => o.ShippingZone)
            .Include(o => o.ShippingMethod)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        return order == null ? null : MapToDto(order);
    }

    public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto, int? userId = null)
    {
        if (!dto.Items.Any())
            throw new InvalidOperationException("Order must contain at least one item.");

        var orderNumber = await GenerateOrderNumberAsync();

        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = userId,
            CustomerName = dto.CustomerName,
            CustomerPhone = dto.CustomerPhone,
            CustomerAddress = dto.CustomerAddress,
            District = dto.District,
            Thana = dto.Thana,
            ShippingMethodId = dto.ShippingMethodId,
            PaymentMethod = dto.PaymentMethod,
            TransactionId = dto.TransactionId,
            Notes = dto.Notes,
            Status = OrderStatus.Pending,
            PaymentStatus = PaymentStatus.Pending,
            DeliveryCharge = 60m, // default; overridden below after subtotal is known
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        decimal subTotal = 0;

        foreach (var itemDto in dto.Items)
        {
            var product = await _context.Products
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == itemDto.ProductId)
                ?? throw new InvalidOperationException($"Product {itemDto.ProductId} not found.");

            ProductVariant? variant = null;

            if (itemDto.VariantId.HasValue)
            {
                // Variant-based stock validation
                variant = product.Variants.FirstOrDefault(v => v.Id == itemDto.VariantId.Value);
                if (variant == null)
                    throw new InvalidOperationException(
                        $"Variant {itemDto.VariantId} is not available for product '{product.Name}'.");

                if (variant.StockQuantity < itemDto.Quantity)
                    throw new InvalidOperationException(
                        $"Insufficient stock for '{product.Name}' ({variant.Color} / {variant.JerseyType} / {variant.Size}). Available: {variant.StockQuantity}.");

                variant.StockQuantity -= itemDto.Quantity;
                variant.UpdatedAt = DateTime.UtcNow;
            }
            else if (product.Variants.Any())
            {
                // Fall back to size-based match within variants
                variant = product.Variants.FirstOrDefault(v => v.Size == itemDto.Size);
                if (variant != null)
                {
                    if (variant.StockQuantity < itemDto.Quantity)
                        throw new InvalidOperationException(
                            $"Insufficient stock for '{product.Name}' in size '{itemDto.Size}'. Available: {variant.StockQuantity}.");

                    variant.StockQuantity -= itemDto.Quantity;
                    variant.UpdatedAt = DateTime.UtcNow;
                }
            }
            else
            {
                // Legacy: product-level stock only
                if (product.StockQuantity < itemDto.Quantity)
                    throw new InvalidOperationException(
                        $"Insufficient stock for product '{product.Name}'. Available: {product.StockQuantity}.");
            }

            var unitPrice = product.DiscountPrice ?? product.Price;
            var totalPrice = unitPrice * itemDto.Quantity;
            subTotal += totalPrice;

            order.Items.Add(new OrderItem
            {
                ProductId = itemDto.ProductId,
                VariantId = variant?.Id,
                ProductName = product.Name,
                Size = variant?.Size ?? itemDto.Size,
                Color = variant?.Color ?? itemDto.Color,
                JerseyType = variant?.JerseyType.ToString() ?? itemDto.JerseyType,
                Quantity = itemDto.Quantity,
                UnitPrice = unitPrice,
                TotalPrice = totalPrice,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            // Sync product total stock from variants
            if (product.Variants.Any())
                product.StockQuantity = product.Variants.Sum(v => v.StockQuantity);
            else
                product.StockQuantity -= itemDto.Quantity;

            product.UpdatedAt = DateTime.UtcNow;
        }

        order.SubTotal = subTotal;

        // Resolve shipping zone + cost
        if (!string.IsNullOrWhiteSpace(dto.District))
        {
            var zone = await _shippingService.GetZoneByAreaAsync(dto.District, dto.Thana);
            if (zone != null)
            {
                order.ShippingZoneId = zone.Id;
                if (dto.ShippingMethodId.HasValue)
                    order.DeliveryCharge = await _shippingService.CalculateShippingCostAsync(
                        zone.Id, dto.ShippingMethodId.Value, subTotal);
                else
                {
                    // Auto-select cheapest available method for zone
                    var options = await _shippingService.GetShippingOptionsAsync(
                        new ShippingLookupRequestDto { District = dto.District, Thana = dto.Thana, OrderAmount = subTotal });
                    if (options.Any())
                    {
                        var cheapest = options.OrderBy(o => o.ShippingCost).First();
                        order.DeliveryCharge = cheapest.ShippingCost;
                        order.ShippingMethodId = cheapest.MethodId;
                        order.ShippingZoneId = cheapest.ZoneId;
                    }
                }
            }
        }

        // Run pricing engine
        var discountItems = dto.Items.Select((itemDto, idx) =>
        {
            var orderItem = order.Items.ElementAt(idx);
            // Retrieve category from product (already loaded in the loop above)
            return new DiscountCartItemDto
            {
                ProductId = itemDto.ProductId,
                VariantId = orderItem.VariantId,
                CategoryId = 0, // will be populated below
                UnitPrice = orderItem.UnitPrice,
                Quantity = itemDto.Quantity
            };
        }).ToList();

        // Populate CategoryId for each item
        for (int i = 0; i < discountItems.Count; i++)
        {
            var prod = await _context.Products.FindAsync(discountItems[i].ProductId);
            if (prod != null) discountItems[i].CategoryId = prod.CategoryId;
        }

        var discountPreview = await _discountService.CalculateDiscountsAsync(
            discountItems, dto.CouponCode, userId);

        order.DiscountAmount = discountPreview.TotalDiscount;
        order.CouponCode = discountPreview.AppliedDiscounts
            .FirstOrDefault(d => d.Source == "Coupon")?.SourceLabel;
        order.TotalAmount = subTotal + order.DeliveryCharge - order.DiscountAmount;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Write discount audit rows
        await _discountService.WriteOrderDiscountsAsync(order.Id, discountPreview);

        // Increment coupon usage counter
        if (!string.IsNullOrWhiteSpace(dto.CouponCode))
            await _discountService.IncrementCouponUsageAsync(dto.CouponCode);

        // Record stock-out movements in the ledger
        foreach (var item in order.Items)
        {
            if (item.VariantId.HasValue)
            {
                _context.StockMovements.Add(new StockMovement
                {
                    ProductVariantId = item.VariantId.Value,
                    Quantity = -item.Quantity,
                    MovementType = StockMovementType.Out,
                    ReferenceType = "Order",
                    ReferenceId = order.Id,
                    Notes = $"Order {order.OrderNumber}",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }
        await _context.SaveChangesAsync();

        return MapToDto(order);
    }

    public async Task<OrderDto?> UpdateOrderStatusAsync(int id, UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .Include(o => o.Discounts)
            .Include(o => o.ShippingZone)
            .Include(o => o.ShippingMethod)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return null;

        order.Status = dto.Status;
        order.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToDto(order);
    }

    public async Task<OrderDto?> VerifyPaymentAsync(int id, VerifyPaymentDto dto)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .Include(o => o.Discounts)
            .Include(o => o.ShippingZone)
            .Include(o => o.ShippingMethod)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return null;

        order.PaymentStatus = dto.PaymentStatus;
        if (!string.IsNullOrWhiteSpace(dto.TransactionId))
            order.TransactionId = dto.TransactionId;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(order);
    }

    public Task<string> GenerateWhatsAppLinkAsync(WhatsAppOrderMessageDto dto)
    {
        var phoneNumber = _configuration["WhatsApp:PhoneNumber"] ?? "8801XXXXXXXXX";

        var sb = new StringBuilder();
        sb.AppendLine("🛒 *New Order*");
        sb.AppendLine();
        sb.AppendLine($"👤 *Customer:* {dto.CustomerName}");
        sb.AppendLine($"📞 *Phone:* {dto.CustomerPhone}");
        sb.AppendLine($"📍 *Address:* {dto.CustomerAddress}");
        if (!string.IsNullOrWhiteSpace(dto.District))
            sb.AppendLine($"🗺️ *Location:* {dto.District}");
        sb.AppendLine($"💳 *Payment:* {dto.PaymentMethod}");
        if (!string.IsNullOrWhiteSpace(dto.TransactionId))
            sb.AppendLine($"🔖 *Transaction ID:* {dto.TransactionId}");
        sb.AppendLine();
        sb.AppendLine("📦 *Items:*");
        foreach (var item in dto.Items)
        {
            sb.AppendLine($"  • {item.ProductName} ({item.Size}) x{item.Quantity} — ৳{item.UnitPrice:F0} each");
        }
        sb.AppendLine();
        sb.AppendLine($"🧾 *Subtotal:* ৳{dto.SubTotal:F0}");
        if (!string.IsNullOrWhiteSpace(dto.ShippingMethod))
            sb.AppendLine($"🚚 *Shipping ({dto.ShippingMethod}):* ৳{dto.ShippingCost:F0}");
        else
            sb.AppendLine($"🚚 *Shipping:* ৳{dto.ShippingCost:F0}");
        if (dto.DiscountAmount > 0)
            sb.AppendLine($"🏷️ *Discount:* -৳{dto.DiscountAmount:F0}");
        sb.AppendLine($"💰 *Total: ৳{dto.TotalAmount:F0}*");

        var encodedMessage = WebUtility.UrlEncode(sb.ToString());
        var link = $"https://wa.me/{phoneNumber}?text={encodedMessage}";

        return Task.FromResult(link);
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var totalOrders = await _context.Orders.CountAsync();
        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Pending);
        var totalProducts = await _context.Products.CountAsync(p => p.IsActive);
        var lowStockProducts = await _context.Products.CountAsync(p => p.IsActive && p.StockQuantity < 5);
        var totalCustomers = await _context.Users.CountAsync(u => u.IsActive && u.Role == UserRole.Customer);

        var deliveredOrders = _context.Orders.Where(o => o.Status == OrderStatus.Delivered);

        var todayRevenue = await deliveredOrders
            .Where(o => o.CreatedAt >= todayStart)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

        var monthlyRevenue = await deliveredOrders
            .Where(o => o.CreatedAt >= monthStart)
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

        var totalRevenue = await deliveredOrders
            .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

        var recentOrders = await _context.Orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new RecentOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.CustomerName,
                TotalAmount = o.TotalAmount,
                Status = o.Status.ToString(),
                CreatedAt = o.CreatedAt
            })
            .ToListAsync();

        var topProducts = await _context.OrderItems
            .GroupBy(oi => new { oi.ProductId, oi.ProductName })
            .Select(g => new TopProductDto
            {
                Id = g.Key.ProductId,
                Name = g.Key.ProductName,
                TotalSold = g.Sum(oi => oi.Quantity),
                Revenue = g.Sum(oi => oi.TotalPrice)
            })
            .OrderByDescending(t => t.TotalSold)
            .Take(5)
            .ToListAsync();

        return new DashboardStatsDto
        {
            TotalOrders = totalOrders,
            PendingOrders = pendingOrders,
            TotalProducts = totalProducts,
            LowStockProducts = lowStockProducts,
            TotalCustomers = totalCustomers,
            TodayRevenue = todayRevenue,
            MonthlyRevenue = monthlyRevenue,
            TotalRevenue = totalRevenue,
            RecentOrders = recentOrders,
            TopProducts = topProducts
        };
    }

    private async Task<string> GenerateOrderNumberAsync()
    {
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        string orderNumber;
        do
        {
            var suffix = Random.Shared.Next(1000, 9999).ToString();
            orderNumber = $"ORD-{datePart}-{suffix}";
        }
        while (await _context.Orders.AnyAsync(o => o.OrderNumber == orderNumber));

        return orderNumber;
    }

    private static OrderDto MapToDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerName = order.CustomerName,
            CustomerPhone = order.CustomerPhone,
            CustomerAddress = order.CustomerAddress,
            Status = order.Status,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus,
            TransactionId = order.TransactionId,
            SubTotal = order.SubTotal,
            DiscountAmount = order.DiscountAmount,
            CouponCode = order.CouponCode,
            DeliveryCharge = order.DeliveryCharge,
            TotalAmount = order.TotalAmount,
            District = order.District,
            Thana = order.Thana,
            ShippingZoneId = order.ShippingZoneId,
            ShippingZoneName = order.ShippingZone?.Name,
            ShippingMethodId = order.ShippingMethodId,
            ShippingMethodName = order.ShippingMethod?.Name,
            Notes = order.Notes,
            Items = order.Items.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                VariantId = i.VariantId,
                Size = i.Size,
                Color = i.Color,
                JerseyType = i.JerseyType,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice
            }).ToList(),
            Discounts = order.Discounts.Select(d => new OrderDiscountDto
            {
                Source = d.Source.ToString(),
                SourceLabel = d.SourceLabel,
                DiscountAmount = d.DiscountAmount,
                Description = d.Description
            }).ToList(),
            CreatedAt = order.CreatedAt
        };
    }
}
