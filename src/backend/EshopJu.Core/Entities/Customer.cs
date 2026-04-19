namespace EshopJu.Core.Entities;

public class Customer : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? District { get; set; }
    public string? Thana { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime? LastOrderDate { get; set; }
    public bool IsRecurring => TotalOrders > 1;

    // Link to registered user account (if any)
    public int? UserId { get; set; }
    public User? User { get; set; }

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
