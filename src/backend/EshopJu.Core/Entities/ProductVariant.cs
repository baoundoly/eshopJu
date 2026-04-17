using EshopJu.Core.Enums;

namespace EshopJu.Core.Entities;

public class ProductVariant : BaseEntity
{
    public string Color { get; set; } = string.Empty;
    public JerseyType JerseyType { get; set; } = JerseyType.NotApplicable;
    public string Size { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public string? Sku { get; set; }

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}
