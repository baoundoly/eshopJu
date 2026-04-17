namespace EshopJu.Core.Entities;

public class CartItem : BaseEntity
{
    public int CartId { get; set; }
    public Cart Cart { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int? VariantId { get; set; }
    public ProductVariant? Variant { get; set; }

    public string Size { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? JerseyType { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
