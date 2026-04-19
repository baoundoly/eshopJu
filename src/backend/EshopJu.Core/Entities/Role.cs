namespace EshopJu.Core.Entities;

public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<UserRoleAssignment> UserAssignments { get; set; } = new List<UserRoleAssignment>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
