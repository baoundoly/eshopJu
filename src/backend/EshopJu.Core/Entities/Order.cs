using EshopJu.Core.Enums;

namespace EshopJu.Core.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public User? User { get; set; }
    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    // Guest info
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public string? TransactionId { get; set; }

    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? CouponCode { get; set; }
    public decimal DeliveryCharge { get; set; }
    public decimal TotalAmount { get; set; }

    // Shipping details
    public string? District { get; set; }
    public string? Thana { get; set; }
    public int? ShippingZoneId { get; set; }
    public ShippingZone? ShippingZone { get; set; }
    public int? ShippingMethodId { get; set; }
    public ShippingMethod? ShippingMethod { get; set; }

    public string? Notes { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<OrderDiscount> Discounts { get; set; } = new List<OrderDiscount>();
}
