using JobPortalAPI.Data;
using Microsoft.EntityFrameworkCore;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure JSON serialization for better frontend compatibility
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Keep PascalCase from models
    });

builder.Services.AddDbContext<JobPortalContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

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

app.MapControllers();

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
