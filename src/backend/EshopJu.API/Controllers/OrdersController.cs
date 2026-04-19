using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    private int? GetUserId()
    {
        var claim = User.FindFirst("id")?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(PagedResult<OrderDto>), 200)]
    public async Task<IActionResult> GetOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null)
    {
        var result = await _orderService.GetOrdersAsync(page, pageSize, status);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(OrderDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetOrderById(int id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null)
            return NotFound(new { message = $"Order {id} not found." });

        return Ok(order);
    }

    [HttpGet("number/{orderNumber}")]
    [ProducesResponseType(typeof(OrderDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetOrderByNumber(string orderNumber)
    {
        var order = await _orderService.GetOrderByNumberAsync(orderNumber);
        if (order == null)
            return NotFound(new { message = $"Order '{orderNumber}' not found." });

        return Ok(order);
    }

    [HttpPost]
    [ProducesResponseType(typeof(OrderDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        var order = await _orderService.CreateOrderAsync(dto, GetUserId());
        return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(OrderDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _orderService.UpdateOrderStatusAsync(id, dto);
        if (order == null)
            return NotFound(new { message = $"Order {id} not found." });

        return Ok(order);
    }

    [HttpPut("{id:int}/payment")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(OrderDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> VerifyPayment(int id, [FromBody] VerifyPaymentDto dto)
    {
        var order = await _orderService.VerifyPaymentAsync(id, dto);
        if (order == null)
            return NotFound(new { message = $"Order {id} not found." });

        return Ok(order);
    }

    [HttpPost("whatsapp-link")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GenerateWhatsAppLink([FromBody] WhatsAppOrderMessageDto dto)
    {
        var url = await _orderService.GenerateWhatsAppLinkAsync(dto);
        return Ok(new { url });
    }
}
