using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using EshopJu.Core.Entities;
using EshopJu.Core.Enums;
using EshopJu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.Infrastructure.Services;

public class DiscountService : IDiscountService
{
    private readonly AppDbContext _context;

    public DiscountService(AppDbContext context)
    {
        _context = context;
    }

    // ── Coupon CRUD ──────────────────────────────────────────────────────────

    public async Task<PagedResult<CouponDto>> GetCouponsAsync(int page = 1, int pageSize = 20)
    {
        var query = _context.Coupons.OrderByDescending(c => c.CreatedAt);
        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<CouponDto>
        {
            Items = items.Select(MapCoupon).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<CouponDto> CreateCouponAsync(CreateCouponDto dto)
    {
        var code = dto.Code.Trim().ToUpperInvariant();
        if (await _context.Coupons.AnyAsync(c => c.Code == code))
            throw new InvalidOperationException($"Coupon code '{code}' already exists.");

        var coupon = new Coupon
        {
            Code = code,
            Name = dto.Name,
            Description = dto.Description,
            DiscountType = dto.DiscountType,
            Value = dto.Value,
            MaxDiscountAmount = dto.MaxDiscountAmount,
            MinOrderAmount = dto.MinOrderAmount,
            UsageLimit = dto.UsageLimit,
            PerUserLimit = dto.PerUserLimit,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();
        return MapCoupon(coupon);
    }

    public async Task<CouponDto?> UpdateCouponAsync(int id, CreateCouponDto dto)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return null;

        var code = dto.Code.Trim().ToUpperInvariant();
        if (await _context.Coupons.AnyAsync(c => c.Code == code && c.Id != id))
            throw new InvalidOperationException($"Coupon code '{code}' already exists.");

        coupon.Code = code;
        coupon.Name = dto.Name;
        coupon.Description = dto.Description;
        coupon.DiscountType = dto.DiscountType;
        coupon.Value = dto.Value;
        coupon.MaxDiscountAmount = dto.MaxDiscountAmount;
        coupon.MinOrderAmount = dto.MinOrderAmount;
        coupon.UsageLimit = dto.UsageLimit;
        coupon.PerUserLimit = dto.PerUserLimit;
        coupon.StartDate = dto.StartDate;
        coupon.EndDate = dto.EndDate;
        coupon.IsActive = dto.IsActive;
        coupon.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapCoupon(coupon);
    }

    public async Task<bool> DeleteCouponAsync(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return false;
        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync();
        return true;
    }

    // ── Rule CRUD ────────────────────────────────────────────────────────────

    public async Task<List<DiscountRuleDto>> GetRulesAsync()
    {
        return await _context.DiscountRules
            .OrderBy(r => r.Priority)
            .ThenBy(r => r.Name)
            .Select(r => MapRule(r))
            .ToListAsync();
    }

    public async Task<DiscountRuleDto> CreateRuleAsync(CreateDiscountRuleDto dto)
    {
        var rule = new DiscountRule
        {
            Name = dto.Name,
            Description = dto.Description,
            DiscountType = dto.DiscountType,
            Value = dto.Value,
            MaxDiscountAmount = dto.MaxDiscountAmount,
            MinOrderAmount = dto.MinOrderAmount,
            AppliesTo = dto.AppliesTo,
            TargetId = dto.TargetId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive,
            Priority = dto.Priority,
            IsStackable = dto.IsStackable,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.DiscountRules.Add(rule);
        await _context.SaveChangesAsync();
        return MapRule(rule);
    }

    public async Task<DiscountRuleDto?> UpdateRuleAsync(int id, CreateDiscountRuleDto dto)
    {
        var rule = await _context.DiscountRules.FindAsync(id);
        if (rule == null) return null;

        rule.Name = dto.Name;
        rule.Description = dto.Description;
        rule.DiscountType = dto.DiscountType;
        rule.Value = dto.Value;
        rule.MaxDiscountAmount = dto.MaxDiscountAmount;
        rule.MinOrderAmount = dto.MinOrderAmount;
        rule.AppliesTo = dto.AppliesTo;
        rule.TargetId = dto.TargetId;
        rule.StartDate = dto.StartDate;
        rule.EndDate = dto.EndDate;
        rule.IsActive = dto.IsActive;
        rule.Priority = dto.Priority;
        rule.IsStackable = dto.IsStackable;
        rule.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapRule(rule);
    }

    public async Task<bool> DeleteRuleAsync(int id)
    {
        var rule = await _context.DiscountRules.FindAsync(id);
        if (rule == null) return false;
        _context.DiscountRules.Remove(rule);
        await _context.SaveChangesAsync();
        return true;
    }

    // ── Coupon validation (public endpoint) ──────────────────────────────────

    public async Task<CouponValidationResultDto> ValidateCouponAsync(
        string code, int? userId, decimal orderAmount)
    {
        var (coupon, error) = await FindValidCouponAsync(code.Trim().ToUpperInvariant(), userId, orderAmount);
        if (coupon == null)
            return new CouponValidationResultDto { IsValid = false, ErrorMessage = error };

        var discount = CalculateCouponDiscount(coupon, orderAmount);
        return new CouponValidationResultDto
        {
            IsValid = true,
            Code = coupon.Code,
            Name = coupon.Name,
            DiscountAmount = discount
        };
    }

    // ── Pricing engine ────────────────────────────────────────────────────────

    public async Task<DiscountPreviewDto> CalculateDiscountsAsync(
        List<DiscountCartItemDto> items, string? couponCode, int? userId)
    {
        var subTotal = items.Sum(i => i.UnitPrice * i.Quantity);
        var applied = new List<AppliedDiscountDto>();
        var remainingTotal = subTotal;

        // 1. Load active rules ordered by priority
        var now = DateTime.UtcNow;
        var rules = await _context.DiscountRules
            .Where(r => r.IsActive
                && (r.StartDate == null || r.StartDate <= now)
                && (r.EndDate == null || r.EndDate >= now)
                && (r.MinOrderAmount == null || r.MinOrderAmount <= subTotal))
            .OrderBy(r => r.Priority)
            .ToListAsync();

        bool blockStacking = false;

        foreach (var rule in rules)
        {
            if (blockStacking && !rule.IsStackable) continue;

            var applicableSubtotal = GetApplicableSubtotal(rule, items);
            if (applicableSubtotal <= 0) continue;

            var discountAmount = CalculateAmount(rule.DiscountType, rule.Value, rule.MaxDiscountAmount, applicableSubtotal);
            discountAmount = Math.Min(discountAmount, remainingTotal); // never exceed what's left
            if (discountAmount <= 0) continue;

            applied.Add(new AppliedDiscountDto
            {
                Source = DiscountSource.Rule.ToString(),
                SourceId = rule.Id,
                SourceLabel = rule.Name,
                DiscountAmount = discountAmount,
                Description = rule.Description
            });

            remainingTotal -= discountAmount;

            if (!rule.IsStackable)
                blockStacking = true;
        }

        // 2. Apply coupon (applied after auto rules)
        if (!string.IsNullOrWhiteSpace(couponCode))
        {
            var (coupon, _) = await FindValidCouponAsync(couponCode.Trim().ToUpperInvariant(), userId, subTotal);
            if (coupon != null)
            {
                var couponDiscount = CalculateCouponDiscount(coupon, remainingTotal);
                couponDiscount = Math.Min(couponDiscount, remainingTotal);
                if (couponDiscount > 0)
                {
                    applied.Add(new AppliedDiscountDto
                    {
                        Source = DiscountSource.Coupon.ToString(),
                        SourceId = coupon.Id,
                        SourceLabel = coupon.Code,
                        DiscountAmount = couponDiscount,
                        Description = coupon.Description
                    });
                    remainingTotal -= couponDiscount;
                }
            }
        }

        var totalDiscount = applied.Sum(a => a.DiscountAmount);
        return new DiscountPreviewDto
        {
            SubTotal = subTotal,
            TotalDiscount = totalDiscount,
            FinalTotal = subTotal - totalDiscount,
            AppliedDiscounts = applied
        };
    }

    public async Task WriteOrderDiscountsAsync(int orderId, DiscountPreviewDto preview)
    {
        foreach (var d in preview.AppliedDiscounts)
        {
            _context.OrderDiscounts.Add(new OrderDiscount
            {
                OrderId = orderId,
                Source = Enum.Parse<DiscountSource>(d.Source),
                SourceId = d.SourceId,
                SourceLabel = d.SourceLabel,
                DiscountAmount = d.DiscountAmount,
                Description = d.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        await _context.SaveChangesAsync();
    }

    public async Task IncrementCouponUsageAsync(string couponCode)
    {
        var code = couponCode.Trim().ToUpperInvariant();
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == code);
        if (coupon != null)
        {
            coupon.UsedCount++;
            coupon.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private async Task<(Coupon? coupon, string? error)> FindValidCouponAsync(
        string code, int? userId, decimal orderAmount)
    {
        var now = DateTime.UtcNow;
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == code);

        if (coupon == null)
            return (null, "Coupon not found.");
        if (!coupon.IsActive)
            return (null, "This coupon is no longer active.");
        if (coupon.StartDate.HasValue && coupon.StartDate > now)
            return (null, "This coupon is not yet valid.");
        if (coupon.EndDate.HasValue && coupon.EndDate < now)
            return (null, "This coupon has expired.");
        if (coupon.UsageLimit.HasValue && coupon.UsedCount >= coupon.UsageLimit)
            return (null, "This coupon has reached its usage limit.");
        if (coupon.MinOrderAmount.HasValue && orderAmount < coupon.MinOrderAmount)
            return (null, $"Minimum order amount of ৳{coupon.MinOrderAmount:F0} required for this coupon.");

        if (coupon.PerUserLimit.HasValue && userId.HasValue)
        {
            var userUsage = await _context.OrderDiscounts
                .CountAsync(od =>
                    od.Source == DiscountSource.Coupon &&
                    od.SourceId == coupon.Id &&
                    od.Order.UserId == userId);
            if (userUsage >= coupon.PerUserLimit)
                return (null, "You have already used this coupon the maximum number of times.");
        }

        return (coupon, null);
    }

    private static decimal GetApplicableSubtotal(DiscountRule rule, List<DiscountCartItemDto> items)
    {
        return rule.AppliesTo switch
        {
            DiscountAppliesTo.All => items.Sum(i => i.UnitPrice * i.Quantity),
            DiscountAppliesTo.Category => items
                .Where(i => i.CategoryId == rule.TargetId)
                .Sum(i => i.UnitPrice * i.Quantity),
            DiscountAppliesTo.Product => items
                .Where(i => i.ProductId == rule.TargetId)
                .Sum(i => i.UnitPrice * i.Quantity),
            DiscountAppliesTo.Variant => items
                .Where(i => i.VariantId == rule.TargetId)
                .Sum(i => i.UnitPrice * i.Quantity),
            _ => 0m
        };
    }

    private static decimal CalculateAmount(
        DiscountType type, decimal value, decimal? maxAmount, decimal applicableSubtotal)
    {
        var raw = type switch
        {
            DiscountType.Percentage => applicableSubtotal * value / 100m,
            DiscountType.Fixed => Math.Min(value, applicableSubtotal),
            _ => 0m
        };

        if (type == DiscountType.Percentage && maxAmount.HasValue)
            raw = Math.Min(raw, maxAmount.Value);

        return Math.Round(raw, 2);
    }

    private static decimal CalculateCouponDiscount(Coupon coupon, decimal applicableAmount) =>
        CalculateAmount(coupon.DiscountType, coupon.Value, coupon.MaxDiscountAmount, applicableAmount);

    private static CouponDto MapCoupon(Coupon c) => new()
    {
        Id = c.Id,
        Code = c.Code,
        Name = c.Name,
        Description = c.Description,
        DiscountType = c.DiscountType.ToString(),
        Value = c.Value,
        MaxDiscountAmount = c.MaxDiscountAmount,
        MinOrderAmount = c.MinOrderAmount,
        UsageLimit = c.UsageLimit,
        UsedCount = c.UsedCount,
        PerUserLimit = c.PerUserLimit,
        StartDate = c.StartDate,
        EndDate = c.EndDate,
        IsActive = c.IsActive,
        CreatedAt = c.CreatedAt
    };

    private static DiscountRuleDto MapRule(DiscountRule r) => new()
    {
        Id = r.Id,
        Name = r.Name,
        Description = r.Description,
        DiscountType = r.DiscountType.ToString(),
        Value = r.Value,
        MaxDiscountAmount = r.MaxDiscountAmount,
        MinOrderAmount = r.MinOrderAmount,
        AppliesTo = r.AppliesTo.ToString(),
        TargetId = r.TargetId,
        StartDate = r.StartDate,
        EndDate = r.EndDate,
        IsActive = r.IsActive,
        Priority = r.Priority,
        IsStackable = r.IsStackable,
        CreatedAt = r.CreatedAt
    };
}
