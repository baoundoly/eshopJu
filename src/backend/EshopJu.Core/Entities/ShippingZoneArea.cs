namespace EshopJu.Core.Entities;

/// <summary>Maps a district (and optionally thana) to a shipping zone.</summary>
public class ShippingZoneArea : BaseEntity
{
    public int ZoneId { get; set; }
    public ShippingZone Zone { get; set; } = null!;

    public string District { get; set; } = string.Empty;

    /// <summary>Optional sub-district precision. Null = entire district belongs to zone.</summary>
    public string? Thana { get; set; }
}
