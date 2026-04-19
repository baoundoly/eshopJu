using EshopJu.Application.DTOs;

namespace EshopJu.Application.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetProductsAsync(ProductFilterDto filter);
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto?> GetProductBySlugAsync(string slug);
    Task<List<ProductDto>> GetFeaturedProductsAsync(int count = 8);
    Task<ProductDto> CreateProductAsync(CreateProductDto dto);
    Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto dto);
    Task<bool> DeleteProductAsync(int id);

    // Variant management
    Task<List<ProductVariantDto>> GetVariantsAsync(int productId);
    Task<ProductVariantDto> AddVariantAsync(int productId, CreateProductVariantDto dto);
    Task<ProductVariantDto?> UpdateVariantAsync(int productId, int variantId, CreateProductVariantDto dto);
    Task<bool> DeleteVariantAsync(int productId, int variantId);
}
