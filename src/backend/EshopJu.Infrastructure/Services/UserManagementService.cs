using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using EshopJu.Core.Entities;
using EshopJu.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.Infrastructure.Services;

public class UserManagementService : IUserManagementService
{
    private readonly AppDbContext _context;

    public UserManagementService(AppDbContext context) => _context = context;

    public async Task<List<UserDto>> GetUsersAsync()
    {
        var users = await _context.Users
            .Include(u => u.RoleAssignments).ThenInclude(a => a.Role).ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();
        return users.Select(MapToDto).ToList();
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await _context.Users
            .Include(u => u.RoleAssignments).ThenInclude(a => a.Role).ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == id);
        return user == null ? null : MapToDto(user);
    }

    public async Task<UserDto?> UpdateUserAsync(int id, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return null;
        user.Name = dto.Name;
        user.Phone = dto.Phone;
        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return await GetUserByIdAsync(id);
    }

    public async Task<UserDto?> AssignRolesAsync(int userId, AssignRolesDto dto)
    {
        var user = await _context.Users
            .Include(u => u.RoleAssignments)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return null;

        _context.UserRoleAssignments.RemoveRange(user.RoleAssignments);
        foreach (var roleId in dto.RoleIds.Distinct())
            _context.UserRoleAssignments.Add(new UserRoleAssignment { UserId = userId, RoleId = roleId, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();
        return await GetUserByIdAsync(userId);
    }

    public async Task<List<string>> GetUserPermissionsAsync(int userId)
    {
        return await _context.UserRoleAssignments
            .Where(a => a.UserId == userId)
            .SelectMany(a => a.Role.RolePermissions.Select(rp => rp.Permission.Name))
            .Distinct()
            .ToListAsync();
    }

    private static UserDto MapToDto(User user)
    {
        var assignedRoles = user.RoleAssignments.Select(a => new RoleDto
        {
            Id = a.Role.Id,
            Name = a.Role.Name,
            Description = a.Role.Description,
            IsActive = a.Role.IsActive,
            Permissions = a.Role.RolePermissions
                .Where(rp => rp.Permission != null)
                .Select(rp => new PermissionDto { Id = rp.Permission.Id, Name = rp.Permission.Name, Description = rp.Permission.Description, Group = rp.Permission.Group })
                .ToList()
        }).ToList();

        var permissions = user.RoleAssignments
            .SelectMany(a => a.Role.RolePermissions.Select(rp => rp.Permission?.Name))
            .Where(n => n != null)
            .Distinct()
            .Select(n => n!)
            .ToList();

        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            AssignedRoles = assignedRoles,
            Permissions = permissions,
            CreatedAt = user.CreatedAt
        };
    }
}
