namespace EshopJu.Core.Entities;

public class StockIn : BaseEntity
{
    public int? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public string? Notes { get; set; }

    public ICollection<StockInItem> Items { get; set; } = new List<StockInItem>();
}
