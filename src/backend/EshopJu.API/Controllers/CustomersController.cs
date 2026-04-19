using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    [Authorize(Policy = "ManageCustomer")]
    [ProducesResponseType(typeof(PagedResult<CustomerDto>), 200)]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        var result = await _customerService.GetCustomersAsync(page, pageSize, search);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = "ManageCustomer")]
    [ProducesResponseType(typeof(CustomerPurchaseHistoryDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetCustomer(int id)
    {
        var history = await _customerService.GetCustomerHistoryAsync(id);
        if (history == null)
            return NotFound(new { message = $"Customer {id} not found." });

        return Ok(history);
    }

    [HttpGet("by-phone/{phone}")]
    [Authorize(Policy = "ManageCustomer")]
    [ProducesResponseType(typeof(CustomerDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetCustomerByPhone(string phone)
    {
        var customer = await _customerService.GetCustomerByPhoneAsync(phone);
        if (customer == null)
            return NotFound(new { message = $"No customer found with phone '{phone}'." });

        return Ok(customer);
    }
}
