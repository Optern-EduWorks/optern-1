using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;
using Microsoft.AspNetCore.Authorization;

[Route("api/[controller]")]
[ApiController]
public class RecruitersController : ControllerBase
{
    private readonly JobPortalContext _context;
    public RecruitersController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Recruiter>>> GetAll() =>
        await _context.Recruiters.ToListAsync();

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<Recruiter>> GetMyProfile()
    {
        Console.WriteLine($"RecruitersController - GetMyProfile called");
        Console.WriteLine($"Request path: {HttpContext.Request.Path}");
        Console.WriteLine($"Request method: {HttpContext.Request.Method}");
        Console.WriteLine($"Request headers: {string.Join(", ", HttpContext.Request.Headers.Select(h => $"{h.Key}={h.Value}").ToList())}");
        
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.Email == emailClaim.Value);
        if (recruiter == null)
        {
            // Auto-create profile for authenticated recruiters
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailClaim.Value && u.Role == "recruiter");
            if (user == null)
            {
                return Unauthorized(new { message = "User is not a recruiter" });
            }

            recruiter = new Recruiter
            {
                FullName = user.Username,
                Email = user.Email,
                JobTitle = "Recruiter",
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now
            };

            _context.Recruiters.Add(recruiter);
            await _context.SaveChangesAsync();
        }

        return recruiter;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Recruiter>> Get(int id)
    {
        var recruiter = await _context.Recruiters.FindAsync(id);
        return recruiter == null ? NotFound() : recruiter;
    }

    [HttpPost]
    public async Task<ActionResult<Recruiter>> Create(Recruiter recruiter)
    {
        _context.Recruiters.Add(recruiter);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = recruiter.RecruiterID }, recruiter);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Recruiter recruiter)
    {
        if (id != recruiter.RecruiterID) return BadRequest();
        _context.Entry(recruiter).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var recruiter = await _context.Recruiters.FindAsync(id);
        if (recruiter == null) return NotFound();
        _context.Recruiters.Remove(recruiter);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
