using EshopJu.Application.DTOs;

namespace EshopJu.Application.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCartAsync(int? userId, string? sessionId);
    Task<CartDto> AddToCartAsync(int? userId, string? sessionId, AddToCartDto dto);
    Task<CartDto> UpdateCartItemAsync(int? userId, string? sessionId, int cartItemId, UpdateCartItemDto dto);
    Task<CartDto> RemoveFromCartAsync(int? userId, string? sessionId, int cartItemId);
    Task ClearCartAsync(int? userId, string? sessionId);
}
