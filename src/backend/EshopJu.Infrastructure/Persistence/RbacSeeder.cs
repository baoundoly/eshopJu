using EshopJu.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.Infrastructure.Persistence;

public static class RbacSeeder
{
    public static class Permissions
    {
        public const string CreateProduct   = "CREATE_PRODUCT";
        public const string EditProduct     = "EDIT_PRODUCT";
        public const string DeleteProduct   = "DELETE_PRODUCT";
        public const string ViewOrder       = "VIEW_ORDER";
        public const string ManageOrder     = "MANAGE_ORDER";
        public const string ManageCustomer  = "MANAGE_CUSTOMER";
        public const string ManageInventory = "MANAGE_INVENTORY";
        public const string ManageCoupons   = "MANAGE_COUPONS";
        public const string ViewReports     = "VIEW_REPORTS";
        public const string ManageShipping  = "MANAGE_SHIPPING";
        public const string ManageRoles     = "MANAGE_ROLES";
    }

    public static async Task SeedAsync(AppDbContext context)
    {
        var now = DateTime.UtcNow;

        var permDefs = new[]
        {
            (Permissions.CreateProduct,   "Create new products",         "Products"),
            (Permissions.EditProduct,     "Edit existing products",      "Products"),
            (Permissions.DeleteProduct,   "Delete products",             "Products"),
            (Permissions.ViewOrder,       "View orders",                 "Orders"),
            (Permissions.ManageOrder,     "Update order status/payment", "Orders"),
            (Permissions.ManageCustomer,  "Manage customer accounts",    "Customers"),
            (Permissions.ManageInventory, "Manage inventory and stock",  "Inventory"),
            (Permissions.ManageCoupons,   "Manage coupons and discounts","Coupons"),
            (Permissions.ViewReports,     "View reports and analytics",  "Reports"),
            (Permissions.ManageShipping,  "Manage shipping zones/rates", "Shipping"),
            (Permissions.ManageRoles,     "Manage roles and permissions","Admin"),
        };

        foreach (var (name, desc, group) in permDefs)
        {
            if (!await context.Permissions.AnyAsync(p => p.Name == name))
                context.Permissions.Add(new Permission { Name = name, Description = desc, Group = group, CreatedAt = now, UpdatedAt = now });
        }
        await context.SaveChangesAsync();

        if (!await context.Roles.AnyAsync(r => r.Name == "Admin"))
            context.Roles.Add(new Role { Name = "Admin", Description = "Full system access", IsActive = true, CreatedAt = now, UpdatedAt = now });
        if (!await context.Roles.AnyAsync(r => r.Name == "Customer"))
            context.Roles.Add(new Role { Name = "Customer", Description = "Standard customer access", IsActive = true, CreatedAt = now, UpdatedAt = now });
        if (!await context.Roles.AnyAsync(r => r.Name == "StoreManager"))
            context.Roles.Add(new Role { Name = "StoreManager", Description = "Manage products, orders, inventory", IsActive = true, CreatedAt = now, UpdatedAt = now });
        await context.SaveChangesAsync();

        var adminRole    = await context.Roles.Include(r => r.RolePermissions).FirstAsync(r => r.Name == "Admin");
        var managerRole  = await context.Roles.Include(r => r.RolePermissions).FirstAsync(r => r.Name == "StoreManager");
        var customerRole = await context.Roles.Include(r => r.RolePermissions).FirstAsync(r => r.Name == "Customer");
        var allPerms     = await context.Permissions.ToListAsync();

        foreach (var perm in allPerms)
        {
            if (!adminRole.RolePermissions.Any(rp => rp.PermissionId == perm.Id))
                context.RolePermissions.Add(new RolePermission { RoleId = adminRole.Id, PermissionId = perm.Id, CreatedAt = now, UpdatedAt = now });
        }

        var managerPerms = new[] { Permissions.CreateProduct, Permissions.EditProduct, Permissions.ViewOrder, Permissions.ManageOrder, Permissions.ManageInventory, Permissions.ViewReports };
        foreach (var name in managerPerms)
        {
            var perm = allPerms.FirstOrDefault(p => p.Name == name);
            if (perm != null && !managerRole.RolePermissions.Any(rp => rp.PermissionId == perm.Id))
                context.RolePermissions.Add(new RolePermission { RoleId = managerRole.Id, PermissionId = perm.Id, CreatedAt = now, UpdatedAt = now });
        }

        var viewOrderPerm = allPerms.FirstOrDefault(p => p.Name == Permissions.ViewOrder);
        if (viewOrderPerm != null && !customerRole.RolePermissions.Any(rp => rp.PermissionId == viewOrderPerm.Id))
            context.RolePermissions.Add(new RolePermission { RoleId = customerRole.Id, PermissionId = viewOrderPerm.Id, CreatedAt = now, UpdatedAt = now });

        await context.SaveChangesAsync();
    }
}
