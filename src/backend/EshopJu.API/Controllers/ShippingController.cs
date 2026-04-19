using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShippingController : ControllerBase
{
    private readonly IShippingService _shippingService;

    public ShippingController(IShippingService shippingService)
    {
        _shippingService = shippingService;
    }

    // ── Public ────────────────────────────────────────────────────────────────

    /// <summary>Get all available shipping options for a given location and cart total.</summary>
    [HttpPost("options")]
    [ProducesResponseType(typeof(List<ShippingOptionDto>), 200)]
    public async Task<IActionResult> GetShippingOptions([FromBody] ShippingLookupRequestDto request)
    {
        var options = await _shippingService.GetShippingOptionsAsync(request);
        return Ok(options);
    }

    /// <summary>Get the shipping zone for a district (and optional thana).</summary>
    [HttpGet("zone")]
    [ProducesResponseType(typeof(ShippingZoneDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetZoneByArea(
        [FromQuery] string district,
        [FromQuery] string? thana = null)
    {
        var zone = await _shippingService.GetZoneByAreaAsync(district, thana);
        if (zone == null) return NotFound(new { message = $"No shipping zone found for district '{district}'." });
        return Ok(zone);
    }

    // ── Admin: Zones ──────────────────────────────────────────────────────────

    [HttpGet("zones")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<ShippingZoneDto>), 200)]
    public async Task<IActionResult> GetZones()
    {
        return Ok(await _shippingService.GetZonesAsync());
    }

    [HttpPost("zones")]
    [Authorize(Roles = "Admin")]
    [Authorize(Policy = "ManageShipping")]
    [ProducesResponseType(typeof(ShippingZoneDto), 201)]
    public async Task<IActionResult> CreateZone([FromBody] CreateShippingZoneDto dto)
    {
        var result = await _shippingService.CreateZoneAsync(dto);
        return CreatedAtAction(nameof(GetZones), result);
    }

    [HttpPut("zones/{id:int}")]
    [Authorize(Roles = "Admin")]
    [Authorize(Policy = "ManageShipping")]
    [ProducesResponseType(typeof(ShippingZoneDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateZone(int id, [FromBody] CreateShippingZoneDto dto)
    {
        var result = await _shippingService.UpdateZoneAsync(id, dto);
        if (result == null) return NotFound(new { message = $"Zone {id} not found." });
        return Ok(result);
    }

    [HttpDelete("zones/{id:int}")]
    [Authorize(Roles = "Admin")]
    [Authorize(Policy = "ManageShipping")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteZone(int id)
    {
        if (!await _shippingService.DeleteZoneAsync(id))
            return NotFound(new { message = $"Zone {id} not found." });
        return NoContent();
    }

    // ── Admin: Methods ────────────────────────────────────────────────────────

    [HttpGet("methods")]
    [ProducesResponseType(typeof(List<ShippingMethodDto>), 200)]
    public async Task<IActionResult> GetMethods()
    {
        return Ok(await _shippingService.GetMethodsAsync());
    }

    [HttpPost("methods")]
    [Authorize(Roles = "Admin")]
    [Authorize(Policy = "ManageShipping")]
    [ProducesResponseType(typeof(ShippingMethodDto), 201)]
    public async Task<IActionResult> CreateMethod([FromBody] CreateShippingMethodDto dto)
    {
        var result = await _shippingService.CreateMethodAsync(dto);
        return CreatedAtAction(nameof(GetMethods), result);
    }

    [HttpPut("methods/{id:int}")]
    [Authorize(Roles = "Admin")]
    [Authorize(Policy = "ManageShipping")]
    [ProducesResponseType(typeof(ShippingMethodDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateMethod(int id, [FromBody] CreateShippingMethodDto dto)
    {
        var result = await _shippingService.UpdateMethodAsync(id, dto);
        if (result == null) return NotFound(new { message = $"Method {id} not found." });
        return Ok(result);
    }

    [HttpDelete("methods/{id:int}")]
    [Authorize(Roles = "Admin")]
    [Authorize(Policy = "ManageShipping")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteMethod(int id)
    {
        if (!await _shippingService.DeleteMethodAsync(id))
            return NotFound(new { message = $"Method {id} not found." });
        return NoContent();
    }

    // ── Admin: Rates ──────────────────────────────────────────────────────────

    [HttpGet("rates")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<ShippingRateDto>), 200)]
    public async Task<IActionResult> GetRates()
    {
        return Ok(await _shippingService.GetRatesAsync());
    }

    [HttpPost("rates")]
    [Authorize(Roles = "Admin")]
    [Authorize(Policy = "ManageShipping")]
    [ProducesResponseType(typeof(ShippingRateDto), 201)]
    public async Task<IActionResult> CreateRate([FromBody] CreateShippingRateDto dto)
    {
        var result = await _shippingService.CreateRateAsync(dto);
        return CreatedAtAction(nameof(GetRates), result);
    }

    [HttpPut("rates/{id:int}")]
    [Authorize(Roles = "Admin")]
    [Authorize(Policy = "ManageShipping")]
    [ProducesResponseType(typeof(ShippingRateDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateRate(int id, [FromBody] CreateShippingRateDto dto)
    {
        var result = await _shippingService.UpdateRateAsync(id, dto);
        if (result == null) return NotFound(new { message = $"Rate {id} not found." });
        return Ok(result);
    }

    [HttpDelete("rates/{id:int}")]
    [Authorize(Roles = "Admin")]
    [Authorize(Policy = "ManageShipping")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteRate(int id)
    {
        if (!await _shippingService.DeleteRateAsync(id))
            return NotFound(new { message = $"Rate {id} not found." });
        return NoContent();
    }
}
