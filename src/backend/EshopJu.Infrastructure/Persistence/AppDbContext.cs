using EshopJu.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductSize> ProductSizes => Set<ProductSize>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(p => p.Price).HasColumnType("decimal(18,2)");
            entity.Property(p => p.DiscountPrice).HasColumnType("decimal(18,2)");
            entity.HasIndex(p => p.Slug).IsUnique();
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(o => o.SubTotal).HasColumnType("decimal(18,2)");
            entity.Property(o => o.DeliveryCharge).HasColumnType("decimal(18,2)");
            entity.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
            entity.HasIndex(o => o.OrderNumber).IsUnique();
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.Property(oi => oi.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(oi => oi.TotalPrice).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.Property(ci => ci.UnitPrice).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasIndex(c => c.Slug).IsUnique();
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Club Jerseys", Slug = "club-jerseys", Description = "Official club football jerseys", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { Id = 2, Name = "National Team", Slug = "national-team", Description = "National team jerseys", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Category { Id = 3, Name = "Custom Jerseys", Slug = "custom-jerseys", Description = "Custom printed jerseys", IsActive = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );

        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Argentina 2024 Home Jersey", Slug = "argentina-2024-home", Team = "Argentina", Description = "Official Argentina home jersey for 2024", Price = 1200, StockQuantity = 50, IsFeatured = true, IsActive = true, CategoryId = 2, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Product { Id = 2, Name = "Brazil 2024 Away Jersey", Slug = "brazil-2024-away", Team = "Brazil", Description = "Official Brazil away jersey for 2024", Price = 1100, DiscountPrice = 950, StockQuantity = 30, IsFeatured = true, IsActive = true, CategoryId = 2, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Product { Id = 3, Name = "Real Madrid Home Jersey", Slug = "real-madrid-home", Team = "Real Madrid", Description = "Official Real Madrid home jersey", Price = 1500, StockQuantity = 25, IsFeatured = true, IsActive = true, CategoryId = 1, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Product { Id = 4, Name = "Barcelona Away Jersey", Slug = "barcelona-away", Team = "Barcelona", Description = "Official Barcelona away jersey", Price = 1400, DiscountPrice = 1200, StockQuantity = 20, IsFeatured = false, IsActive = true, CategoryId = 1, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
    }
}
