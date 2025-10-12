using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly JobPortalContext _context;
    public AuthController(JobPortalContext context) => _context = context;

    public class LoginRequest { public string Email { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Email and password required" });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == req.Email && u.Password == req.Password);
        if (user == null) return Unauthorized(new { message = "Invalid credentials" });

        // remove password before returning
        user.Password = string.Empty;
        return Ok(user);
    }
}
