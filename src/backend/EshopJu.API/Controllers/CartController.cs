using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private int? GetUserId()
    {
        var claim = User.FindFirst("id")?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }

    private string? GetSessionId() =>
        Request.Headers.TryGetValue("X-Session-Id", out var val) ? val.ToString() : null;

    [HttpGet]
    [ProducesResponseType(typeof(CartDto), 200)]
    public async Task<IActionResult> GetCart()
    {
        var cart = await _cartService.GetCartAsync(GetUserId(), GetSessionId());
        return Ok(cart);
    }

    [HttpPost("items")]
    [ProducesResponseType(typeof(CartDto), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        var cart = await _cartService.AddToCartAsync(GetUserId(), GetSessionId(), dto);
        return Ok(cart);
    }

    [HttpPut("items/{itemId:int}")]
    [ProducesResponseType(typeof(CartDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateCartItem(int itemId, [FromBody] UpdateCartItemDto dto)
    {
        var cart = await _cartService.UpdateCartItemAsync(GetUserId(), GetSessionId(), itemId, dto);
        return Ok(cart);
    }

    [HttpDelete("items/{itemId:int}")]
    [ProducesResponseType(typeof(CartDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RemoveFromCart(int itemId)
    {
        var cart = await _cartService.RemoveFromCartAsync(GetUserId(), GetSessionId(), itemId);
        return Ok(cart);
    }

    [HttpDelete]
    [ProducesResponseType(204)]
    public async Task<IActionResult> ClearCart()
    {
        await _cartService.ClearCartAsync(GetUserId(), GetSessionId());
        return NoContent();
    }
}
