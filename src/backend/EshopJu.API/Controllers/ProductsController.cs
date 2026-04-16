using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ProductDto>), 200)]
    public async Task<IActionResult> GetProducts([FromQuery] ProductFilterDto filter)
    {
        var result = await _productService.GetProductsAsync(filter);
        return Ok(result);
    }

    [HttpGet("featured")]
    [ProducesResponseType(typeof(List<ProductDto>), 200)]
    public async Task<IActionResult> GetFeaturedProducts([FromQuery] int count = 8)
    {
        var products = await _productService.GetFeaturedProductsAsync(count);
        return Ok(products);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ProductDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetProductById(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        if (product == null)
            return NotFound(new { message = $"Product {id} not found." });

        return Ok(product);
    }

    [HttpGet("slug/{slug}")]
    [ProducesResponseType(typeof(ProductDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetProductBySlug(string slug)
    {
        var product = await _productService.GetProductBySlugAsync(slug);
        if (product == null)
            return NotFound(new { message = $"Product with slug '{slug}' not found." });

        return Ok(product);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ProductDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
    {
        var product = await _productService.CreateProductAsync(dto);
        return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, product);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ProductDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
    {
        var product = await _productService.UpdateProductAsync(id, dto);
        if (product == null)
            return NotFound(new { message = $"Product {id} not found." });

        return Ok(product);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var deleted = await _productService.DeleteProductAsync(id);
        if (!deleted)
            return NotFound(new { message = $"Product {id} not found." });

        return NoContent();
    }
}
