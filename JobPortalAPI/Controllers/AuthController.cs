using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BCrypt.Net;
using Newtonsoft.Json.Linq;
using System.IO;

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
                Console.WriteLine($"AuthController - Login attempt");
                Console.WriteLine($"Request path: {HttpContext.Request.Path}");
                Console.WriteLine($"Request method: {HttpContext.Request.Method}");

                // Check for test token authentication
                var authHeader = HttpContext.Request.Headers["Authorization"].FirstOrDefault();
                if (authHeader == "Bearer test-token")
                {
                    Console.WriteLine("Test token login attempt");
                    // For test token, return a mock successful login for candidate@test.com
                    var testUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "candidate@test.com");
                    if (testUser == null)
                    {
                        return Unauthorized(new { message = "Test user not found" });
                    }

                    var testToken = GenerateJwtToken(testUser);
                    testUser.Password = string.Empty;

                    return Ok(new
                    {
                        message = "Login successful (test token)",
                        user = testUser,
                        success = true,
                        userId = testUser.UserId,
                        email = testUser.Email,
                        role = testUser.Role,
                        token = testToken,
                        recruiterProfile = (object)null
                    });
                }

                if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                {
                    Console.WriteLine("Login failed: Email or password missing");
                    return BadRequest(new { message = "Email and password are required" });
                }

                Console.WriteLine($"Searching for user with email: {req.Email}");
                // Get all users with this email and prioritize by role
                var users = await _context.Users.Where(u => u.Email == req.Email).ToListAsync();
                Console.WriteLine($"Found {users.Count} users with email {req.Email}");

                // Prioritize recruiter users over student users over candidate users
                var recruiterUsers = users.Where(u => u.Role != null && u.Role.Contains("Recruiter", StringComparison.OrdinalIgnoreCase)).ToList();
                var studentUsers = users.Where(u => u.Role != null && u.Role.Contains("student", StringComparison.OrdinalIgnoreCase)).ToList();
                var candidateUsers = users.Where(u => u.Role != null && u.Role.Contains("Candidate", StringComparison.OrdinalIgnoreCase)).ToList();

                // Debug logging
                Console.WriteLine($"Role filtering debug:");
                foreach (var u in users)
                {
                    Console.WriteLine($"  User {u.Email}: Role='{u.Role}', IsRecruiter={u.Role != null && u.Role.Contains("Recruiter", StringComparison.OrdinalIgnoreCase)}, IsStudent={u.Role != null && u.Role.Contains("student", StringComparison.OrdinalIgnoreCase)}, IsCandidate={u.Role != null && u.Role.Contains("Candidate", StringComparison.OrdinalIgnoreCase)}");
                }

                Console.WriteLine($"Recruiter users: {recruiterUsers.Count}, Student users: {studentUsers.Count}, Candidate users: {candidateUsers.Count}");

                User? user = null;
                if (recruiterUsers.Any())
                {
                    // Prioritize recruiter users with non-empty passwords
                    var validRecruiterUsers = recruiterUsers.Where(u => !string.IsNullOrEmpty(u.Password)).ToList();
                    if (validRecruiterUsers.Any())
                    {
                        user = validRecruiterUsers.First();
                        Console.WriteLine($"Selected recruiter user with valid password: ID={user.UserId}, Role={user.Role}");
                    }
                    else
                    {
                        user = recruiterUsers.First();
                        Console.WriteLine($"Selected recruiter user (no valid password found): ID={user.UserId}, Role={user.Role}");
                    }
                }
                else if (studentUsers.Any())
                {
                    // Prioritize student users with non-empty passwords
                    var validStudentUsers = studentUsers.Where(u => !string.IsNullOrEmpty(u.Password)).ToList();
                    if (validStudentUsers.Any())
                    {
                        user = validStudentUsers.First();
                        Console.WriteLine($"Selected student user with valid password: ID={user.UserId}, Role={user.Role}");
                    }
                    else
                    {
                        user = studentUsers.First();
                        Console.WriteLine($"Selected student user (no valid password found): ID={user.UserId}, Role={user.Role}");
                    }
                }
                else if (candidateUsers.Any())
                {
                    // Prioritize candidate users with non-empty passwords
                    var validCandidateUsers = candidateUsers.Where(u => !string.IsNullOrEmpty(u.Password)).ToList();
                    if (validCandidateUsers.Any())
                    {
                        user = validCandidateUsers.First();
                        Console.WriteLine($"Selected candidate user with valid password: ID={user.UserId}, Role={user.Role}");
                    }
                    else
                    {
                        user = candidateUsers.First();
                        Console.WriteLine($"Selected candidate user (no valid password found): ID={user.UserId}, Role={user.Role}");
                    }
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

                // Standardized password verification
                bool isPasswordValid = false;
                string passwordVerificationMethod = "";

                // Method 1: Try BCrypt verification (for properly hashed passwords)
                if (!string.IsNullOrEmpty(user.Password) && user.Password.StartsWith("$2"))
                {
                    try
                    {
                        isPasswordValid = BCrypt.Net.BCrypt.Verify(req.Password, user.Password);
                        passwordVerificationMethod = "BCrypt";
                        Console.WriteLine($"BCrypt verification result: {isPasswordValid}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"BCrypt verification error: {ex.Message}");
                    }
                }

                // Method 2: Try plain text comparison (for legacy users) - but hash immediately after
                if (!isPasswordValid && !string.IsNullOrEmpty(user.Password) && !user.Password.StartsWith("$2"))
                {
                    isPasswordValid = req.Password == user.Password;
                    passwordVerificationMethod = "PlainText";
                    Console.WriteLine($"Plain text password comparison result: {isPasswordValid}");
                }

                // Method 3: If still not valid, try BCrypt on plain text password (for test users)
                if (!isPasswordValid && !string.IsNullOrEmpty(req.Password))
                {
                    try
                    {
                        // Hash the provided password and compare with stored hash
                        isPasswordValid = BCrypt.Net.BCrypt.Verify(req.Password, user.Password);
                        passwordVerificationMethod = "BCryptFallback";
                        Console.WriteLine($"BCrypt fallback verification result: {isPasswordValid}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"BCrypt fallback verification error: {ex.Message}");
                    }
                }

                Console.WriteLine($"Password verification method used: {passwordVerificationMethod}");

                // If password is valid and not already hashed, hash it for future use
                if (isPasswordValid && !user.Password.StartsWith("$2"))
                {
                    try
                    {
                        user.Password = BCrypt.Net.BCrypt.HashPassword(req.Password);
                        user.UpdatedAt = DateTime.Now;
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"Password hashed and updated for user: {user.Email}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error hashing password: {ex.Message}");
                        // Continue with login even if hashing fails
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
                    } : (object)null
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

        [HttpGet("debug-users")]
        public async Task<IActionResult> DebugUsers()
        {
            try
            {
                var users = await _context.Users.ToListAsync();
                var userInfo = users.Select(u => new
                {
                    userId = u.UserId,
                    email = u.Email,
                    role = u.Role,
                    passwordLength = u.Password?.Length ?? 0,
                    isHashed = !string.IsNullOrEmpty(u.Password) && u.Password.StartsWith("$2"),
                    passwordStart = u.Password?.Substring(0, Math.Min(10, u.Password?.Length ?? 0)) ?? "null"
                }).ToList();

                return Ok(new { 
                    message = "User debug info", 
                    userCount = users.Count,
                    users = userInfo 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error getting user info", error = ex.Message });
            }
        }

        [HttpPost("fix-specific-user")]
        public async Task<IActionResult> FixSpecificUser([FromBody] FixUserRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { message = "Request body is required" });
                }

                string email = request.Email ?? string.Empty;
                string password = request.Password ?? string.Empty;

                Console.WriteLine($"Fixing user: {email}");

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Set the password to the provided value (plain text)
                user.Password = password;
                user.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();

                Console.WriteLine($"User {email} password set to: {password}");

                return Ok(new { 
                    message = "User password fixed", 
                    email = email,
                    passwordSet = true 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fixing user", error = ex.Message });
            }
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

        public class FixUserRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
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
