using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly IDiscountService _discountService;

    public CouponsController(IDiscountService discountService)
    {
        _discountService = discountService;
    }

    // ── Public ────────────────────────────────────────────────────────────────

    /// <summary>Validate a coupon code against a given order amount.</summary>
    [HttpPost("validate")]
    [ProducesResponseType(typeof(CouponValidationResultDto), 200)]
    public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponRequestDto dto)
    {
        int? userId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(claim, out var uid)) userId = uid;
        }

        var result = await _discountService.ValidateCouponAsync(dto.Code, userId, dto.OrderAmount);
        return Ok(result);
    }

    /// <summary>Preview discounts (auto-rules + coupon) for a cart.</summary>
    [HttpPost("preview")]
    [ProducesResponseType(typeof(DiscountPreviewDto), 200)]
    public async Task<IActionResult> PreviewDiscount([FromBody] PreviewDiscountRequestDto dto)
    {
        int? userId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(claim, out var uid)) userId = uid;
        }

        var result = await _discountService.CalculateDiscountsAsync(dto.Items, dto.CouponCode, userId);
        return Ok(result);
    }

    // ── Admin: Coupon CRUD ────────────────────────────────────────────────────

    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(PagedResult<CouponDto>), 200)]
    public async Task<IActionResult> GetCoupons(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _discountService.GetCouponsAsync(page, pageSize);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(CouponDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponDto dto)
    {
        try
        {
            var result = await _discountService.CreateCouponAsync(dto);
            return CreatedAtAction(nameof(GetCoupons), result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(CouponDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateCoupon(int id, [FromBody] CreateCouponDto dto)
    {
        try
        {
            var result = await _discountService.UpdateCouponAsync(id, dto);
            if (result == null) return NotFound(new { message = $"Coupon {id} not found." });
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteCoupon(int id)
    {
        var deleted = await _discountService.DeleteCouponAsync(id);
        if (!deleted) return NotFound(new { message = $"Coupon {id} not found." });
        return NoContent();
    }

    // ── Admin: Discount Rule CRUD ─────────────────────────────────────────────

    [HttpGet("rules")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<DiscountRuleDto>), 200)]
    public async Task<IActionResult> GetRules()
    {
        var result = await _discountService.GetRulesAsync();
        return Ok(result);
    }

    [HttpPost("rules")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(DiscountRuleDto), 201)]
    public async Task<IActionResult> CreateRule([FromBody] CreateDiscountRuleDto dto)
    {
        var result = await _discountService.CreateRuleAsync(dto);
        return CreatedAtAction(nameof(GetRules), result);
    }

    [HttpPut("rules/{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(DiscountRuleDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateRule(int id, [FromBody] CreateDiscountRuleDto dto)
    {
        var result = await _discountService.UpdateRuleAsync(id, dto);
        if (result == null) return NotFound(new { message = $"Rule {id} not found." });
        return Ok(result);
    }

    [HttpDelete("rules/{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteRule(int id)
    {
        var deleted = await _discountService.DeleteRuleAsync(id);
        if (!deleted) return NotFound(new { message = $"Rule {id} not found." });
        return NoContent();
    }
}

/// <summary>Request body for the preview endpoint.</summary>
public class PreviewDiscountRequestDto
{
    public List<DiscountCartItemDto> Items { get; set; } = new();
    public string? CouponCode { get; set; }
}
