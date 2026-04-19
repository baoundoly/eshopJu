using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using EshopJu.Core.Entities;
using EshopJu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.Infrastructure.Services;

public class ShippingService : IShippingService
{
    private readonly AppDbContext _context;

    public ShippingService(AppDbContext context)
    {
        _context = context;
    }

    // ── Public helpers ────────────────────────────────────────────────────────

    public async Task<ShippingZoneDto?> GetZoneByAreaAsync(string district, string? thana = null)
    {
        var districtNorm = district.Trim().ToLowerInvariant();
        var thanaNorm = thana?.Trim().ToLowerInvariant();

        // Try thana-specific match first (more precise)
        ShippingZoneArea? area = null;

        if (!string.IsNullOrWhiteSpace(thanaNorm))
        {
            area = await _context.ShippingZoneAreas
                .Include(a => a.Zone).ThenInclude(z => z.Areas)
                .Where(a => a.Zone.IsActive
                    && a.District.ToLower() == districtNorm
                    && a.Thana != null
                    && a.Thana.ToLower() == thanaNorm)
                .FirstOrDefaultAsync();
        }

        // Fall back to district-only match
        area ??= await _context.ShippingZoneAreas
            .Include(a => a.Zone).ThenInclude(z => z.Areas)
            .Where(a => a.Zone.IsActive
                && a.District.ToLower() == districtNorm
                && a.Thana == null)
            .FirstOrDefaultAsync();

        return area == null ? null : MapZone(area.Zone);
    }

    public async Task<List<ShippingOptionDto>> GetShippingOptionsAsync(ShippingLookupRequestDto request)
    {
        var zone = await GetZoneByAreaAsync(request.District, request.Thana);
        if (zone == null) return new List<ShippingOptionDto>();

        var rates = await _context.ShippingRates
            .Include(r => r.Method)
            .Where(r => r.ZoneId == zone.Id
                && r.Method.IsActive
                && (r.MinOrderAmount == null || r.MinOrderAmount <= request.OrderAmount)
                && (r.MaxOrderAmount == null || r.MaxOrderAmount >= request.OrderAmount))
            .ToListAsync();

        return rates.Select(r => new ShippingOptionDto
        {
            MethodId = r.MethodId,
            MethodName = r.Method.Name,
            ZoneId = zone.Id,
            ZoneName = zone.Name,
            ShippingCost = r.IsFreeShipping ? 0m : r.Rate,
            IsFreeShipping = r.IsFreeShipping
        }).ToList();
    }

    public async Task<decimal> CalculateShippingCostAsync(int zoneId, int methodId, decimal orderAmount)
    {
        var rate = await _context.ShippingRates
            .Where(r => r.ZoneId == zoneId && r.MethodId == methodId
                && (r.MinOrderAmount == null || r.MinOrderAmount <= orderAmount)
                && (r.MaxOrderAmount == null || r.MaxOrderAmount >= orderAmount))
            .OrderByDescending(r => r.MinOrderAmount) // most specific (highest floor) wins
            .FirstOrDefaultAsync();

        if (rate == null) return 0m;
        return rate.IsFreeShipping ? 0m : rate.Rate;
    }

    // ── Zone CRUD ─────────────────────────────────────────────────────────────

    public async Task<List<ShippingZoneDto>> GetZonesAsync()
    {
        var zones = await _context.ShippingZones
            .Include(z => z.Areas)
            .OrderBy(z => z.Name)
            .ToListAsync();
        return zones.Select(MapZone).ToList();
    }

