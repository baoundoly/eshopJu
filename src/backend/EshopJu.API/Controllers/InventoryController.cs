using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
[Authorize(Policy = "ManageInventory")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────

    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(InventoryDashboardDto), 200)]
    public async Task<IActionResult> GetDashboard()
    {
        var result = await _inventoryService.GetInventoryDashboardAsync();
        return Ok(result);
    }

    // ── Inventory snapshot ────────────────────────────────────────────────────

    [HttpGet]
    [ProducesResponseType(typeof(List<InventoryVariantDto>), 200)]
    public async Task<IActionResult> GetInventory([FromQuery] int? productId = null)
    {
        var result = await _inventoryService.GetInventoryAsync(productId);
        return Ok(result);
    }

    // ── Suppliers ─────────────────────────────────────────────────────────────

    [HttpGet("suppliers")]
    [ProducesResponseType(typeof(List<SupplierDto>), 200)]
    public async Task<IActionResult> GetSuppliers()
    {
        var result = await _inventoryService.GetSuppliersAsync();
        return Ok(result);
    }

    [HttpPost("suppliers")]
    [ProducesResponseType(typeof(SupplierDto), 201)]
    public async Task<IActionResult> CreateSupplier([FromBody] CreateSupplierDto dto)
    {
        var result = await _inventoryService.CreateSupplierAsync(dto);
        return CreatedAtAction(nameof(GetSuppliers), result);
    }

    // ── Stock In ──────────────────────────────────────────────────────────────

    [HttpGet("stock-in")]
    [ProducesResponseType(typeof(PagedResult<StockInDto>), 200)]
    public async Task<IActionResult> GetStockIns(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _inventoryService.GetStockInsAsync(page, pageSize);
        return Ok(result);
    }

    [HttpPost("stock-in")]
    [ProducesResponseType(typeof(StockInDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> AddStock([FromBody] CreateStockInDto dto)
    {
        try
        {
            var result = await _inventoryService.AddStockAsync(dto);
            return CreatedAtAction(nameof(GetStockIns), result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── Adjustment ────────────────────────────────────────────────────────────

    [HttpPost("variants/{variantId:int}/adjust")]
    [ProducesResponseType(typeof(StockMovementDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AdjustStock(int variantId, [FromBody] StockAdjustmentDto dto)
    {
        try
        {
            var result = await _inventoryService.AdjustStockAsync(variantId, dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ── Movement history ──────────────────────────────────────────────────────

    [HttpGet("history")]
    [ProducesResponseType(typeof(PagedResult<StockMovementDto>), 200)]
    public async Task<IActionResult> GetHistory(
        [FromQuery] int? variantId = null,
        [FromQuery] int? productId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30)
    {
        var result = await _inventoryService.GetStockHistoryAsync(variantId, productId, page, pageSize);
        return Ok(result);
    }
}
