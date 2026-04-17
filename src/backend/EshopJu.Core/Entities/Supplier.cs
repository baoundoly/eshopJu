namespace EshopJu.Core.Entities;

public class Supplier : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? ContactPhone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<StockIn> StockIns { get; set; } = new List<StockIn>();
}