    public async Task<ShippingZoneDto> CreateZoneAsync(CreateShippingZoneDto dto)
    {
        var zone = new ShippingZone
        {
            Name = dto.Name,
            Description = dto.Description,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var a in dto.Areas)
            zone.Areas.Add(new ShippingZoneArea
            {
                District = a.District.Trim(),
                Thana = a.Thana?.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

        _context.ShippingZones.Add(zone);
        await _context.SaveChangesAsync();
        return MapZone(zone);
    }

    public async Task<ShippingZoneDto?> UpdateZoneAsync(int id, CreateShippingZoneDto dto)
    {
        var zone = await _context.ShippingZones
            .Include(z => z.Areas)
            .FirstOrDefaultAsync(z => z.Id == id);
        if (zone == null) return null;

        zone.Name = dto.Name;
        zone.Description = dto.Description;
        zone.IsActive = dto.IsActive;
        zone.UpdatedAt = DateTime.UtcNow;

        // Replace areas
        _context.ShippingZoneAreas.RemoveRange(zone.Areas);
        zone.Areas.Clear();
        foreach (var a in dto.Areas)
            zone.Areas.Add(new ShippingZoneArea
            {
                District = a.District.Trim(),
                Thana = a.Thana?.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

        await _context.SaveChangesAsync();
        return MapZone(zone);
    }

    public async Task<bool> DeleteZoneAsync(int id)
    {
        var zone = await _context.ShippingZones.FindAsync(id);
        if (zone == null) return false;
        _context.ShippingZones.Remove(zone);
        await _context.SaveChangesAsync();
        return true;
    }

    // ── Method CRUD ───────────────────────────────────────────────────────────

    public async Task<List<ShippingMethodDto>> GetMethodsAsync()
    {
        return await _context.ShippingMethods
            .OrderBy(m => m.Name)
            .Select(m => MapMethod(m))
            .ToListAsync();
    }

    public async Task<ShippingMethodDto> CreateMethodAsync(CreateShippingMethodDto dto)
    {
        var method = new ShippingMethod
        {
            Name = dto.Name,
            Description = dto.Description,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.ShippingMethods.Add(method);
        await _context.SaveChangesAsync();
        return MapMethod(method);
    }

    public async Task<ShippingMethodDto?> UpdateMethodAsync(int id, CreateShippingMethodDto dto)
    {
        var method = await _context.ShippingMethods.FindAsync(id);
        if (method == null) return null;
        method.Name = dto.Name;
        method.Description = dto.Description;
        method.IsActive = dto.IsActive;
        method.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapMethod(method);
    }

    public async Task<bool> DeleteMethodAsync(int id)
    {
        var method = await _context.ShippingMethods.FindAsync(id);
        if (method == null) return false;
        _context.ShippingMethods.Remove(method);
        await _context.SaveChangesAsync();
        return true;
    }

    // ── Rate CRUD ─────────────────────────────────────────────────────────────

    public async Task<List<ShippingRateDto>> GetRatesAsync()
    {
        return await _context.ShippingRates
            .Include(r => r.Zone)
            .Include(r => r.Method)
            .OrderBy(r => r.Zone.Name)
            .ThenBy(r => r.Method.Name)
            .Select(r => MapRate(r))
            .ToListAsync();
    }

    public async Task<ShippingRateDto> CreateRateAsync(CreateShippingRateDto dto)
    {
        var rate = new ShippingRate
        {
            ZoneId = dto.ZoneId,
            MethodId = dto.MethodId,
            MinOrderAmount = dto.MinOrderAmount,
            MaxOrderAmount = dto.MaxOrderAmount,
            Rate = dto.Rate,
            IsFreeShipping = dto.IsFreeShipping,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.ShippingRates.Add(rate);
        await _context.SaveChangesAsync();

        await _context.Entry(rate).Reference(r => r.Zone).LoadAsync();
        await _context.Entry(rate).Reference(r => r.Method).LoadAsync();
        return MapRate(rate);
    }

    public async Task<ShippingRateDto?> UpdateRateAsync(int id, CreateShippingRateDto dto)
    {
        var rate = await _context.ShippingRates
            .Include(r => r.Zone)
            .Include(r => r.Method)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (rate == null) return null;

        rate.ZoneId = dto.ZoneId;
        rate.MethodId = dto.MethodId;
        rate.MinOrderAmount = dto.MinOrderAmount;
        rate.MaxOrderAmount = dto.MaxOrderAmount;
        rate.Rate = dto.Rate;
        rate.IsFreeShipping = dto.IsFreeShipping;
        rate.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapRate(rate);
    }

    public async Task<bool> DeleteRateAsync(int id)
    {
        var rate = await _context.ShippingRates.FindAsync(id);
        if (rate == null) return false;
        _context.ShippingRates.Remove(rate);
        await _context.SaveChangesAsync();
        return true;
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private static ShippingZoneDto MapZone(ShippingZone z) => new()
    {
        Id = z.Id,
        Name = z.Name,
        Description = z.Description,
        IsActive = z.IsActive,
        Areas = z.Areas.Select(a => new ShippingZoneAreaDto
        {
            Id = a.Id,
            District = a.District,
            Thana = a.Thana
        }).ToList(),
        CreatedAt = z.CreatedAt
    };

    private static ShippingMethodDto MapMethod(ShippingMethod m) => new()
    {
        Id = m.Id,
        Name = m.Name,
        Description = m.Description,
        IsActive = m.IsActive,
        CreatedAt = m.CreatedAt
    };

    private static ShippingRateDto MapRate(ShippingRate r) => new()
    {
        Id = r.Id,
        ZoneId = r.ZoneId,
        ZoneName = r.Zone.Name,
        MethodId = r.MethodId,
        MethodName = r.Method.Name,
        MinOrderAmount = r.MinOrderAmount,
        MaxOrderAmount = r.MaxOrderAmount,
        Rate = r.Rate,
        IsFreeShipping = r.IsFreeShipping,
        CreatedAt = r.CreatedAt
    };
}
