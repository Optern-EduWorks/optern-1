using JobPortalAPI.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

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

// Enable static files so backend can optionally serve the frontend build from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

// Use CORS policy
app.UseCors("FrontendDevCors");

app.MapControllers();

// Fallback for SPA routes (serves index.html) - useful when hosting frontend from backend
app.MapFallbackToFile("index.html");

app.Run();
