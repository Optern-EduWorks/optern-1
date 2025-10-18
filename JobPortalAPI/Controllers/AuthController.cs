using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BCrypt.Net;

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
                Console.WriteLine($"Login attempt for email: {req?.Email}");

                if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                {
                    Console.WriteLine("Login failed: Email or password missing");
                    return BadRequest(new { message = "Email and password are required" });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
                if (user == null)
                {
                    Console.WriteLine($"Login failed: No user found with email {req.Email}");
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                // Verify password using BCrypt
                if (!BCrypt.Net.BCrypt.Verify(req.Password, user.Password))
                {
                    Console.WriteLine($"Login failed: Invalid password for email {req.Email}");
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                Console.WriteLine($"Login successful for user: {user.Email} (ID: {user.UserId})");

                // Generate JWT token
                var token = GenerateJwtToken(user);

                // Remove password before returning
                user.Password = string.Empty;

                // Return in a clear structure that frontend can easily parse
                var response = new
                {
                    message = "Login successful",
                    user = user,
                    success = true,
                    userId = user.UserId,
                    email = user.Email,
                    role = user.Role,
                    token = token
                };

                Console.WriteLine($"Returning response: {System.Text.Json.JsonSerializer.Serialize(response)}");
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "An internal server error occurred. Please try again later." });
            }
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "AuthController is working" });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _context.Users.ToListAsync();
                Console.WriteLine($"Found {users.Count} users in database");
                foreach (var user in users)
                {
                    Console.WriteLine($"User: {user.Email} (ID: {user.UserId}, Role: {user.Role})");
                }

                // Remove passwords before returning
                foreach (var user in users)
                {
                    user.Password = string.Empty;
                }

                return Ok(new { users = users, count = users.Count });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting users: {ex.Message}");
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        public class ChangePasswordRequest
        {
            public string CurrentPassword { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
            public int UserId { get; set; }
        }

        [HttpPost("change-password")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
        {
            try
            {
                Console.WriteLine("Change password attempt");

                // Get user ID from JWT token claims
                var userIdClaim = User.FindFirst("UserId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authenticatedUserId))
                {
                    Console.WriteLine("Change password failed: Invalid or missing user ID in token");
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                if (req == null || string.IsNullOrWhiteSpace(req.CurrentPassword) || string.IsNullOrWhiteSpace(req.NewPassword))
                {
                    Console.WriteLine("Change password failed: Current password or new password missing");
                    return BadRequest(new { message = "Current password and new password are required" });
                }

                var user = await _context.Users.FindAsync(authenticatedUserId);
                if (user == null)
                {
                    Console.WriteLine($"Change password failed: User not found with ID {authenticatedUserId}");
                    return NotFound(new { message = "User not found" });
                }

                // Verify current password using BCrypt
                if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.Password))
                {
                    Console.WriteLine("Change password failed: Current password incorrect");
                    return BadRequest(new { message = "Current password is incorrect" });
                }

                // Hash the new password before saving
                user.Password = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Password changed successfully for user: {user.Email}");

                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Change password error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "An internal server error occurred. Please try again later." });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("UserId", user.UserId.ToString()),
                new Claim("Email", user.Email),
                new Claim("Role", user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourSuperSecretKeyHere12345678901234567890"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "JobPortalAPI",
                audience: "JobPortalFrontend",
                claims: claims,
                expires: DateTime.Now.AddHours(24),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
