using EshopJu.Application.DTOs;

namespace EshopJu.Application.Interfaces;

public interface IInventoryService
{
    // Supplier
    Task<List<SupplierDto>> GetSuppliersAsync();
    Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto dto);

    // Stock In (procurement)
    Task<StockInDto> AddStockAsync(CreateStockInDto dto);
    Task<PagedResult<StockInDto>> GetStockInsAsync(int page = 1, int pageSize = 20);

    // Adjustment
    Task<StockMovementDto> AdjustStockAsync(int variantId, StockAdjustmentDto dto);

    // Movement history / ledger
    Task<PagedResult<StockMovementDto>> GetStockHistoryAsync(
        int? variantId = null, int? productId = null, int page = 1, int pageSize = 30);

    // Current inventory snapshot
    Task<List<InventoryVariantDto>> GetInventoryAsync(int? productId = null);

    // Dashboard
    Task<InventoryDashboardDto> GetInventoryDashboardAsync();
}
