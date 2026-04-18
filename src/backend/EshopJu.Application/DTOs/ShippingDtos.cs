namespace EshopJu.Application.DTOs;

// ── Shipping Zone ─────────────────────────────────────────────────────────────

public class ShippingZoneDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public List<ShippingZoneAreaDto> Areas { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class ShippingZoneAreaDto
{
    public int Id { get; set; }
    public string District { get; set; } = string.Empty;
    public string? Thana { get; set; }
}

public class CreateShippingZoneDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public List<UpsertShippingZoneAreaDto> Areas { get; set; } = new();
}

public class UpsertShippingZoneAreaDto
{
    public string District { get; set; } = string.Empty;
    public string? Thana { get; set; }
}

// ── Shipping Method ───────────────────────────────────────────────────────────

public class ShippingMethodDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateShippingMethodDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

// ── Shipping Rate ─────────────────────────────────────────────────────────────

public class ShippingRateDto
{
    public int Id { get; set; }
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public int MethodId { get; set; }
    public string MethodName { get; set; } = string.Empty;
    public decimal? MinOrderAmount { get; set; }
    public decimal? MaxOrderAmount { get; set; }
    public decimal Rate { get; set; }
    public bool IsFreeShipping { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateShippingRateDto
{
    public int ZoneId { get; set; }
    public int MethodId { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public decimal? MaxOrderAmount { get; set; }
    public decimal Rate { get; set; }
    public bool IsFreeShipping { get; set; }
}

// ── Shipping lookup ───────────────────────────────────────────────────────────

public class ShippingLookupRequestDto
{
    public string District { get; set; } = string.Empty;
    public string? Thana { get; set; }
    public decimal OrderAmount { get; set; }
}

public class ShippingOptionDto
{
    public int MethodId { get; set; }
    public string MethodName { get; set; } = string.Empty;
    public int ZoneId { get; set; }
    public string ZoneName { get; set; } = string.Empty;
    public decimal ShippingCost { get; set; }
    public bool IsFreeShipping { get; set; }
}
