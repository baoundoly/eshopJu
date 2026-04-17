using EshopJu.Core.Enums;

namespace EshopJu.Application.DTOs;

public class OrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public string StatusLabel => Status.ToString();
    public PaymentMethod PaymentMethod { get; set; }
    public string PaymentMethodLabel => PaymentMethod.ToString();
    public PaymentStatus PaymentStatus { get; set; }
    public string PaymentStatusLabel => PaymentStatus.ToString();
    public string? TransactionId { get; set; }
    public decimal SubTotal { get; set; }
    public decimal DeliveryCharge { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int? VariantId { get; set; }
    public string Size { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? JerseyType { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public class CreateOrderDto
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public PaymentMethod PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public string? Notes { get; set; }
    public List<CreateOrderItemDto> Items { get; set; } = new();
}

public class CreateOrderItemDto
{
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public string Size { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? JerseyType { get; set; }
    public int Quantity { get; set; }
}

public class UpdateOrderStatusDto
{
    public OrderStatus Status { get; set; }
}

public class VerifyPaymentDto
{
    public PaymentStatus PaymentStatus { get; set; }
    public string? TransactionId { get; set; }
}

public class WhatsAppOrderMessageDto
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public List<WhatsAppOrderItemDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
}

public class WhatsAppOrderItemDto
{
    public string ProductName { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
