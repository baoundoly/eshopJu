using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using EshopJu.Core.Entities;
using EshopJu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.Infrastructure.Services;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _context;

    public CustomerService(AppDbContext context) => _context = context;

    public async Task<PagedResult<CustomerDto>> GetCustomersAsync(int page = 1, int pageSize = 20, string? search = null)
    {
        var query = _context.Customers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c =>
                c.Name.Contains(search) ||
                c.Phone.Contains(search) ||
                (c.Email != null && c.Email.Contains(search)));
        }

        query = query.OrderByDescending(c => c.LastOrderDate ?? c.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<CustomerDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<CustomerPurchaseHistoryDto?> GetCustomerHistoryAsync(int customerId)
    {
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null) return null;

        var orders = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Discounts)
            .Include(o => o.ShippingZone)
            .Include(o => o.ShippingMethod)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return new CustomerPurchaseHistoryDto
        {
            Customer = MapToDto(customer),
            Orders = orders.Select(MapOrderToDto).ToList()
        };
    }

    public async Task<CustomerDto?> GetCustomerByPhoneAsync(string phone)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Phone == phone);
        return customer == null ? null : MapToDto(customer);
    }

    public async Task<CustomerPurchaseHistoryDto?> GetPurchaseHistoryForUserAsync(int userId)
    {
        // Find customer record linked to this user (or match by user's phone)
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.UserId == userId || c.Phone == user.Phone);

        if (customer == null)
        {
            // Return empty history using user info as the customer profile
            return new CustomerPurchaseHistoryDto
            {
                Customer = new CustomerDto
                {
                    Id = 0,
                    Name = user.Name,
                    Phone = user.Phone,
                    Email = user.Email,
                    TotalOrders = 0,
                    TotalSpent = 0,
                    IsRecurring = false,
                    UserId = userId,
                    CreatedAt = user.CreatedAt
                },
                Orders = new List<OrderDto>()
            };
        }

        var orders = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Discounts)
            .Include(o => o.ShippingZone)
            .Include(o => o.ShippingMethod)
            .Where(o => o.CustomerId == customer.Id || o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return new CustomerPurchaseHistoryDto
        {
            Customer = MapToDto(customer),
            Orders = orders.Select(MapOrderToDto).ToList()
        };
    }

    private static CustomerDto MapToDto(Customer c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Phone = c.Phone,
        Email = c.Email,
        Address = c.Address,
        District = c.District,
        Thana = c.Thana,
        TotalOrders = c.TotalOrders,
        TotalSpent = c.TotalSpent,
        LastOrderDate = c.LastOrderDate,
        IsRecurring = c.TotalOrders > 1,
        UserId = c.UserId,
        CreatedAt = c.CreatedAt
    };

    private static OrderDto MapOrderToDto(Order order) => new()
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
