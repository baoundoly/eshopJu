using EshopJu.Application.DTOs;

namespace EshopJu.Application.Interfaces;

public interface IDiscountService
{
    // ── Admin: Coupon CRUD ────────────────────────────────────────────────────
    Task<PagedResult<CouponDto>> GetCouponsAsync(int page = 1, int pageSize = 20);
    Task<CouponDto> CreateCouponAsync(CreateCouponDto dto);
    Task<CouponDto?> UpdateCouponAsync(int id, CreateCouponDto dto);
    Task<bool> DeleteCouponAsync(int id);

    // ── Admin: Rule CRUD ──────────────────────────────────────────────────────
    Task<List<DiscountRuleDto>> GetRulesAsync();
    Task<DiscountRuleDto> CreateRuleAsync(CreateDiscountRuleDto dto);
    Task<DiscountRuleDto?> UpdateRuleAsync(int id, CreateDiscountRuleDto dto);
    Task<bool> DeleteRuleAsync(int id);

    // ── Public: coupon validation ─────────────────────────────────────────────
    Task<CouponValidationResultDto> ValidateCouponAsync(string code, int? userId, decimal orderAmount);

    // ── Pricing engine (called by OrderService) ───────────────────────────────
    Task<DiscountPreviewDto> CalculateDiscountsAsync(
        List<DiscountCartItemDto> items, string? couponCode, int? userId);

    Task WriteOrderDiscountsAsync(int orderId, DiscountPreviewDto preview);
    Task IncrementCouponUsageAsync(string couponCode);
}
