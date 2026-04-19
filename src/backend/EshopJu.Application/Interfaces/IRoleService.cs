using EshopJu.Application.DTOs;

namespace EshopJu.Application.Interfaces;

public interface IRoleService
{
    Task<List<RoleDto>> GetRolesAsync();
    Task<RoleDto?> GetRoleByIdAsync(int id);
    Task<RoleDto> CreateRoleAsync(CreateRoleDto dto);
    Task<RoleDto?> UpdateRoleAsync(int id, UpdateRoleDto dto);
    Task<bool> DeleteRoleAsync(int id);
    Task<List<PermissionDto>> GetPermissionsAsync();
}
