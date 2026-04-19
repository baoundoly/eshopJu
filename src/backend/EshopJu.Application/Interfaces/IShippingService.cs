using EshopJu.Application.DTOs;

namespace EshopJu.Application.Interfaces;

public interface IShippingService
{
    // ── Public ────────────────────────────────────────────────────────────────

    /// <summary>Return the shipping zone that covers <paramref name="district"/> (and optionally <paramref name="thana"/>).</summary>
    Task<ShippingZoneDto?> GetZoneByAreaAsync(string district, string? thana = null);

    /// <summary>Return all available shipping options (method + cost) for the given location and cart total.</summary>
    Task<List<ShippingOptionDto>> GetShippingOptionsAsync(ShippingLookupRequestDto request);

    /// <summary>Calculate the shipping cost for a specific method and location.</summary>
    Task<decimal> CalculateShippingCostAsync(int zoneId, int methodId, decimal orderAmount);

    // ── Admin: Zone CRUD ──────────────────────────────────────────────────────

    Task<List<ShippingZoneDto>> GetZonesAsync();
    Task<ShippingZoneDto> CreateZoneAsync(CreateShippingZoneDto dto);
    Task<ShippingZoneDto?> UpdateZoneAsync(int id, CreateShippingZoneDto dto);
    Task<bool> DeleteZoneAsync(int id);

    // ── Admin: Method CRUD ────────────────────────────────────────────────────

    Task<List<ShippingMethodDto>> GetMethodsAsync();
    Task<ShippingMethodDto> CreateMethodAsync(CreateShippingMethodDto dto);
    Task<ShippingMethodDto?> UpdateMethodAsync(int id, CreateShippingMethodDto dto);
    Task<bool> DeleteMethodAsync(int id);

    // ── Admin: Rate CRUD ──────────────────────────────────────────────────────

    Task<List<ShippingRateDto>> GetRatesAsync();
    Task<ShippingRateDto> CreateRateAsync(CreateShippingRateDto dto);
    Task<ShippingRateDto?> UpdateRateAsync(int id, CreateShippingRateDto dto);
    Task<bool> DeleteRateAsync(int id);
}
