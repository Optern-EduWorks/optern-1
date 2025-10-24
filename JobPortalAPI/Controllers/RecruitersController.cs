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

        var recruiter = await _context.Recruiters
            .Include(r => r.Company)
                .ThenInclude(c => c!.Industry)
            .FirstOrDefaultAsync(r => r.Email == emailClaim.Value);
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
                CompanyID = 1, // Assign default company
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now
            };

            _context.Recruiters.Add(recruiter);
            await _context.SaveChangesAsync();

            // Reload with company information
            recruiter = await _context.Recruiters
                .Include(r => r.Company)
                    .ThenInclude(c => c!.Industry)
                .FirstOrDefaultAsync(r => r.RecruiterID == recruiter.RecruiterID);
        }

        return recruiter!;
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
    [Authorize]
    public async Task<IActionResult> Update(int id, Recruiter recruiter)
    {
        if (id != recruiter.RecruiterID) return BadRequest();

        // Verify the recruiter belongs to the authenticated user
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var existingRecruiter = await _context.Recruiters.FindAsync(id);
        if (existingRecruiter == null)
        {
            return NotFound(new { message = "Recruiter not found" });
        }

        if (existingRecruiter.Email != emailClaim.Value)
        {
            return Forbid();
        }

        // Update only allowed fields
        existingRecruiter.FullName = recruiter.FullName;
        existingRecruiter.JobTitle = recruiter.JobTitle;
        existingRecruiter.PhoneNumber = recruiter.PhoneNumber;
        existingRecruiter.Bio = recruiter.Bio;
        existingRecruiter.UpdatedDate = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(existingRecruiter);
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

    [HttpPut("company/{companyId}")]
    [Authorize]
    public async Task<IActionResult> UpdateCompany(int companyId, Company company)
    {
        if (companyId != company.CompanyID) return BadRequest();

        // Verify the recruiter belongs to the authenticated user and has access to this company
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.Email == emailClaim.Value && r.CompanyID == companyId);
        if (recruiter == null)
        {
            return Forbid("You do not have permission to update this company");
        }

        var existingCompany = await _context.Companies.FindAsync(companyId);
        if (existingCompany == null)
        {
            return NotFound(new { message = "Company not found" });
        }

        // Update only allowed fields
        existingCompany.Name = company.Name;
        existingCompany.Website = company.Website;
        existingCompany.Size = company.Size;
        existingCompany.Address = company.Address;
        existingCompany.Phone = company.Phone;
        existingCompany.IndustryID = company.IndustryID;

        await _context.SaveChangesAsync();
        return Ok(existingCompany);
    }
}
