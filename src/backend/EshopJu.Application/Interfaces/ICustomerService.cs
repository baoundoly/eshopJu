using EshopJu.Application.DTOs;

namespace EshopJu.Application.Interfaces;

public interface ICustomerService
{
    Task<PagedResult<CustomerDto>> GetCustomersAsync(int page = 1, int pageSize = 20, string? search = null);
    Task<CustomerPurchaseHistoryDto?> GetCustomerHistoryAsync(int customerId);
    Task<CustomerDto?> GetCustomerByPhoneAsync(string phone);
    Task<CustomerPurchaseHistoryDto?> GetPurchaseHistoryForUserAsync(int userId);
}
