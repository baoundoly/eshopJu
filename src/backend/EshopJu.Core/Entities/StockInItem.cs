namespace EshopJu.Core.Entities;

public class StockInItem : BaseEntity
{
    public int StockInId { get; set; }
    public StockIn StockIn { get; set; } = null!;

    public int ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;

    public int Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
}
