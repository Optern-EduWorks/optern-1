using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;
using BCrypt.Net;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly JobPortalContext _context;
    public UsersController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers() =>
        await _context.Users.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        return user == null ? NotFound() : user;
    }

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        // Store password as plain text - AuthController will hash it after first successful login
        if (!string.IsNullOrEmpty(user.Password))
        {
            // Keep password as plain text for now - it will be hashed on first login
        }
        
        // Set default values
        user.CreatedAt = DateTime.Now;
        user.UpdatedAt = DateTime.Now;
        if (string.IsNullOrEmpty(user.Status))
        {
            user.Status = "Active";
        }
        if (string.IsNullOrEmpty(user.VerificationStatus))
        {
            user.VerificationStatus = "Pending";
        }
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        // Remove password from response for security
        user.Password = string.Empty;
        
        return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, User user)
    {
        if (id != user.UserId) return BadRequest();
        _context.Entry(user).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("fix-passwords")]
    public async Task<IActionResult> FixPlainTextPasswords()
    {
        try
        {
            // Find users with plain text passwords (not starting with $2)
            var usersWithPlainTextPasswords = await _context.Users
                .Where(u => !string.IsNullOrEmpty(u.Password) && !u.Password.StartsWith("$2"))
                .ToListAsync();

            Console.WriteLine($"Found {usersWithPlainTextPasswords.Count} users with plain text passwords");

            foreach (var user in usersWithPlainTextPasswords)
            {
                Console.WriteLine($"Fixing password for user: {user.Email}");
                // Hash the plain text password
                user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
                user.UpdatedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Passwords fixed successfully", 
                fixedCount = usersWithPlainTextPasswords.Count 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fixing passwords", error = ex.Message });
        }
    }
}
