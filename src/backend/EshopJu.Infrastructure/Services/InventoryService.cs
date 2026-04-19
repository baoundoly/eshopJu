using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using EshopJu.Core.Entities;
using EshopJu.Core.Enums;
using EshopJu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.Infrastructure.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    // ── Suppliers ────────────────────────────────────────────────────────────

    public async Task<List<SupplierDto>> GetSuppliersAsync()
    {
        return await _context.Suppliers
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => MapSupplier(s))
            .ToListAsync();
    }

    public async Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto dto)
    {
        var supplier = new Supplier
        {
            Name = dto.Name,
            ContactPhone = dto.ContactPhone,
            Email = dto.Email,
            Address = dto.Address,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();
        return MapSupplier(supplier);
    }

    // ── Stock In ─────────────────────────────────────────────────────────────

    public async Task<StockInDto> AddStockAsync(CreateStockInDto dto)
    {
        if (!dto.Items.Any())
            throw new InvalidOperationException("Stock-in must contain at least one item.");

        var stockIn = new StockIn
        {
            SupplierId = dto.SupplierId,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var item in dto.Items)
        {
            if (item.Quantity <= 0)
                throw new InvalidOperationException("Quantity must be greater than zero.");

            var variant = await _context.ProductVariants
                .Include(v => v.Product)
                .FirstOrDefaultAsync(v => v.Id == item.ProductVariantId)
                ?? throw new InvalidOperationException($"Variant {item.ProductVariantId} not found.");

            stockIn.Items.Add(new StockInItem
            {
                ProductVariantId = item.ProductVariantId,
                Quantity = item.Quantity,
                PurchasePrice = item.PurchasePrice,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            variant.StockQuantity += item.Quantity;
            variant.UpdatedAt = DateTime.UtcNow;

            // Sync parent product stock
            var product = variant.Product;
            product.StockQuantity = await _context.ProductVariants
                .Where(v => v.ProductId == product.Id)
                .SumAsync(v => v.StockQuantity) + item.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
        }

        _context.StockIns.Add(stockIn);
        await _context.SaveChangesAsync();

        // Record movements after saving so we have the StockIn.Id
        foreach (var item in stockIn.Items)
        {
            _context.StockMovements.Add(new StockMovement
            {
                ProductVariantId = item.ProductVariantId,
                Quantity = item.Quantity,
                MovementType = StockMovementType.In,
                ReferenceType = "StockIn",
                ReferenceId = stockIn.Id,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        await _context.SaveChangesAsync();

        return await GetStockInDtoAsync(stockIn.Id);
    }

    public async Task<PagedResult<StockInDto>> GetStockInsAsync(int page = 1, int pageSize = 20)
    {
        var query = _context.StockIns.OrderByDescending(s => s.CreatedAt);
        var total = await query.CountAsync();
        var ids = await query.Skip((page - 1) * pageSize).Take(pageSize).Select(s => s.Id).ToListAsync();

        var items = new List<StockInDto>();
        foreach (var id in ids)
            items.Add(await GetStockInDtoAsync(id));

        return new PagedResult<StockInDto>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    // ── Adjustment ───────────────────────────────────────────────────────────

    public async Task<StockMovementDto> AdjustStockAsync(int variantId, StockAdjustmentDto dto)
    {
        var variant = await _context.ProductVariants
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == variantId)
            ?? throw new InvalidOperationException($"Variant {variantId} not found.");

        var newStock = variant.StockQuantity + dto.QuantityChange;
        if (newStock < 0)
            throw new InvalidOperationException(
                $"Adjustment would result in negative stock ({newStock}). Current stock: {variant.StockQuantity}.");

        variant.StockQuantity = newStock;
        variant.UpdatedAt = DateTime.UtcNow;

        // Sync parent product stock
        variant.Product.StockQuantity = await _context.ProductVariants
            .Where(v => v.ProductId == variant.ProductId)
            .SumAsync(v => v.StockQuantity) + dto.QuantityChange;
        variant.Product.UpdatedAt = DateTime.UtcNow;

        var movement = new StockMovement
        {
            ProductVariantId = variantId,
            Quantity = dto.QuantityChange,
            MovementType = StockMovementType.Adjustment,
            ReferenceType = "Adjustment",
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        return MapMovement(movement, variant);
    }

    // ── History ──────────────────────────────────────────────────────────────

    public async Task<PagedResult<StockMovementDto>> GetStockHistoryAsync(
        int? variantId = null, int? productId = null, int page = 1, int pageSize = 30)
    {
        var query = _context.StockMovements
            .Include(m => m.ProductVariant)
                .ThenInclude(v => v.Product)
            .AsQueryable();

        if (variantId.HasValue)
            query = query.Where(m => m.ProductVariantId == variantId.Value);
        else if (productId.HasValue)
            query = query.Where(m => m.ProductVariant.ProductId == productId.Value);

        query = query.OrderByDescending(m => m.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<StockMovementDto>
        {
            Items = items.Select(m => MapMovement(m, m.ProductVariant)).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    // ── Inventory snapshot ───────────────────────────────────────────────────

    public async Task<List<InventoryVariantDto>> GetInventoryAsync(int? productId = null)
    {
        var query = _context.ProductVariants
            .Include(v => v.Product)
            .AsQueryable();

        if (productId.HasValue)
            query = query.Where(v => v.ProductId == productId.Value);

        var variants = await query
            .OrderBy(v => v.Product.Name)
            .ThenBy(v => v.Size)
            .ToListAsync();

        return variants.Select(MapInventoryVariant).ToList();
    }

    // ── Dashboard ────────────────────────────────────────────────────────────

    public async Task<InventoryDashboardDto> GetInventoryDashboardAsync()
    {
        var variants = await _context.ProductVariants
            .Include(v => v.Product)
            .ToListAsync();

        var lowStock = variants.Where(v => v.StockQuantity > 0 && v.StockQuantity <= v.LowStockThreshold).ToList();
        var outOfStock = variants.Where(v => v.StockQuantity == 0).ToList();

        // Stock value: sum of latest purchase price × quantity per variant
        var latestPrices = await _context.StockInItems
            .GroupBy(i => i.ProductVariantId)
            .Select(g => new { VariantId = g.Key, LatestPrice = g.OrderByDescending(i => i.CreatedAt).First().PurchasePrice })
            .ToListAsync();

        var priceMap = latestPrices.ToDictionary(p => p.VariantId, p => p.LatestPrice);

        var totalValue = variants
            .Where(v => priceMap.ContainsKey(v.Id))
            .Sum(v => priceMap[v.Id] * v.StockQuantity);

        return new InventoryDashboardDto
        {
            TotalVariants = variants.Count,
            LowStockVariants = lowStock.Count,
            OutOfStockVariants = outOfStock.Count,
            TotalStockValue = totalValue,
            LowStockItems = lowStock.Concat(outOfStock).Select(MapInventoryVariant).ToList()
        };
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private async Task<StockInDto> GetStockInDtoAsync(int stockInId)
    {
        var stockIn = await _context.StockIns
            .Include(s => s.Supplier)
            .Include(s => s.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
            .FirstAsync(s => s.Id == stockInId);

        return new StockInDto
        {
            Id = stockIn.Id,
            SupplierId = stockIn.SupplierId,
            SupplierName = stockIn.Supplier?.Name,
            Notes = stockIn.Notes,
            CreatedAt = stockIn.CreatedAt,
            Items = stockIn.Items.Select(i => new StockInItemDto
            {
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductVariant.Product.Name,
                VariantLabel = VariantLabel(i.ProductVariant),
                Quantity = i.Quantity,
                PurchasePrice = i.PurchasePrice
            }).ToList()
        };
    }

    private static StockMovementDto MapMovement(StockMovement m, ProductVariant? variant)
    {
        return new StockMovementDto
        {
            Id = m.Id,
            ProductVariantId = m.ProductVariantId,
            ProductName = variant?.Product?.Name ?? string.Empty,
            VariantLabel = variant != null ? VariantLabel(variant) : string.Empty,
            Quantity = m.Quantity,
            MovementType = m.MovementType.ToString(),
            ReferenceType = m.ReferenceType,
            ReferenceId = m.ReferenceId,
            Notes = m.Notes,
            CreatedAt = m.CreatedAt
        };
    }

    private static InventoryVariantDto MapInventoryVariant(ProductVariant v)
    {
        return new InventoryVariantDto
        {
            VariantId = v.Id,
            ProductId = v.ProductId,
            ProductName = v.Product?.Name ?? string.Empty,
            Color = v.Color,
            JerseyType = v.JerseyType.ToString(),
            Size = v.Size,
            Sku = v.Sku,
            StockQuantity = v.StockQuantity,
            LowStockThreshold = v.LowStockThreshold,
            IsLowStock = v.StockQuantity <= v.LowStockThreshold
        };
    }

    private static SupplierDto MapSupplier(Supplier s)
    {
        return new SupplierDto
        {
            Id = s.Id,
            Name = s.Name,
            ContactPhone = s.ContactPhone,
            Email = s.Email,
            Address = s.Address,
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt
        };
    }

    private static string VariantLabel(ProductVariant v) =>
        $"{v.Color} / {v.JerseyType} / {v.Size}";
}
