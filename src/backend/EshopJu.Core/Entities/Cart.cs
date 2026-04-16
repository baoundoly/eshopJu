namespace EshopJu.Core.Entities;

public class Cart : BaseEntity
{
    public int? UserId { get; set; }
    public string? SessionId { get; set; }
    public User? User { get; set; }

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
