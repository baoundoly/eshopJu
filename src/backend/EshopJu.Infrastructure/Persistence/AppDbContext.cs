using EshopJu.Core.Entities;
using EshopJu.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace EshopJu.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<StockIn> StockIns => Set<StockIn>();
    public DbSet<StockInItem> StockInItems => Set<StockInItem>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<DiscountRule> DiscountRules => Set<DiscountRule>();
    public DbSet<OrderDiscount> OrderDiscounts => Set<OrderDiscount>();
    public DbSet<ShippingZone> ShippingZones => Set<ShippingZone>();
    public DbSet<ShippingZoneArea> ShippingZoneAreas => Set<ShippingZoneArea>();
    public DbSet<ShippingMethod> ShippingMethods => Set<ShippingMethod>();
    public DbSet<ShippingRate> ShippingRates => Set<ShippingRate>();

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

        modelBuilder.Entity<StockInItem>(entity =>
        {
            entity.Property(i => i.PurchasePrice).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Coupon>(entity =>
        {
            entity.HasIndex(c => c.Code).IsUnique();
            entity.Property(c => c.Value).HasColumnType("decimal(18,2)");
            entity.Property(c => c.MaxDiscountAmount).HasColumnType("decimal(18,2)");
            entity.Property(c => c.MinOrderAmount).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<DiscountRule>(entity =>
        {
            entity.Property(r => r.Value).HasColumnType("decimal(18,2)");
            entity.Property(r => r.MaxDiscountAmount).HasColumnType("decimal(18,2)");
            entity.Property(r => r.MinOrderAmount).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(o => o.DiscountAmount).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<OrderDiscount>(entity =>
        {
            entity.Property(od => od.DiscountAmount).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<ShippingRate>(entity =>
        {
            entity.Property(r => r.Rate).HasColumnType("decimal(18,2)");
            entity.Property(r => r.MinOrderAmount).HasColumnType("decimal(18,2)");
            entity.Property(r => r.MaxOrderAmount).HasColumnType("decimal(18,2)");
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        var now = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Club Jerseys", Slug = "club-jerseys", Description = "Official club football jerseys", IsActive = true, CreatedAt = now, UpdatedAt = now },
            new Category { Id = 2, Name = "National Team", Slug = "national-team", Description = "National team jerseys", IsActive = true, CreatedAt = now, UpdatedAt = now },
            new Category { Id = 3, Name = "Custom Jerseys", Slug = "custom-jerseys", Description = "Custom printed jerseys", IsActive = true, CreatedAt = now, UpdatedAt = now },
            new Category { Id = 4, Name = "Accessories", Slug = "accessories", Description = "Football accessories: caps, footballs, socks and more", IsActive = true, CreatedAt = now, UpdatedAt = now }
        );

        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Argentina 2024 Home Jersey", Slug = "argentina-2024-home", Team = "Argentina", Description = "Official Argentina home jersey for 2024", Price = 1200, StockQuantity = 50, IsFeatured = true, IsActive = true, CategoryId = 2, Color = "Sky Blue", JerseyType = JerseyType.Home, CreatedAt = now, UpdatedAt = now },
            new Product { Id = 2, Name = "Brazil 2024 Away Jersey", Slug = "brazil-2024-away", Team = "Brazil", Description = "Official Brazil away jersey for 2024", Price = 1100, DiscountPrice = 950, StockQuantity = 30, IsFeatured = true, IsActive = true, CategoryId = 2, Color = "Blue", JerseyType = JerseyType.Away, CreatedAt = now, UpdatedAt = now },
            new Product { Id = 3, Name = "Real Madrid Home Jersey", Slug = "real-madrid-home", Team = "Real Madrid", Description = "Official Real Madrid home jersey", Price = 1500, StockQuantity = 25, IsFeatured = true, IsActive = true, CategoryId = 1, Color = "White", JerseyType = JerseyType.Home, CreatedAt = now, UpdatedAt = now },
            new Product { Id = 4, Name = "Barcelona Away Jersey", Slug = "barcelona-away", Team = "Barcelona", Description = "Official Barcelona away jersey", Price = 1400, DiscountPrice = 1200, StockQuantity = 20, IsFeatured = false, IsActive = true, CategoryId = 1, Color = "Yellow", JerseyType = JerseyType.Away, CreatedAt = now, UpdatedAt = now },
            new Product { Id = 5, Name = "Football Cap", Slug = "football-cap", Team = null, Description = "Premium football cap with embroidered team logo", Price = 400, StockQuantity = 100, IsFeatured = false, IsActive = true, CategoryId = 4, Color = "Black", JerseyType = JerseyType.NotApplicable, CreatedAt = now, UpdatedAt = now },
            new Product { Id = 6, Name = "Match Football", Slug = "match-football", Team = null, Description = "Professional match football, size 5", Price = 800, StockQuantity = 60, IsFeatured = false, IsActive = true, CategoryId = 4, Color = "White", JerseyType = JerseyType.NotApplicable, CreatedAt = now, UpdatedAt = now },
            new Product { Id = 7, Name = "Football Socks", Slug = "football-socks", Team = null, Description = "Anti-blister football socks, pair", Price = 200, StockQuantity = 200, IsFeatured = false, IsActive = true, CategoryId = 4, Color = "White", JerseyType = JerseyType.NotApplicable, CreatedAt = now, UpdatedAt = now }
        );

        modelBuilder.Entity<ProductVariant>().HasData(
            // Argentina Home
            new ProductVariant { Id = 1, ProductId = 1, Color = "Sky Blue", JerseyType = JerseyType.Home, Size = "S",   StockQuantity = 10, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 2, ProductId = 1, Color = "Sky Blue", JerseyType = JerseyType.Home, Size = "M",   StockQuantity = 15, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 3, ProductId = 1, Color = "Sky Blue", JerseyType = JerseyType.Home, Size = "L",   StockQuantity = 15, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 4, ProductId = 1, Color = "Sky Blue", JerseyType = JerseyType.Home, Size = "XL",  StockQuantity = 10, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            // Brazil Away
            new ProductVariant { Id = 5, ProductId = 2, Color = "Blue", JerseyType = JerseyType.Away, Size = "S",   StockQuantity = 5, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 6, ProductId = 2, Color = "Blue", JerseyType = JerseyType.Away, Size = "M",   StockQuantity = 10, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 7, ProductId = 2, Color = "Blue", JerseyType = JerseyType.Away, Size = "L",   StockQuantity = 10, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 8, ProductId = 2, Color = "Blue", JerseyType = JerseyType.Away, Size = "XL",  StockQuantity = 5,  LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            // Real Madrid Home
            new ProductVariant { Id = 9,  ProductId = 3, Color = "White", JerseyType = JerseyType.Home, Size = "S",  StockQuantity = 5, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 10, ProductId = 3, Color = "White", JerseyType = JerseyType.Home, Size = "M",  StockQuantity = 8, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 11, ProductId = 3, Color = "White", JerseyType = JerseyType.Home, Size = "L",  StockQuantity = 8, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 12, ProductId = 3, Color = "White", JerseyType = JerseyType.Home, Size = "XL", StockQuantity = 4, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            // Barcelona Away
            new ProductVariant { Id = 13, ProductId = 4, Color = "Yellow", JerseyType = JerseyType.Away, Size = "S",  StockQuantity = 4, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 14, ProductId = 4, Color = "Yellow", JerseyType = JerseyType.Away, Size = "M",  StockQuantity = 6, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 15, ProductId = 4, Color = "Yellow", JerseyType = JerseyType.Away, Size = "L",  StockQuantity = 6, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 16, ProductId = 4, Color = "Yellow", JerseyType = JerseyType.Away, Size = "XL", StockQuantity = 4, LowStockThreshold = 5, CreatedAt = now, UpdatedAt = now },
            // Accessories - one size fits all / one variant per product
            new ProductVariant { Id = 17, ProductId = 5, Color = "Black",  JerseyType = JerseyType.NotApplicable, Size = "One Size", StockQuantity = 100, LowStockThreshold = 10, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 18, ProductId = 6, Color = "White",  JerseyType = JerseyType.NotApplicable, Size = "Size 5",   StockQuantity = 60,  LowStockThreshold = 10, CreatedAt = now, UpdatedAt = now },
            new ProductVariant { Id = 19, ProductId = 7, Color = "White",  JerseyType = JerseyType.NotApplicable, Size = "One Size", StockQuantity = 200, LowStockThreshold = 10, CreatedAt = now, UpdatedAt = now }
        );

        // ── Shipping seed data ──────────────────────────────────────────────

        modelBuilder.Entity<ShippingZone>().HasData(
            new ShippingZone { Id = 1, Name = "Inside Dhaka", Description = "Dhaka city and surrounding areas", IsActive = true, CreatedAt = now, UpdatedAt = now },
            new ShippingZone { Id = 2, Name = "Outside Dhaka", Description = "Rest of Bangladesh", IsActive = true, CreatedAt = now, UpdatedAt = now }
        );

        modelBuilder.Entity<ShippingZoneArea>().HasData(
            // Inside Dhaka zone districts
            new ShippingZoneArea { Id = 1, ZoneId = 1, District = "Dhaka", Thana = null, CreatedAt = now, UpdatedAt = now },
            new ShippingZoneArea { Id = 2, ZoneId = 1, District = "Narayanganj", Thana = null, CreatedAt = now, UpdatedAt = now },
            new ShippingZoneArea { Id = 3, ZoneId = 1, District = "Gazipur", Thana = null, CreatedAt = now, UpdatedAt = now },
            // Outside Dhaka — major cities
            new ShippingZoneArea { Id = 4, ZoneId = 2, District = "Chittagong", Thana = null, CreatedAt = now, UpdatedAt = now },
            new ShippingZoneArea { Id = 5, ZoneId = 2, District = "Sylhet", Thana = null, CreatedAt = now, UpdatedAt = now },
            new ShippingZoneArea { Id = 6, ZoneId = 2, District = "Rajshahi", Thana = null, CreatedAt = now, UpdatedAt = now },
            new ShippingZoneArea { Id = 7, ZoneId = 2, District = "Khulna", Thana = null, CreatedAt = now, UpdatedAt = now },
            new ShippingZoneArea { Id = 8, ZoneId = 2, District = "Barisal", Thana = null, CreatedAt = now, UpdatedAt = now },
            new ShippingZoneArea { Id = 9, ZoneId = 2, District = "Rangpur", Thana = null, CreatedAt = now, UpdatedAt = now },
            new ShippingZoneArea { Id = 10, ZoneId = 2, District = "Mymensingh", Thana = null, CreatedAt = now, UpdatedAt = now }
        );

        modelBuilder.Entity<ShippingMethod>().HasData(
            new ShippingMethod { Id = 1, Name = "Home Delivery", Description = "Delivered to your doorstep", IsActive = true, CreatedAt = now, UpdatedAt = now },
            new ShippingMethod { Id = 2, Name = "Courier Delivery", Description = "Delivered via courier service", IsActive = true, CreatedAt = now, UpdatedAt = now },
            new ShippingMethod { Id = 3, Name = "Express Delivery", Description = "Same-day or next-day express delivery", IsActive = true, CreatedAt = now, UpdatedAt = now }
        );

        modelBuilder.Entity<ShippingRate>().HasData(
            // Inside Dhaka – Home Delivery ৳60, free above ৳3000
            new ShippingRate { Id = 1, ZoneId = 1, MethodId = 1, MinOrderAmount = null, MaxOrderAmount = 2999.99m, Rate = 60m, IsFreeShipping = false, CreatedAt = now, UpdatedAt = now },
            new ShippingRate { Id = 2, ZoneId = 1, MethodId = 1, MinOrderAmount = 3000m, MaxOrderAmount = null,    Rate = 0m,  IsFreeShipping = true,  CreatedAt = now, UpdatedAt = now },
            // Inside Dhaka – Express Delivery ৳120
            new ShippingRate { Id = 3, ZoneId = 1, MethodId = 3, MinOrderAmount = null, MaxOrderAmount = null, Rate = 120m, IsFreeShipping = false, CreatedAt = now, UpdatedAt = now },
            // Outside Dhaka – Courier Delivery ৳120, free above ৳5000
            new ShippingRate { Id = 4, ZoneId = 2, MethodId = 2, MinOrderAmount = null, MaxOrderAmount = 4999.99m, Rate = 120m, IsFreeShipping = false, CreatedAt = now, UpdatedAt = now },
            new ShippingRate { Id = 5, ZoneId = 2, MethodId = 2, MinOrderAmount = 5000m, MaxOrderAmount = null,    Rate = 0m,   IsFreeShipping = true,  CreatedAt = now, UpdatedAt = now },
            // Outside Dhaka – Express Delivery ৳200
            new ShippingRate { Id = 6, ZoneId = 2, MethodId = 3, MinOrderAmount = null, MaxOrderAmount = null, Rate = 200m, IsFreeShipping = false, CreatedAt = now, UpdatedAt = now }
        );
    }
}
