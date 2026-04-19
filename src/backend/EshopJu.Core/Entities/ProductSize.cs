namespace EshopJu.Core.Entities;

public class ProductSize : BaseEntity
{
    public string Size { get; set; } = string.Empty; // S, M, L, XL, XXL
    public int StockQuantity { get; set; }

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}
