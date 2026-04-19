using EshopJu.Core.Enums;

namespace EshopJu.Core.Entities;

/// <summary>Immutable audit row written once per applied discount per order.</summary>
public class OrderDiscount : BaseEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public DiscountSource Source { get; set; }

    /// <summary>Id of the Coupon or DiscountRule that generated this discount.</summary>
    public int SourceId { get; set; }

    /// <summary>Human-readable label (coupon code or rule name).</summary>
    public string SourceLabel { get; set; } = string.Empty;

    public decimal DiscountAmount { get; set; }
    public string? Description { get; set; }
}
