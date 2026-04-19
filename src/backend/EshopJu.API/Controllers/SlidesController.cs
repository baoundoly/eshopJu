using EshopJu.Core.Entities;
using EshopJu.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.API.Controllers;

public class SlideDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string? LinkLabel { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSlideDto
{
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string? LinkLabel { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}

public class UpdateSlideDto
{
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string? LinkLabel { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

[ApiController]
[Route("api/slides")]
public class SlidesController : ControllerBase
{
    private readonly AppDbContext _context;

    public SlidesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>Returns all active slides ordered by SortOrder (public endpoint for home page).</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetActiveSlides()
    {
        var slides = await _context.Slides
            .Where(s => s.IsActive)
            .OrderBy(s => s.SortOrder)
            .ThenBy(s => s.Id)
            .Select(s => Map(s))
            .ToListAsync();

        return Ok(slides);
    }

    /// <summary>Returns all slides (active + inactive) for admin management.</summary>
    [HttpGet("all")]
    [Authorize(Policy = "ManageProducts")]
    public async Task<IActionResult> GetAllSlides()
    {
        var slides = await _context.Slides
            .OrderBy(s => s.SortOrder)
            .ThenBy(s => s.Id)
            .Select(s => Map(s))
            .ToListAsync();

        return Ok(slides);
    }

    /// <summary>Creates a new slide.</summary>
    [HttpPost]
    [Authorize(Policy = "ManageProducts")]
    public async Task<IActionResult> CreateSlide([FromBody] CreateSlideDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.ImageUrl))
            return BadRequest(new { message = "Title and ImageUrl are required." });

        var slide = new Slide
        {
            Title = dto.Title,
            Subtitle = dto.Subtitle,
            ImageUrl = dto.ImageUrl,
            LinkUrl = dto.LinkUrl,
            LinkLabel = dto.LinkLabel,
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
        };

        _context.Slides.Add(slide);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSlide), new { id = slide.Id }, Map(slide));
    }

    /// <summary>Returns a single slide by ID.</summary>
    [HttpGet("{id:int}")]
    [Authorize(Policy = "ManageProducts")]
    public async Task<IActionResult> GetSlide(int id)
    {
        var slide = await _context.Slides.FindAsync(id);
        if (slide == null) return NotFound();
        return Ok(Map(slide));
    }

    /// <summary>Updates an existing slide.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Policy = "ManageProducts")]
    public async Task<IActionResult> UpdateSlide(int id, [FromBody] UpdateSlideDto dto)
    {
        var slide = await _context.Slides.FindAsync(id);
        if (slide == null) return NotFound();

        slide.Title = dto.Title;
        slide.Subtitle = dto.Subtitle;
        slide.ImageUrl = dto.ImageUrl;
        slide.LinkUrl = dto.LinkUrl;
        slide.LinkLabel = dto.LinkLabel;
        slide.SortOrder = dto.SortOrder;
        slide.IsActive = dto.IsActive;
        slide.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(Map(slide));
    }

    /// <summary>Deletes a slide.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "ManageProducts")]
    public async Task<IActionResult> DeleteSlide(int id)
    {
        var slide = await _context.Slides.FindAsync(id);
        if (slide == null) return NotFound();

        _context.Slides.Remove(slide);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static SlideDto Map(Slide s) => new()
    {
        Id = s.Id,
        Title = s.Title,
        Subtitle = s.Subtitle,
        ImageUrl = s.ImageUrl,
        LinkUrl = s.LinkUrl,
        LinkLabel = s.LinkLabel,
        SortOrder = s.SortOrder,
        IsActive = s.IsActive,
        CreatedAt = s.CreatedAt,
    };
}
