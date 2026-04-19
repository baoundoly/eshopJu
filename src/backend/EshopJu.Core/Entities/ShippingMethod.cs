namespace EshopJu.Core.Entities;

public class ShippingMethod : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<ShippingRate> Rates { get; set; } = new List<ShippingRate>();
}
