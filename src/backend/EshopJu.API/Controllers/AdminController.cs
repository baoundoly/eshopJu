using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IProductService _productService;

    public AdminController(IOrderService orderService, IProductService productService)
    {
        _orderService = orderService;
        _productService = productService;
    }

    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(DashboardStatsDto), 200)]
    public async Task<IActionResult> GetDashboardStats()
    {
        var stats = await _orderService.GetDashboardStatsAsync();
        return Ok(stats);
    }

    // ── Variant management ──────────────────────────────────────────────────

    [HttpGet("products/{productId:int}/variants")]
    [ProducesResponseType(typeof(List<ProductVariantDto>), 200)]
    public async Task<IActionResult> GetVariants(int productId)
    {
        var variants = await _productService.GetVariantsAsync(productId);
        return Ok(variants);
    }

    [HttpPost("products/{productId:int}/variants")]
    [ProducesResponseType(typeof(ProductVariantDto), 201)]
    public async Task<IActionResult> AddVariant(int productId, [FromBody] CreateProductVariantDto dto)
    {
        var variant = await _productService.AddVariantAsync(productId, dto);
        return CreatedAtAction(nameof(GetVariants), new { productId }, variant);
    }

    [HttpPut("products/{productId:int}/variants/{variantId:int}")]
    [ProducesResponseType(typeof(ProductVariantDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateVariant(int productId, int variantId, [FromBody] CreateProductVariantDto dto)
    {
        var variant = await _productService.UpdateVariantAsync(productId, variantId, dto);
        if (variant == null)
            return NotFound(new { message = $"Variant {variantId} not found for product {productId}." });

        return Ok(variant);
    }

    [HttpDelete("products/{productId:int}/variants/{variantId:int}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteVariant(int productId, int variantId)
    {
        var deleted = await _productService.DeleteVariantAsync(productId, variantId);
        if (!deleted)
            return NotFound(new { message = $"Variant {variantId} not found for product {productId}." });

        return NoContent();
    }

    // ── Orders passthrough (admin-scoped) ───────────────────────────────────

    [HttpGet("orders")]
    [ProducesResponseType(typeof(PagedResult<OrderDto>), 200)]
    public async Task<IActionResult> GetOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null)
    {
        var result = await _orderService.GetOrdersAsync(page, pageSize, status);
        return Ok(result);
    }

    [HttpPut("orders/{id:int}/status")]
    [ProducesResponseType(typeof(OrderDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _orderService.UpdateOrderStatusAsync(id, dto);
        if (order == null)
            return NotFound(new { message = $"Order {id} not found." });

        return Ok(order);
    }

    [HttpPut("orders/{id:int}/verify-payment")]
    [ProducesResponseType(typeof(OrderDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> VerifyPayment(int id, [FromBody] VerifyPaymentDto dto)
    {
        var order = await _orderService.VerifyPaymentAsync(id, dto);
        if (order == null)
            return NotFound(new { message = $"Order {id} not found." });

        return Ok(order);
    }
}
