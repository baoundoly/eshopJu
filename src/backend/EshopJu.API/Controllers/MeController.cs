using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/me")]
[Authorize]
public class MeController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ICustomerService _customerService;

    public MeController(IOrderService orderService, ICustomerService customerService)
    {
        _orderService = orderService;
        _customerService = customerService;
    }

    private int? GetUserId()
    {
        var claim = User.FindFirst("id")?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }

    /// <summary>Returns the logged-in customer's purchase history (all orders + stats).</summary>
    [HttpGet("orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var orders = await _orderService.GetOrdersForUserAsync(userId.Value);
        return Ok(orders);
    }

    /// <summary>Returns a single order by order number, scoped to the logged-in customer.</summary>
    [HttpGet("orders/{orderNumber}")]
    public async Task<IActionResult> GetMyOrder(string orderNumber)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var order = await _orderService.GetOrderByNumberForUserAsync(orderNumber, userId.Value);
        if (order == null)
            return NotFound(new { message = $"Order '{orderNumber}' not found." });

        return Ok(order);
    }

    /// <summary>Returns the customer profile + full purchase history for the logged-in user.</summary>
    [HttpGet("purchase-history")]
    public async Task<IActionResult> GetPurchaseHistory()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var history = await _customerService.GetPurchaseHistoryForUserAsync(userId.Value);
        if (history == null) return Unauthorized();

        return Ok(history);
    }
}
