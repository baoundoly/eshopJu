using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using EshopJu.Core.Entities;
using EshopJu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync()
    {
        var categories = await _context.Categories
            .Include(c => c.Products)
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return categories.Select(MapToDto).ToList();
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);

        return category == null ? null : MapToDto(category);
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
    {
        var slug = GenerateSlug(dto.Name);

        if (await _context.Categories.AnyAsync(c => c.Slug == slug))
            slug = $"{slug}-{DateTime.UtcNow.Ticks}";

        var category = new Category
        {
            Name = dto.Name,
            Slug = slug,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return MapToDto(category);
    }

    public async Task<CategoryDto?> UpdateCategoryAsync(int id, UpdateCategoryDto dto)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null) return null;

        category.Name = dto.Name;
        category.Description = dto.Description;
        category.ImageUrl = dto.ImageUrl;
        category.IsActive = dto.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(category);
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return false;

        category.IsActive = false;
        category.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    private static CategoryDto MapToDto(Category category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            IsActive = category.IsActive,
            ProductCount = category.Products.Count(p => p.IsActive)
        };
    }

    private static string GenerateSlug(string name)
    {
        return name.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("'", "")
            .Replace("\"", "")
            .Replace(".", "")
            .Replace(",", "")
            .Replace("/", "-")
            .Replace("\\", "-")
            .Replace("(", "")
            .Replace(")", "");
    }
}
