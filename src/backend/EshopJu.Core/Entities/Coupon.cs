using EshopJu.Core.Enums;

namespace EshopJu.Core.Entities;

public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Description { get; set; }

    public DiscountType DiscountType { get; set; }
    public decimal Value { get; set; }

    /// <summary>Caps percentage discounts (ignored for Fixed).</summary>
    public decimal? MaxDiscountAmount { get; set; }

    public decimal? MinOrderAmount { get; set; }

    /// <summary>Null = unlimited.</summary>
    public int? UsageLimit { get; set; }
    public int UsedCount { get; set; }

    /// <summary>Max uses per individual user. Null = unlimited.</summary>
    public int? PerUserLimit { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}
