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
                Console.WriteLine($"AuthController - Login attempt for email: {req?.Email}");
                Console.WriteLine($"Request path: {HttpContext.Request.Path}");
                Console.WriteLine($"Request method: {HttpContext.Request.Method}");
                Console.WriteLine($"Request headers: {string.Join(", ", HttpContext.Request.Headers.Select(h => $"{h.Key}={h.Value}"))}");

                if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                {
                    Console.WriteLine("Login failed: Email or password missing");
                    return BadRequest(new { message = "Email and password are required" });
                }

                Console.WriteLine($"Searching for user with email: {req.Email}");
                // Get all users with this email and prioritize by role
                var users = await _context.Users.Where(u => u.Email == req.Email).ToListAsync();
                Console.WriteLine($"Found {users.Count} users with email {req.Email}");

                // Prioritize recruiter users over student users
                var recruiterUsers = users.Where(u => u.Role == "recruiter").ToList();
                var studentUsers = users.Where(u => u.Role == "student").ToList();

                Console.WriteLine($"Recruiter users: {recruiterUsers.Count}, Student users: {studentUsers.Count}");

                User? user = null;
                if (recruiterUsers.Any())
                {
                    user = recruiterUsers.First();
                    Console.WriteLine($"Selected recruiter user: ID={user.UserId}, Role={user.Role}");
                }
                else if (studentUsers.Any())
                {
                    user = studentUsers.First();
                    Console.WriteLine($"Selected student user: ID={user.UserId}, Role={user.Role}");
                }

                if (user == null)
                {
                    Console.WriteLine($"Login failed: No user found with email {req.Email}");
                    Console.WriteLine($"Available users in database:");
                    var allUsers = await _context.Users.ToListAsync();
                    foreach (var u in allUsers)
                    {
                        Console.WriteLine($"  - {u.Email} (ID: {u.UserId}, Role: {u.Role})");
                    }
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                Console.WriteLine($"User found: {user.Email}, Role: {user.Role}, Password length: {user.Password?.Length ?? 0}");
                Console.WriteLine($"Password starts with: '{user.Password?.Substring(0, Math.Min(5, user.Password?.Length ?? 0))}'");

                // Check if password is already hashed (BCrypt hashes start with $2a$, $2b$, or $2y$)
                bool isPasswordHashed = user.Password?.StartsWith("$2") == true;

                bool isPasswordValid;
                if (isPasswordHashed)
                {
                    // Verify hashed password
                    isPasswordValid = BCrypt.Net.BCrypt.Verify(req.Password, user.Password);
                }
                else
                {
                    // Password is stored as plain text (temporary fix for bad updates)
                    isPasswordValid = req.Password == user.Password;
                    if (isPasswordValid)
                    {
                        // Hash the password and update in database
                        user.Password = BCrypt.Net.BCrypt.HashPassword(req.Password);
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"Password hashed and updated for user: {user.Email}");
                    }
                }

                if (!isPasswordValid)
                {
                    Console.WriteLine($"Login failed: Invalid password for email {req.Email}");
                    Console.WriteLine($"Provided password length: {req.Password.Length}");
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                Console.WriteLine($"Login successful for user: {user.Email} (ID: {user.UserId})");

                // Generate JWT token
                var token = GenerateJwtToken(user);

                // Remove password before returning
                user.Password = string.Empty;

                // If user is a recruiter, ensure they have a recruiter profile
                Recruiter? recruiter = null;
                if (user.Role == "recruiter")
                {
                    recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.Email == user.Email);
                    if (recruiter == null)
                    {
                        // Get first available company or create one
                        var company = await _context.Companies.FirstOrDefaultAsync();
                        if (company == null)
                        {
                            // Create a default company
                            // Get or create default industry
                            var industry = await _context.Set<IndustryLookup>().FirstOrDefaultAsync();
                            if (industry == null)
                            {
                                industry = new IndustryLookup { IndustryName = "Technology" };
                                _context.Set<IndustryLookup>().Add(industry);
                                await _context.SaveChangesAsync();
                            }

                            company = new Company
                            {
                                Name = "Default Company",
                                Website = "https://example.com",
                                Size = "1-10",
                                Address = "123 Main St",
                                Phone = "123-456-7890",
                                CreatedDate = DateTime.Now,
                                IndustryID = industry.IndustryID
                            };
                            _context.Companies.Add(company);
                            await _context.SaveChangesAsync();
                        }

                        // Create recruiter profile
                        recruiter = new Recruiter
                        {
                            FullName = user.Username,
                            Email = user.Email,
                            JobTitle = "Recruiter",
                            CreatedDate = DateTime.Now,
                            UpdatedDate = DateTime.Now,
                            CompanyID = company.CompanyID
                        };
                        _context.Recruiters.Add(recruiter);
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"Created recruiter profile for user: {user.Email}");
                    }
                }

                // Return in a clear structure that frontend can easily parse
                var response = new
                {
                    message = "Login successful",
                    user = user,
                    success = true,
                    userId = user.UserId,
                    email = user.Email,
                    role = user.Role,
                    token = token,
                    recruiterProfile = recruiter != null ? new {
                        recruiterId = recruiter.RecruiterID,
                        fullName = recruiter.FullName,
                        email = recruiter.Email
                    } : null
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

        [HttpGet("profile")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> GetUserProfile()
        {
            try
            {
                var emailClaim = User.FindFirst("Email");
                if (emailClaim == null)
                {
                    return Unauthorized(new { message = "Invalid authentication token" });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailClaim.Value);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.Email == emailClaim.Value);
                
                return Ok(new { 
                    user = new { 
                        email = user.Email,
                        role = user.Role,
                        userId = user.UserId
                    },
                    recruiterProfile = recruiter != null ? new {
                        recruiterId = recruiter.RecruiterID,
                        fullName = recruiter.FullName,
                        email = recruiter.Email
                    } : null
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Get profile error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "An error occurred while fetching profile" });
            }
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
            try
            {
                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim("UserId", user.UserId.ToString()),
                    new Claim("Email", user.Email),
                    new Claim("Role", user.Role ?? "user")
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
            catch (Exception ex)
            {
                Console.WriteLine($"JWT Token Generation Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw; // Re-throw to be caught by the outer try-catch
            }
        }
    }
}
