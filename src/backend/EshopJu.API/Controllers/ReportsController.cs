using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
[Authorize(Policy = "ViewReports")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    /// <summary>Extended dashboard with KPI cards, charts, and tables.</summary>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(ExtendedDashboardDto), 200)]
    public async Task<IActionResult> GetDashboard()
    {
        return Ok(await _reportService.GetExtendedDashboardAsync());
    }

    /// <summary>Sales report with daily trend, payment method, and status breakdowns.</summary>
    [HttpGet("sales")]
    [ProducesResponseType(typeof(SalesReportDto), 200)]
    public async Task<IActionResult> GetSalesReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _reportService.GetSalesReportAsync(new ReportFilterDto { From = from, To = to });
        return Ok(result);
    }

    /// <summary>Profit report: gross profit, net profit, margin, and per-product breakdown.</summary>
    [HttpGet("profit")]
    [ProducesResponseType(typeof(ProfitReportDto), 200)]
    public async Task<IActionResult> GetProfitReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _reportService.GetProfitReportAsync(new ReportFilterDto { From = from, To = to });
        return Ok(result);
    }

    /// <summary>Inventory report: stock levels, stock value, low/out-of-stock items.</summary>
    [HttpGet("inventory")]
    [ProducesResponseType(typeof(InventoryReportDto), 200)]
    public async Task<IActionResult> GetInventoryReport()
    {
        return Ok(await _reportService.GetInventoryReportAsync());
    }

    /// <summary>Stock movement report: IN/OUT/Adjustments with date filters.</summary>
    [HttpGet("stock-movements")]
    [ProducesResponseType(typeof(StockMovementReportDto), 200)]
    public async Task<IActionResult> GetStockMovementReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _reportService.GetStockMovementReportAsync(new ReportFilterDto { From = from, To = to });
        return Ok(result);
    }

    /// <summary>Discount and coupon usage report.</summary>
    [HttpGet("discounts")]
    [ProducesResponseType(typeof(DiscountReportDto), 200)]
    public async Task<IActionResult> GetDiscountReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _reportService.GetDiscountReportAsync(new ReportFilterDto { From = from, To = to });
        return Ok(result);
    }

    /// <summary>Shipping report: zone-wise and method-wise delivery counts and revenue.</summary>
    [HttpGet("shipping")]
    [ProducesResponseType(typeof(ShippingReportDto), 200)]
    public async Task<IActionResult> GetShippingReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _reportService.GetShippingReportAsync(new ReportFilterDto { From = from, To = to });
        return Ok(result);
    }

    /// <summary>Top-selling products and variants.</summary>
    [HttpGet("top-products")]
    [ProducesResponseType(typeof(TopProductsReportDto), 200)]
    public async Task<IActionResult> GetTopProductsReport(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int top = 10)
    {
        var result = await _reportService.GetTopProductsReportAsync(new ReportFilterDto { From = from, To = to }, top);
        return Ok(result);
    }

    /// <summary>Customer report: totals, repeat customers, top buyers.</summary>
    [HttpGet("customers")]
    [ProducesResponseType(typeof(CustomerReportDto), 200)]
    public async Task<IActionResult> GetCustomerReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _reportService.GetCustomerReportAsync(new ReportFilterDto { From = from, To = to });
        return Ok(result);
    }
}
