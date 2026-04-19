using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using EshopJu.Core.Entities;
using EshopJu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.Infrastructure.Services;

public class RoleService : IRoleService
{
    private readonly AppDbContext _context;

    public RoleService(AppDbContext context) => _context = context;

    public async Task<List<RoleDto>> GetRolesAsync()
    {
        var roles = await _context.Roles
            .Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .OrderBy(r => r.Name)
            .ToListAsync();
        return roles.Select(MapToDto).ToList();
    }

    public async Task<RoleDto?> GetRoleByIdAsync(int id)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == id);
        return role == null ? null : MapToDto(role);
    }

    public async Task<RoleDto> CreateRoleAsync(CreateRoleDto dto)
    {
        var role = new Role
        {
            Name = dto.Name,
            Description = dto.Description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        foreach (var permId in dto.PermissionIds.Distinct())
            _context.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = permId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        return (await GetRoleByIdAsync(role.Id))!;
    }

    public async Task<RoleDto?> UpdateRoleAsync(int id, UpdateRoleDto dto)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (role == null) return null;

        role.Name = dto.Name;
        role.Description = dto.Description;
        role.IsActive = dto.IsActive;
        role.UpdatedAt = DateTime.UtcNow;

        _context.RolePermissions.RemoveRange(role.RolePermissions);
        foreach (var permId in dto.PermissionIds.Distinct())
            _context.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = permId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        return (await GetRoleByIdAsync(id))!;
    }

    public async Task<bool> DeleteRoleAsync(int id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null) return false;
        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<PermissionDto>> GetPermissionsAsync()
    {
        return await _context.Permissions
            .OrderBy(p => p.Group).ThenBy(p => p.Name)
            .Select(p => new PermissionDto { Id = p.Id, Name = p.Name, Description = p.Description, Group = p.Group })
            .ToListAsync();
    }

    private static RoleDto MapToDto(Role role) => new()
    {
        Id = role.Id,
        Name = role.Name,
        Description = role.Description,
        IsActive = role.IsActive,
        Permissions = role.RolePermissions
            .Where(rp => rp.Permission != null)
            .Select(rp => new PermissionDto { Id = rp.Permission.Id, Name = rp.Permission.Name, Description = rp.Permission.Description, Group = rp.Permission.Group })
            .ToList()
    };
}
