using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<CategoryDto>), 200)]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _categoryService.GetCategoriesAsync();
        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(CategoryDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetCategoryById(int id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);
        if (category == null)
            return NotFound(new { message = $"Category {id} not found." });

        return Ok(category);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(CategoryDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        var category = await _categoryService.CreateCategoryAsync(dto);
        return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, category);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(CategoryDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto dto)
    {
        var category = await _categoryService.UpdateCategoryAsync(id, dto);
        if (category == null)
            return NotFound(new { message = $"Category {id} not found." });

        return Ok(category);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var deleted = await _categoryService.DeleteCategoryAsync(id);
        if (!deleted)
            return NotFound(new { message = $"Category {id} not found." });

        return NoContent();
    }
}
