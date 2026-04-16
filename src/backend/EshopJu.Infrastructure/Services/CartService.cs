using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using EshopJu.Core.Entities;
using EshopJu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.Infrastructure.Services;

public class CartService : ICartService
{
    private readonly AppDbContext _context;

    public CartService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CartDto> GetCartAsync(int? userId, string? sessionId)
    {
        var cart = await FindOrCreateCartAsync(userId, sessionId);
        return MapToDto(cart);
    }

    public async Task<CartDto> AddToCartAsync(int? userId, string? sessionId, AddToCartDto dto)
    {
        var cart = await FindOrCreateCartAsync(userId, sessionId);

        var product = await _context.Products.FindAsync(dto.ProductId)
            ?? throw new InvalidOperationException($"Product {dto.ProductId} not found.");

        var existingItem = cart.Items.FirstOrDefault(i =>
            i.ProductId == dto.ProductId && i.Size == dto.Size);

        if (existingItem != null)
        {
            existingItem.Quantity += dto.Quantity;
            existingItem.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            var unitPrice = product.DiscountPrice ?? product.Price;
            cart.Items.Add(new CartItem
            {
                CartId = cart.Id,
                ProductId = dto.ProductId,
                Size = dto.Size,
                Quantity = dto.Quantity,
                UnitPrice = unitPrice,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        await ReloadCartItemsAsync(cart);
        return MapToDto(cart);
    }

    public async Task<CartDto> UpdateCartItemAsync(int? userId, string? sessionId, int cartItemId, UpdateCartItemDto dto)
    {
        var cart = await FindOrCreateCartAsync(userId, sessionId);

        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);
        if (item == null)
            return MapToDto(cart);

        if (dto.Quantity <= 0)
        {
            _context.CartItems.Remove(item);
        }
        else
        {
            item.Quantity = dto.Quantity;
            item.UpdatedAt = DateTime.UtcNow;
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        await ReloadCartItemsAsync(cart);
        return MapToDto(cart);
    }

    public async Task<CartDto> RemoveFromCartAsync(int? userId, string? sessionId, int cartItemId)
    {
        var cart = await FindOrCreateCartAsync(userId, sessionId);

        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);
        if (item != null)
        {
            _context.CartItems.Remove(item);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        await ReloadCartItemsAsync(cart);
        return MapToDto(cart);
    }

    public async Task ClearCartAsync(int? userId, string? sessionId)
    {
        var cart = await FindOrCreateCartAsync(userId, sessionId);

        _context.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private async Task<Cart> FindOrCreateCartAsync(int? userId, string? sessionId)
    {
        Cart? cart = null;

        if (userId.HasValue)
        {
            cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(c => c.UserId == userId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(sessionId))
        {
            cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(c => c.SessionId == sessionId);
        }

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = userId,
                SessionId = sessionId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }

    private async Task ReloadCartItemsAsync(Cart cart)
    {
        await _context.Entry(cart)
            .Collection(c => c.Items)
            .Query()
            .Include(i => i.Product)
                .ThenInclude(p => p.Images)
            .LoadAsync();
    }

    private static CartDto MapToDto(Cart cart)
    {
        var items = cart.Items.Select(i => new CartItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.Product?.Name ?? string.Empty,
            ProductImage = i.Product?.Images
                .FirstOrDefault(img => img.IsPrimary)?.ImageUrl
                ?? i.Product?.Images.OrderBy(img => img.SortOrder).FirstOrDefault()?.ImageUrl,
            Size = i.Size,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice,
            TotalPrice = i.UnitPrice * i.Quantity
        }).ToList();

        return new CartDto
        {
            Id = cart.Id,
            Items = items,
            TotalAmount = items.Sum(i => i.TotalPrice),
            ItemCount = items.Sum(i => i.Quantity)
        };
    }
}
