using JobPortalAPI.Data;
using Microsoft.EntityFrameworkCore;
using System.IO;
using Microsoft.Data.Sqlite;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// Load environment specific configurations
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);

Console.WriteLine("Starting controller registration...");

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure JSON serialization for better frontend compatibility
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Keep PascalCase from models
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        // Disable automatic model state validation to handle it manually
        options.SuppressModelStateInvalidFilter = true;
    });

// Log the registered controllers
var controllers = AppDomain.CurrentDomain.GetAssemblies()
    .SelectMany(a => a.GetTypes())
    .Where(t => t.IsSubclassOf(typeof(Microsoft.AspNetCore.Mvc.ControllerBase)));

foreach (var controller in controllers)
{
    Console.WriteLine($"Found controller: {controller.Name}");
}

// Add SignalR services
builder.Services.AddSignalR();

builder.Services.AddDbContext<JobPortalContext>(options =>
    options.UseSqlServer("Server=tcp:optern.database.windows.net,1433;Initial Catalog=Opterndb;Persist Security Info=False;User ID=Optern_db;Password=Eduworks@2025;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;")
);


// JWT Configuration
var jwtKey = "YourSuperSecretKeyHere12345678901234567890";
var jwtIssuer = "JobPortalAPI";
var jwtAudience = "JobPortalFrontend";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // Add custom event to handle test token
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                if (authHeader == "Bearer test-token")
                {
                    // Create a fake identity for test token
                    var claims = new[]
                    {
                        new System.Security.Claims.Claim("Email", "candidate@test.com"),
                        new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, "Test Candidate")
                    };
                    var identity = new System.Security.Claims.ClaimsIdentity(claims, "TestToken");
                    context.Principal = new System.Security.Claims.ClaimsPrincipal(identity);
                    context.Success();
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// CORS: read allowed origins from configuration (appsettings.json) so it's configurable
var allowedOrigins = builder.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>() ?? new[] { "http://localhost:4200" };
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "FrontendDevCors", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Use CORS policy - must come before UseRouting
app.UseCors("FrontendDevCors");

// Enable static files so backend can optionally serve the frontend build from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map SignalR hub
app.MapHub<JobPortalAPI.Hubs.DashboardHub>("/dashboardHub");

// Fallback for SPA routes (serves index.html) - useful when hosting frontend from backend
// Only serve index.html for non-API routes to avoid interfering with API error responses
app.MapFallback(async context =>
{
    // Don't serve index.html for API routes that return errors
    var path = context.Request.Path.Value ?? "";
    if (path.StartsWith("/api/"))
    {
        // For API routes, return 404 to let the controller handle it
        context.Response.StatusCode = 404;
        return;
    }

    // For non-API routes, serve index.html
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(Path.Combine(app.Environment.WebRootPath, "index.html"));
});

app.Run();
