using EshopJu.Application.DTOs;

namespace EshopJu.Application.Interfaces;

public interface IAuthService
{
    Task<AuthDto?> LoginAsync(LoginDto dto);
    Task<AuthDto> RegisterAsync(RegisterDto dto);
}
