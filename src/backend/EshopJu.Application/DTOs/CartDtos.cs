namespace EshopJu.Application.DTOs;

public class CartDto
{
    public int Id { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
}

public class CartItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImage { get; set; }
    public int? VariantId { get; set; }
    public string Size { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? JerseyType { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public class AddToCartDto
{
    public int ProductId { get; set; }
    public int? VariantId { get; set; }
    public string Size { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? JerseyType { get; set; }
    public int Quantity { get; set; } = 1;
}

public class UpdateCartItemDto
{
    public int Quantity { get; set; }
}
