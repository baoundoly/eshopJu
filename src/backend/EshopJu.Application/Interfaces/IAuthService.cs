using EshopJu.Application.DTOs;

namespace EshopJu.Application.Interfaces;

public interface IAuthService
{
    Task<AuthDto?> LoginAsync(LoginDto dto);
    Task<AuthDto> RegisterAsync(RegisterDto dto);
    Task<UserProfileDto?> GetProfileAsync(int userId);
    Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto);
}
