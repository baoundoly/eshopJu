namespace EshopJu.Core.Entities;

public class ShippingRate : BaseEntity
{
    public int ZoneId { get; set; }
    public ShippingZone Zone { get; set; } = null!;

    public int MethodId { get; set; }
    public ShippingMethod Method { get; set; } = null!;

    /// <summary>Minimum order subtotal for this rate to apply. Null = always applicable.</summary>
    public decimal? MinOrderAmount { get; set; }

    /// <summary>Maximum order subtotal for this rate to apply. Null = no upper limit.</summary>
    public decimal? MaxOrderAmount { get; set; }

    public decimal Rate { get; set; }

    /// <summary>When true, shipping is free regardless of Rate value.</summary>
    public bool IsFreeShipping { get; set; }
}
