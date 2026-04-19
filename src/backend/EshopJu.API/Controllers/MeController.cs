using EshopJu.Application.DTOs;
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
    private readonly IAuthService _authService;

    public MeController(IOrderService orderService, ICustomerService customerService, IAuthService authService)
    {
        _orderService = orderService;
        _customerService = customerService;
        _authService = authService;
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

    /// <summary>Returns the logged-in user's account profile (name, email, phone).</summary>
    [HttpGet("profile")]
    [ProducesResponseType(typeof(UserProfileDto), 200)]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profile = await _authService.GetProfileAsync(userId.Value);
        if (profile == null) return Unauthorized();

        return Ok(profile);
    }

    /// <summary>Updates the logged-in user's name and/or phone number.</summary>
    [HttpPut("profile")]
    [ProducesResponseType(typeof(UserProfileDto), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(dto.Name) && string.IsNullOrWhiteSpace(dto.Phone))
            return BadRequest(new { message = "Provide at least one field to update (Name or Phone)." });

        var profile = await _authService.UpdateProfileAsync(userId.Value, dto);
        if (profile == null) return Unauthorized();

        return Ok(profile);
    }

    /// <summary>Changes the logged-in user's password. Requires the current password for verification.</summary>
    [HttpPut("password")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
            return BadRequest(new { message = "CurrentPassword and NewPassword are required." });

        if (dto.NewPassword.Length < 6)
            return BadRequest(new { message = "NewPassword must be at least 6 characters." });

        var success = await _authService.ChangePasswordAsync(userId.Value, dto);
        if (!success)
            return BadRequest(new { message = "Current password is incorrect." });

        return Ok(new { message = "Password changed successfully." });
    }
}
