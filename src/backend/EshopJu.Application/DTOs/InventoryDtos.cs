namespace EshopJu.Application.DTOs;

// ── Supplier ─────────────────────────────────────────────────────────────────

public class SupplierDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ContactPhone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSupplierDto
{
    public string Name { get; set; } = string.Empty;
    public string? ContactPhone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
}

// ── Stock In ─────────────────────────────────────────────────────────────────

public class CreateStockInItemDto
{
    public int ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
}

public class CreateStockInDto
{
    public int? SupplierId { get; set; }
    public string? Notes { get; set; }
    public List<CreateStockInItemDto> Items { get; set; } = new();
}

public class StockInItemDto
{
    public int ProductVariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantLabel { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
}

public class StockInDto
{
    public int Id { get; set; }
    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public string? Notes { get; set; }
    public List<StockInItemDto> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

// ── Stock Movement ────────────────────────────────────────────────────────────

public class StockMovementDto
{
    public int Id { get; set; }
    public int ProductVariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantLabel { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string MovementType { get; set; } = string.Empty;
    public string ReferenceType { get; set; } = string.Empty;
    public int? ReferenceId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ── Adjustment ────────────────────────────────────────────────────────────────

public class StockAdjustmentDto
{
    /// <summary>Positive to add, negative to remove.</summary>
    public int QuantityChange { get; set; }
    public string? Notes { get; set; }
}

// ── Inventory overview ───────────────────────────────────────────────────────

public class InventoryVariantDto
{
    public int VariantId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string JerseyType { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; }
    public bool IsLowStock { get; set; }
}

public class InventoryDashboardDto
{
    public int TotalVariants { get; set; }
    public int LowStockVariants { get; set; }
    public int OutOfStockVariants { get; set; }
    public decimal TotalStockValue { get; set; }
    public List<InventoryVariantDto> LowStockItems { get; set; } = new();
}
