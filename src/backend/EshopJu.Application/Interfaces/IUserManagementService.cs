using EshopJu.Application.DTOs;

namespace EshopJu.Application.Interfaces;

public interface IUserManagementService
{
    Task<List<UserDto>> GetUsersAsync();
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<UserDto?> UpdateUserAsync(int id, UpdateUserDto dto);
    Task<UserDto?> AssignRolesAsync(int userId, AssignRolesDto dto);
    Task<List<string>> GetUserPermissionsAsync(int userId);
}
