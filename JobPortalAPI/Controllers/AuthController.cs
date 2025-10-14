using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

namespace JobPortalAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly JobPortalContext _context;

        public AuthController(JobPortalContext context)
        {
            _context = context;
        }

        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            try
            {
                if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                    return BadRequest(new { message = "Email and password are required" });

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == req.Email && u.Password == req.Password);
                if (user == null)
                    return Unauthorized(new { message = "Invalid email or password" });

                // Remove password before returning
                user.Password = string.Empty;
                return Ok(new { message = "Login successful", user = user });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An internal server error occurred. Please try again later." });
            }
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "AuthController is working" });
        }
    }
}
