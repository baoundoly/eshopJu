using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthDto), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        if (result == null)
            return Unauthorized(new { message = "Invalid email or password." });

        return Ok(result);
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthDto), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        return Ok(result);
    }
}
