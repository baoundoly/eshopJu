using EshopJu.Core.Enums;

namespace EshopJu.Core.Entities;

public class DiscountRule : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public DiscountType DiscountType { get; set; }
    public decimal Value { get; set; }

    public decimal? MaxDiscountAmount { get; set; }
    public decimal? MinOrderAmount { get; set; }

    /// <summary>What the rule targets: All, Category, Product, or Variant.</summary>
    public DiscountAppliesTo AppliesTo { get; set; } = DiscountAppliesTo.All;

    /// <summary>Id of the targeted category / product / variant (null when AppliesTo = All).</summary>
    public int? TargetId { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    /// <summary>Lower value = applied first.</summary>
    public int Priority { get; set; } = 10;

    /// <summary>When false, this rule blocks other rules from stacking on top.</summary>
    public bool IsStackable { get; set; } = true;
}
