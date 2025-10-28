using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;
using BCrypt.Net;

namespace JobPortalAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestDataController : ControllerBase
    {
        private readonly JobPortalContext _context;

        public TestDataController(JobPortalContext context)
        {
            _context = context;
        }

        [HttpPost("create-test-users")]
        public async Task<IActionResult> CreateTestUsers()
        {
            try
            {
                // Check if test users already exist
                var existingUsers = await _context.Users.Where(u => u.Email.Contains("test")).ToListAsync();
                if (existingUsers.Any())
                {
                    return Ok(new { message = "Test users already exist", count = existingUsers.Count });
                }

                // Create test users
                var testUsers = new List<User>
                {
                    new User
                    {
                        Role = "recruiter",
                        Username = "Test Recruiter",
                        Email = "recruiter@test.com",
                        Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                        Status = "Active",
                        PhoneNumber = "123-456-7890",
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now,
                        VerificationStatus = "Verified"
                    },
                    new User
                    {
                        Role = "student",
                        Username = "Test Student",
                        Email = "student@test.com",
                        Password = BCrypt.Net.BCrypt.HashPassword("password123"),
                        Status = "Active",
                        PhoneNumber = "123-456-7891",
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now,
                        VerificationStatus = "Verified"
                    }
                };

                _context.Users.AddRange(testUsers);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Test users created successfully", count = testUsers.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating test users", error = ex.Message });
            }
        }

        [HttpPost("hash-all-passwords")]
        public async Task<IActionResult> HashAllPasswords()
        {
            try
            {
                var users = await _context.Users.ToListAsync();
                int hashedCount = 0;
                int skippedCount = 0;

                foreach (var user in users)
                {
                    if (!string.IsNullOrEmpty(user.Password) && !user.Password.StartsWith("$2"))
                    {
                        // Password is plain text, hash it
                        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
                        user.UpdatedAt = DateTime.Now;
                        hashedCount++;
                        Console.WriteLine($"Hashed password for user: {user.Email}");
                    }
                    else if (string.IsNullOrEmpty(user.Password))
                    {
                        // Set default password for users without passwords
                        user.Password = BCrypt.Net.BCrypt.HashPassword("password123");
                        user.UpdatedAt = DateTime.Now;
                        hashedCount++;
                        Console.WriteLine($"Set default password for user: {user.Email}");
                    }
                    else
                    {
                        skippedCount++;
                        Console.WriteLine($"Skipped user (already hashed): {user.Email}");
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new {
                    message = "Password hashing completed",
                    hashedCount = hashedCount,
                    skippedCount = skippedCount,
                    totalUsers = users.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error hashing passwords", error = ex.Message });
            }
        }

        [HttpPost("remove-duplicate-users")]
        public async Task<IActionResult> RemoveDuplicateUsers()
        {
            try
            {
                var users = await _context.Users.ToListAsync();
                var duplicateGroups = users.GroupBy(u => u.Email)
                                          .Where(g => g.Count() > 1)
                                          .ToList();

                int removedCount = 0;
                foreach (var group in duplicateGroups)
                {
                    // Keep the user with the most recent UpdatedAt, or the one with a password
                    var usersToRemove = group.OrderByDescending(u => u.UpdatedAt)
                                            .ThenByDescending(u => !string.IsNullOrEmpty(u.Password))
                                            .Skip(1)
                                            .ToList();

                    foreach (var user in usersToRemove)
                    {
                        // Check if user has dependent records
                        var hasRecruiterProfile = await _context.Recruiters.AnyAsync(r => r.Email == user.Email);
                        var hasApplications = await _context.Applications.AnyAsync(a => a.CandidateID == user.UserId);

                        if (!hasRecruiterProfile && !hasApplications)
                        {
                            _context.Users.Remove(user);
                            removedCount++;
                            Console.WriteLine($"Removed duplicate user: {user.Email} (ID: {user.UserId})");
                        }
                        else
                        {
                            Console.WriteLine($"Kept duplicate user (has dependencies): {user.Email} (ID: {user.UserId})");
                        }
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new {
                    message = "Duplicate user removal completed",
                    removedCount = removedCount,
                    duplicateGroupsFound = duplicateGroups.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error removing duplicate users", error = ex.Message });
            }
        }

        [HttpPost("prevent-duplicate-emails")]
        public async Task<IActionResult> PreventDuplicateEmails()
        {
            try
            {
                // Add unique index on Email column if it doesn't exist
                // This is a database-level constraint to prevent duplicates

                // For SQLite, we need to create a new table with unique constraint
                // But for now, let's just check and report duplicates

                var users = await _context.Users.ToListAsync();
                var duplicates = users.GroupBy(u => u.Email)
                                     .Where(g => g.Count() > 1)
                                     .Select(g => new {
                                         email = g.Key,
                                         count = g.Count(),
                                         users = g.Select(u => new { u.UserId, u.Role, u.CreatedAt }).ToList()
                                     })
                                     .ToList();

                return Ok(new {
                    message = "Duplicate email check completed",
                    duplicateEmails = duplicates.Count,
                    duplicates = duplicates
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error checking duplicate emails", error = ex.Message });
            }
        }

        [HttpGet("test-auth")]
        public async Task<IActionResult> TestAuth()
        {
            var userCount = await _context.Users.CountAsync();
            var recruiterCount = await _context.Recruiters.CountAsync();
            var jobCount = await _context.Jobs.CountAsync();

            return Ok(new
            {
                message = "Database connection successful",
                userCount,
                recruiterCount,
                jobCount,
                timestamp = DateTime.Now
            });
        }

        [HttpDelete("clear-all-data")]
        public async Task<IActionResult> ClearAllData()
        {
            try
            {
                // Delete in reverse dependency order to avoid foreign key constraint violations

                // Delete dependent records first
                await _context.Applications.ExecuteDeleteAsync();
                await _context.CandidateCertifications.ExecuteDeleteAsync();
                await _context.CandidateProjects.ExecuteDeleteAsync();
                await _context.CandidateSkills.ExecuteDeleteAsync();
                await _context.CandidateExperiences.ExecuteDeleteAsync();
                await _context.CandidateEducations.ExecuteDeleteAsync();
                await _context.CandidateProfiles.ExecuteDeleteAsync();
                await _context.Announcements.ExecuteDeleteAsync();
                await _context.Grievances.ExecuteDeleteAsync();
                await _context.ActivityLogs.ExecuteDeleteAsync();

                // Delete jobs (which reference recruiters and companies)
                await _context.Jobs.ExecuteDeleteAsync();

                // Delete recruiters (which reference users and companies)
                await _context.Recruiters.ExecuteDeleteAsync();

                // Delete companies (which reference industries)
                await _context.Companies.ExecuteDeleteAsync();

                // Finally delete users
                await _context.Users.ExecuteDeleteAsync();

                // Note: Lookup tables (StatusLookup, IndustryLookup, etc.) are kept as they are reference data

                return Ok(new { message = "All users and jobs data cleared successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error clearing data", error = ex.Message });
            }
        }
    }
}

