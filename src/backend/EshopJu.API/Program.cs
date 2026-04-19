using EshopJu.Application.Interfaces;
using EshopJu.Infrastructure.Persistence;
using EshopJu.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Database
var dbProvider = builder.Configuration["DatabaseProvider"] ?? "MySql";
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        var connStr = builder.Configuration.GetConnectionString("SqlServerConnection");
        options.UseSqlServer(connStr);
    }
    else
    {
        var connStr = builder.Configuration.GetConnectionString("MySqlConnection");
        options.UseMySql(connStr, ServerVersion.AutoDetect(connStr));
    }
});

// Services
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IDiscountService, DiscountService>();
builder.Services.AddScoped<IShippingService, ShippingService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();

// JWT Auth
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "eshopju-super-secret-key-2024-change-in-production";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CreateProduct",   p => p.RequireClaim("permission", "CREATE_PRODUCT"));
    options.AddPolicy("EditProduct",     p => p.RequireClaim("permission", "EDIT_PRODUCT"));
    options.AddPolicy("DeleteProduct",   p => p.RequireClaim("permission", "DELETE_PRODUCT"));
    options.AddPolicy("ViewOrder",       p => p.RequireClaim("permission", "VIEW_ORDER"));
    options.AddPolicy("ManageOrder",     p => p.RequireClaim("permission", "MANAGE_ORDER"));
    options.AddPolicy("ManageCustomer",  p => p.RequireClaim("permission", "MANAGE_CUSTOMER"));
    options.AddPolicy("ManageInventory", p => p.RequireClaim("permission", "MANAGE_INVENTORY"));
    options.AddPolicy("ManageCoupons",   p => p.RequireClaim("permission", "MANAGE_COUPONS"));
    options.AddPolicy("ViewReports",     p => p.RequireClaim("permission", "VIEW_REPORTS"));
    options.AddPolicy("ManageShipping",  p => p.RequireClaim("permission", "MANAGE_SHIPPING"));
    options.AddPolicy("ManageRoles",     p => p.RequireClaim("permission", "MANAGE_ROLES"));
});
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize enums as camelCase strings (e.g. "home", "away", "pending")
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase));
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "EshopJu API", Version = "v1", Description = "Jersey eCommerce API with WhatsApp checkout" });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "https://eshopju.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    await RbacSeeder.SeedAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

await app.RunAsync();

