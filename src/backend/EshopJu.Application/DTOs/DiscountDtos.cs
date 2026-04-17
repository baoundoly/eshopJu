using EshopJu.Core.Enums;

namespace EshopJu.Application.DTOs;

// ── Coupon ───────────────────────────────────────────────────────────────────

public class CouponDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string DiscountType { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public int? UsageLimit { get; set; }
    public int UsedCount { get; set; }
    public int? PerUserLimit { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateCouponDto
{
    public string Code { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Description { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal Value { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public int? UsageLimit { get; set; }
    public int? PerUserLimit { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}

// ── Discount Rule ─────────────────────────────────────────────────────────────

public class DiscountRuleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DiscountType { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public string AppliesTo { get; set; } = string.Empty;
    public int? TargetId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }
    public int Priority { get; set; }
    public bool IsStackable { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateDiscountRuleDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal Value { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public DiscountAppliesTo AppliesTo { get; set; } = DiscountAppliesTo.All;
    public int? TargetId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public int Priority { get; set; } = 10;
    public bool IsStackable { get; set; } = true;
}

// ── Coupon validation ─────────────────────────────────────────────────────────

public class ValidateCouponRequestDto
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderAmount { get; set; }
}

public class CouponValidationResultDto
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
    public string? Code { get; set; }
    public string? Name { get; set; }
    public decimal DiscountAmount { get; set; }
}

// ── Pricing engine inputs / outputs ──────────────────────────────────────────

public class DiscountCartItemDto
{
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public int CategoryId { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}

public class AppliedDiscountDto
{
    public string Source { get; set; } = string.Empty;
    public int SourceId { get; set; }
    public string SourceLabel { get; set; } = string.Empty;
    public decimal DiscountAmount { get; set; }
    public string? Description { get; set; }
}

public class DiscountPreviewDto
{
    public decimal SubTotal { get; set; }
    public decimal TotalDiscount { get; set; }
    public decimal FinalTotal { get; set; }
    public List<AppliedDiscountDto> AppliedDiscounts { get; set; } = new();
}

// ── OrderDiscount (audit) ─────────────────────────────────────────────────────

public class OrderDiscountDto
{
    public string Source { get; set; } = string.Empty;
    public string SourceLabel { get; set; } = string.Empty;
    public decimal DiscountAmount { get; set; }
    public string? Description { get; set; }
}
