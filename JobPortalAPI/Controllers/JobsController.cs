using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;
using Microsoft.AspNetCore.Authorization;

[Route("api/[controller]")]
[ApiController]
public class JobsController : ControllerBase
{
    private readonly JobPortalContext _context;

    public JobsController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Job>>> GetAll() =>
        await _context.Jobs.Include(j => j.Company).Include(j => j.Recruiter).ToListAsync();

    [HttpGet("by-recruiter")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<Job>>> GetByRecruiter()
    {
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.Email == emailClaim.Value);
        if (recruiter == null)
        {
            return BadRequest(new { message = "Recruiter profile not found" });
        }

        var jobs = await _context.Jobs
            .Include(j => j.Company)
            .Include(j => j.Recruiter)
            .Where(j => j.RecruiterID == recruiter.RecruiterID)
            .ToListAsync();

        return jobs;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Job>> Get(int id)
    {
        var job = await _context.Jobs.Include(j => j.Company).Include(j => j.Recruiter).FirstOrDefaultAsync(j => j.JobID == id);
        return job == null ? NotFound() : job;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Job>> Create(Job job)
    {
        // Get recruiter email from authenticated user
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        // Find recruiter by email
        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.Email == emailClaim.Value);
        if (recruiter == null)
        {
            return BadRequest(new { message = "Recruiter profile not found" });
        }

        // Set RecruiterID
        job.RecruiterID = recruiter.RecruiterID;

        // If CompanyID is not set, try to find by name (assuming company name is passed)
        if (job.CompanyID == 0 && !string.IsNullOrEmpty(job.Company?.Name))
        {
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.Name == job.Company.Name);
            if (company != null)
            {
                job.CompanyID = company.CompanyID;
            }
            else
            {
                return BadRequest(new { message = "Company not found" });
            }
        }

        // Set default dates if not provided
        job.PostedDate = DateTime.Now;
        if (job.ClosingDate == default)
        {
            job.ClosingDate = DateTime.Now.AddDays(30);
        }

        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = job.JobID }, job);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, Job job)
    {
        if (id != job.JobID) return BadRequest();

        // Ensure only the recruiter who posted can update
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var existingJob = await _context.Jobs.FindAsync(id);
        if (existingJob == null) return NotFound();

        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.Email == emailClaim.Value);
        if (recruiter == null || existingJob.RecruiterID != recruiter.RecruiterID)
        {
            return Forbid();
        }

        _context.Entry(job).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var job = await _context.Jobs.FindAsync(id);
        if (job == null) return NotFound();

        // Ensure only the recruiter who posted can delete
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.Email == emailClaim.Value);
        if (recruiter == null || job.RecruiterID != recruiter.RecruiterID)
        {
            return Forbid();
        }

        _context.Jobs.Remove(job);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
