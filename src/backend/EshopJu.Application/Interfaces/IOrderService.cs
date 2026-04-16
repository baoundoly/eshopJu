using EshopJu.Application.DTOs;

namespace EshopJu.Application.Interfaces;

public interface IOrderService
{
    Task<PagedResult<OrderDto>> GetOrdersAsync(int page = 1, int pageSize = 20, string? status = null);
    Task<OrderDto?> GetOrderByIdAsync(int id);
    Task<OrderDto?> GetOrderByNumberAsync(string orderNumber);
    Task<OrderDto> CreateOrderAsync(CreateOrderDto dto, int? userId = null);
    Task<OrderDto?> UpdateOrderStatusAsync(int id, UpdateOrderStatusDto dto);
    Task<OrderDto?> VerifyPaymentAsync(int id, VerifyPaymentDto dto);
    Task<string> GenerateWhatsAppLinkAsync(WhatsAppOrderMessageDto dto);
    Task<DashboardStatsDto> GetDashboardStatsAsync();
}
