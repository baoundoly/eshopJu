using EshopJu.Application.DTOs;

namespace EshopJu.Application.Interfaces;

public interface IReportService
{
    Task<ExtendedDashboardDto> GetExtendedDashboardAsync();
    Task<SalesReportDto> GetSalesReportAsync(ReportFilterDto filter);
    Task<ProfitReportDto> GetProfitReportAsync(ReportFilterDto filter);
    Task<InventoryReportDto> GetInventoryReportAsync();
    Task<StockMovementReportDto> GetStockMovementReportAsync(ReportFilterDto filter);
    Task<DiscountReportDto> GetDiscountReportAsync(ReportFilterDto filter);
    Task<ShippingReportDto> GetShippingReportAsync(ReportFilterDto filter);
    Task<TopProductsReportDto> GetTopProductsReportAsync(ReportFilterDto filter, int top = 10);
    Task<CustomerReportDto> GetCustomerReportAsync(ReportFilterDto filter);
}
