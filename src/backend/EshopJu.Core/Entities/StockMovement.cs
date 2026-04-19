using EshopJu.Core.Enums;

namespace EshopJu.Core.Entities;

public class StockMovement : BaseEntity
{
    public int ProductVariantId { get; set; }
    public ProductVariant ProductVariant { get; set; } = null!;

    /// <summary>Positive for IN/RETURN, negative for OUT/ADJUSTMENT loss.</summary>
    public int Quantity { get; set; }

    public StockMovementType MovementType { get; set; }

    /// <summary>"Order", "StockIn", "Adjustment", "Return"</summary>
    public string ReferenceType { get; set; } = string.Empty;

    public int? ReferenceId { get; set; }
    public string? Notes { get; set; }
}
