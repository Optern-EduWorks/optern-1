using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;
using Microsoft.AspNetCore.Authorization;

[Route("api/[controller]")]
[ApiController]
public class ApplicationsController : ControllerBase
{
    private readonly JobPortalContext _context;
    public ApplicationsController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Application>>> GetAll() =>
        await _context.Applications
            .Include(a => a.Job)
            .Include(a => a.Candidate)
            .ToListAsync();

    [HttpGet("by-recruiter")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<Application>>> GetByRecruiter()
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

        var applications = await _context.Applications
            .Include(a => a.Job)
            .Include(a => a.Candidate)
            .Where(a => a.Job != null && a.Job.RecruiterID == recruiter.RecruiterID)
            .ToListAsync();

        return applications;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Application>> Get(int id)
    {
        var app = await _context.Applications
            .Include(a => a.Job)
            .Include(a => a.Candidate)
            .FirstOrDefaultAsync(a => a.ApplicationID == id);
        return app == null ? NotFound() : app;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<Application>> Create(Application app)
    {
        // Get candidate ID from authenticated user
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var candidate = await _context.CandidateProfiles.FirstOrDefaultAsync(c => c.Email == emailClaim.Value);
        if (candidate == null)
        {
            return BadRequest(new { message = "Candidate profile not found" });
        }

        // Set CandidateID
        app.CandidateID = candidate.CandidateID;

        // Check if job exists and is active
        var job = await _context.Jobs.FindAsync(app.JobID);
        if (job == null)
        {
            return BadRequest(new { message = "Job not found" });
        }

        if (job.ClosingDate < DateTime.Now)
        {
            return BadRequest(new { message = "Job application deadline has passed" });
        }

        // Check if already applied
        var existingApplication = await _context.Applications
            .FirstOrDefaultAsync(a => a.JobID == app.JobID && a.CandidateID == app.CandidateID);
        if (existingApplication != null)
        {
            return BadRequest(new { message = "You have already applied for this job" });
        }

        // Set default values
        app.AppliedDate = DateTime.Now;
        if (string.IsNullOrEmpty(app.Status))
        {
            app.Status = "Applied";
        }

        _context.Applications.Add(app);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = app.ApplicationID }, app);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, Application app)
    {
        if (id != app.ApplicationID) return BadRequest();

        var existingApp = await _context.Applications.Include(a => a.Job).FirstOrDefaultAsync(a => a.ApplicationID == id);
        if (existingApp == null) return NotFound();

        // Allow recruiters to update status for their jobs
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.Email == emailClaim.Value);
        if (recruiter != null && existingApp.Job != null && existingApp.Job.RecruiterID == recruiter.RecruiterID)
        {
            // Recruiter updating their job's application
            _context.Entry(app).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Candidates can only update their own applications (limited fields)
        var candidate = await _context.CandidateProfiles.FirstOrDefaultAsync(c => c.Email == emailClaim.Value);
        if (candidate != null && existingApp.CandidateID == candidate.CandidateID)
        {
            // Allow candidates to update cover letter and resume URL
            existingApp.CoverLetter = app.CoverLetter;
            existingApp.ResumeUrl = app.ResumeUrl;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        return Forbid();
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var app = await _context.Applications.FindAsync(id);
        if (app == null) return NotFound();

        // Only candidates can delete their own applications
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var candidate = await _context.CandidateProfiles.FirstOrDefaultAsync(c => c.Email == emailClaim.Value);
        if (candidate == null || app.CandidateID != candidate.CandidateID)
        {
            return Forbid();
        }

        _context.Applications.Remove(app);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
