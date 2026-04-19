namespace EshopJu.Application.DTOs;

public class CustomerDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? District { get; set; }
    public string? Thana { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime? LastOrderDate { get; set; }
    public bool IsRecurring { get; set; }
    public int? UserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CustomerPurchaseHistoryDto
{
    public CustomerDto Customer { get; set; } = null!;
    public List<OrderDto> Orders { get; set; } = new();
}
