namespace EshopJu.Core.Entities;

public class ShippingZone : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<ShippingZoneArea> Areas { get; set; } = new List<ShippingZoneArea>();
    public ICollection<ShippingRate> Rates { get; set; } = new List<ShippingRate>();
}
