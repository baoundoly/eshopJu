using EshopJu.Core.Enums;

namespace EshopJu.Core.Entities;

public class ProductVariant : BaseEntity
{
    public string Color { get; set; } = string.Empty;
    public JerseyType JerseyType { get; set; } = JerseyType.NotApplicable;
    public string Size { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; } = 5;
    public string? Sku { get; set; }

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
    public ICollection<StockInItem> StockInItems { get; set; } = new List<StockInItem>();
}
