namespace EshopJu.Application.DTOs;

public class ProductVariantDto
{
    public int Id { get; set; }
    public string Color { get; set; } = string.Empty;
    public string JerseyType { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public string? Sku { get; set; }
}

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Team { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int TotalStock { get; set; }
    public string? Color { get; set; }
    public string JerseyType { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
    public string? PrimaryImage { get; set; }
    public List<ProductVariantDto> Variants { get; set; } = new();
    public List<string> Colors { get; set; } = new();
    public List<string> Types { get; set; } = new();
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateProductVariantDto
{
    public string Color { get; set; } = string.Empty;
    public string JerseyType { get; set; } = "NotApplicable";
    public string Size { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public string? Sku { get; set; }
}

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Team { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public string? Color { get; set; }
    public string JerseyType { get; set; } = "NotApplicable";
    public bool IsFeatured { get; set; }
    public int CategoryId { get; set; }
    public List<string> Images { get; set; } = new();
    public List<CreateProductVariantDto> Variants { get; set; } = new();
}

public class UpdateProductDto : CreateProductDto
{
    public bool IsActive { get; set; } = true;
}

public class ProductFilterDto
{
    public string? Search { get; set; }
    public int? CategoryId { get; set; }
    public string? Team { get; set; }
    public string? Color { get; set; }
    public string? JerseyType { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? Size { get; set; }
    public bool? IsFeatured { get; set; }
    public string? SortBy { get; set; } // price_asc, price_desc, newest, popular
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
