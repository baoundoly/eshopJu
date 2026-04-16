using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IOrderService _orderService;

    public AdminController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet("dashboard")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(DashboardStatsDto), 200)]
    public async Task<IActionResult> GetDashboardStats()
    {
        var stats = await _orderService.GetDashboardStatsAsync();
        return Ok(stats);
    }
}
