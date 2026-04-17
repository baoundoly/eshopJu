using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using EshopJu.Core.Entities;
using EshopJu.Core.Enums;
using EshopJu.Infrastructure.Helpers;
using EshopJu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterDto filter)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Reviews)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
            query = query.Where(p =>
                p.Name.Contains(filter.Search) ||
                (p.Team != null && p.Team.Contains(filter.Search)));

        if (filter.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == filter.CategoryId.Value);

        if (!string.IsNullOrWhiteSpace(filter.Team))
            query = query.Where(p => p.Team != null && p.Team.Contains(filter.Team));

        if (!string.IsNullOrWhiteSpace(filter.Color))
            query = query.Where(p =>
                (p.Color != null && p.Color.Contains(filter.Color)) ||
                p.Variants.Any(v => v.Color.Contains(filter.Color)));

        if (!string.IsNullOrWhiteSpace(filter.JerseyType) &&
            Enum.TryParse<JerseyType>(filter.JerseyType, ignoreCase: true, out var jerseyTypeEnum))
        {
            query = query.Where(p =>
                p.JerseyType == jerseyTypeEnum ||
                p.Variants.Any(v => v.JerseyType == jerseyTypeEnum));
        }

        if (filter.MinPrice.HasValue)
            query = query.Where(p => p.Price >= filter.MinPrice.Value);

        if (filter.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= filter.MaxPrice.Value);

        if (!string.IsNullOrWhiteSpace(filter.Size))
            query = query.Where(p => p.Variants.Any(v => v.Size == filter.Size));

        if (filter.IsFeatured.HasValue)
            query = query.Where(p => p.IsFeatured == filter.IsFeatured.Value);

        query = filter.SortBy switch
        {
            "price_asc"  => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            "popular"    => query.OrderByDescending(p => p.OrderItems.Count),
            _            => query.OrderByDescending(p => p.CreatedAt) // newest
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new PagedResult<ProductDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

        return product == null ? null : MapToDto(product);
    }

    public async Task<ProductDto?> GetProductBySlugAsync(string slug)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive);

        return product == null ? null : MapToDto(product);
    }

    public async Task<List<ProductDto>> GetFeaturedProductsAsync(int count = 8)
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .Include(p => p.Reviews)
            .Where(p => p.IsActive && p.IsFeatured)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .ToListAsync();

        return products.Select(MapToDto).ToList();
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        var slug = GenerateSlug(dto.Name);

        if (await _context.Products.AnyAsync(p => p.Slug == slug))
            slug = $"{slug}-{DateTime.UtcNow.Ticks}";

        if (!Enum.TryParse<JerseyType>(dto.JerseyType, ignoreCase: true, out var jerseyType))
            jerseyType = JerseyType.NotApplicable;

        var product = new Product
        {
            Name = dto.Name,
            Slug = slug,
            Team = dto.Team,
            Description = dto.Description,
            Price = dto.Price,
            DiscountPrice = dto.DiscountPrice,
            Color = dto.Color,
            JerseyType = jerseyType,
            StockQuantity = dto.Variants.Sum(v => v.StockQuantity),
            IsFeatured = dto.IsFeatured,
            CategoryId = dto.CategoryId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var sortOrder = 0;
        foreach (var imageUrl in dto.Images)
        {
            product.Images.Add(new ProductImage
            {
                ImageUrl = imageUrl,
                IsPrimary = sortOrder == 0,
                SortOrder = sortOrder++,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        foreach (var variantDto in dto.Variants)
        {
            if (!Enum.TryParse<JerseyType>(variantDto.JerseyType, ignoreCase: true, out var vJerseyType))
                vJerseyType = JerseyType.NotApplicable;

            product.Variants.Add(new ProductVariant
            {
                Color = variantDto.Color,
                JerseyType = vJerseyType,
                Size = variantDto.Size,
                StockQuantity = variantDto.StockQuantity,
                Sku = variantDto.Sku,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        await _context.Entry(product).Reference(p => p.Category).LoadAsync();

        return MapToDto(product);
    }

    public async Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto dto)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return null;

        if (!Enum.TryParse<JerseyType>(dto.JerseyType, ignoreCase: true, out var jerseyType))
            jerseyType = JerseyType.NotApplicable;

        product.Name = dto.Name;
        product.Team = dto.Team;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.DiscountPrice = dto.DiscountPrice;
        product.Color = dto.Color;
        product.JerseyType = jerseyType;
        product.IsFeatured = dto.IsFeatured;
        product.CategoryId = dto.CategoryId;
        product.IsActive = dto.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        _context.ProductImages.RemoveRange(product.Images);
        product.Images.Clear();

        var sortOrder = 0;
        foreach (var imageUrl in dto.Images)
        {
            product.Images.Add(new ProductImage
            {
                ImageUrl = imageUrl,
                IsPrimary = sortOrder == 0,
                SortOrder = sortOrder++,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        _context.ProductVariants.RemoveRange(product.Variants);
        product.Variants.Clear();

        foreach (var variantDto in dto.Variants)
        {
            if (!Enum.TryParse<JerseyType>(variantDto.JerseyType, ignoreCase: true, out var vJerseyType))
                vJerseyType = JerseyType.NotApplicable;

            product.Variants.Add(new ProductVariant
            {
                Color = variantDto.Color,
                JerseyType = vJerseyType,
                Size = variantDto.Size,
                StockQuantity = variantDto.StockQuantity,
                Sku = variantDto.Sku,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        product.StockQuantity = product.Variants.Sum(v => v.StockQuantity);

        await _context.SaveChangesAsync();

        await _context.Entry(product).Reference(p => p.Category).LoadAsync();

        return MapToDto(product);
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return false;

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<ProductVariantDto>> GetVariantsAsync(int productId)
    {
        var variants = await _context.ProductVariants
            .Where(v => v.ProductId == productId)
            .OrderBy(v => v.Color)
            .ThenBy(v => v.JerseyType)
            .ThenBy(v => v.Size)
            .ToListAsync();

        return variants.Select(MapVariantToDto).ToList();
    }

    public async Task<ProductVariantDto> AddVariantAsync(int productId, CreateProductVariantDto dto)
    {
        if (!Enum.TryParse<JerseyType>(dto.JerseyType, ignoreCase: true, out var jerseyType))
            jerseyType = JerseyType.NotApplicable;

        var variant = new ProductVariant
        {
            ProductId = productId,
            Color = dto.Color,
            JerseyType = jerseyType,
            Size = dto.Size,
            StockQuantity = dto.StockQuantity,
            Sku = dto.Sku,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ProductVariants.Add(variant);
        await SyncProductStockAsync(productId);
        await _context.SaveChangesAsync();

        return MapVariantToDto(variant);
    }

    public async Task<ProductVariantDto?> UpdateVariantAsync(int productId, int variantId, CreateProductVariantDto dto)
    {
        var variant = await _context.ProductVariants
            .FirstOrDefaultAsync(v => v.Id == variantId && v.ProductId == productId);

        if (variant == null) return null;

        if (!Enum.TryParse<JerseyType>(dto.JerseyType, ignoreCase: true, out var jerseyType))
            jerseyType = JerseyType.NotApplicable;

        variant.Color = dto.Color;
        variant.JerseyType = jerseyType;
        variant.Size = dto.Size;
        variant.StockQuantity = dto.StockQuantity;
        variant.Sku = dto.Sku;
        variant.UpdatedAt = DateTime.UtcNow;

        await SyncProductStockAsync(productId);
        await _context.SaveChangesAsync();

        return MapVariantToDto(variant);
    }

    public async Task<bool> DeleteVariantAsync(int productId, int variantId)
    {
        var variant = await _context.ProductVariants
            .FirstOrDefaultAsync(v => v.Id == variantId && v.ProductId == productId);

        if (variant == null) return false;

        _context.ProductVariants.Remove(variant);
        await SyncProductStockAsync(productId);
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task SyncProductStockAsync(int productId)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null) return;

        var totalStock = await _context.ProductVariants
            .Where(v => v.ProductId == productId)
            .SumAsync(v => v.StockQuantity);

        product.StockQuantity = totalStock;
        product.UpdatedAt = DateTime.UtcNow;
    }

    private static ProductDto MapToDto(Product product)
    {
        var images = product.Images
            .OrderBy(i => i.SortOrder)
            .Select(i => i.ImageUrl)
            .ToList();

        var primaryImage = product.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl
                           ?? product.Images.OrderBy(i => i.SortOrder).FirstOrDefault()?.ImageUrl;

        var approvedReviews = product.Reviews.Where(r => r.IsApproved).ToList();
        var avgRating = approvedReviews.Count > 0
            ? approvedReviews.Average(r => r.Rating)
            : 0.0;

        var variants = product.Variants.Select(MapVariantToDto).ToList();
        var totalStock = variants.Count > 0
            ? variants.Sum(v => v.StockQuantity)
            : product.StockQuantity;

        var distinctColors = variants
            .Select(v => v.Color)
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Distinct()
            .ToList();

        var distinctTypes = variants
            .Select(v => v.JerseyType)
            .Where(t => !string.IsNullOrWhiteSpace(t) && t != "NotApplicable")
            .Distinct()
            .ToList();

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Slug = product.Slug,
            Team = product.Team,
            Description = product.Description,
            Price = product.Price,
            DiscountPrice = product.DiscountPrice,
            TotalStock = totalStock,
            Color = product.Color,
            JerseyType = product.JerseyType.ToString(),
            IsActive = product.IsActive,
            IsFeatured = product.IsFeatured,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty,
            Images = images,
            PrimaryImage = primaryImage,
            Variants = variants,
            Colors = distinctColors,
            Types = distinctTypes,
            AverageRating = avgRating,
            ReviewCount = approvedReviews.Count,
            CreatedAt = product.CreatedAt
        };
    }

    private static ProductVariantDto MapVariantToDto(ProductVariant v) => new()
    {
        Id = v.Id,
        Color = v.Color,
        JerseyType = v.JerseyType.ToString(),
        Size = v.Size,
        StockQuantity = v.StockQuantity,
        Sku = v.Sku
    };

    private static string GenerateSlug(string name) => SlugHelper.GenerateSlug(name);
}
