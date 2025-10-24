using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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

    [HttpGet("by-candidate")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<Application>>> GetByCandidate()
    {
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var candidate = await _context.CandidateProfiles.FirstOrDefaultAsync(c => c.Email.ToLower() == emailClaim.Value.ToLower());
        if (candidate == null)
        {
            return BadRequest(new { message = "Candidate profile not found" });
        }

        var applications = await _context.Applications
            .Include(a => a.Job)
            .Include(a => a.Candidate)
            .Where(a => a.CandidateID == candidate.CandidateID)
            .OrderByDescending(a => a.AppliedDate)
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
    public async Task<IActionResult> Create([FromBody] Application app)
    {
        try
        {
            Console.WriteLine($"ApplicationsController - Create called");
            Console.WriteLine($"Request path: {HttpContext.Request.Path}");
            Console.WriteLine($"Request method: {HttpContext.Request.Method}");
            Console.WriteLine($"Application data received: {System.Text.Json.JsonSerializer.Serialize(app)}");

            // Get candidate ID from authenticated user
            var emailClaim = User.FindFirst("Email");
            if (emailClaim == null)
            {
                return Unauthorized(new { message = "Invalid authentication token" });
            }

            Console.WriteLine($"Looking for candidate with email: {emailClaim.Value}");
            var candidate = await _context.CandidateProfiles.FirstOrDefaultAsync(c => c.Email.ToLower() == emailClaim.Value.ToLower());
            if (candidate == null)
            {
                Console.WriteLine($"No candidate profile found for email: {emailClaim.Value}");
                // Check if user exists but doesn't have a candidate profile
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailClaim.Value.ToLower());
                if (user != null)
                {
                    Console.WriteLine($"User found but no candidate profile. Creating candidate profile for user: {user.Username}");
                    // Auto-create candidate profile
                    candidate = new CandidateProfile
                    {
                        FullName = user.Username,
                        Email = user.Email,
                        PhoneNumber = "",
                        Address = "",
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        UserId = user.UserId
                    };
                    _context.CandidateProfiles.Add(candidate);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Created candidate profile with ID: {candidate.CandidateID}");
                }
                else
                {
                    return BadRequest(new { message = "Candidate profile not found. Please complete your profile first." });
                }
            }

            // Set CandidateID
            app.CandidateID = candidate.CandidateID;
            Console.WriteLine($"Using CandidateID: {app.CandidateID}");

            // Check if job exists and is active
            Console.WriteLine($"Looking for job with ID: {app.JobID}");
            var job = await _context.Jobs.FindAsync(app.JobID);
            if (job == null)
            {
                Console.WriteLine($"Job not found with ID: {app.JobID}");
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

            Console.WriteLine($"About to save application: JobID={app.JobID}, CandidateID={app.CandidateID}, Status={app.Status}");
            _context.Applications.Add(app);
            await _context.SaveChangesAsync();
            Console.WriteLine($"Application saved successfully with ID: {app.ApplicationID}");

            return Ok(new {
                success = true,
                message = "Application submitted successfully",
                applicationId = app.ApplicationID
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating application: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { success = false, message = "Error submitting application", error = ex.Message });
        }
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
            var oldStatus = existingApp.Status;
            _context.Entry(app).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            // Log activity
            var activityLog = new ActivityLog
            {
                UserID = recruiter.UserId,
                ActivityType = "Status Update",
                EntityType = "Application",
                Description = $"Updated application status from {oldStatus} to {app.Status} for job {existingApp.Job?.Title}",
                CreatedDate = DateTime.Now,
                EntityID = id
            };
            _context.ActivityLogs.Add(activityLog);
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

            // Log activity
            var activityLog = new ActivityLog
            {
                UserID = candidate.UserId,
                ActivityType = "Profile Update",
                EntityType = "Application",
                Description = $"Updated cover letter or resume for application to job {existingApp.Job?.Title}",
                CreatedDate = DateTime.Now,
                EntityID = id
            };
            _context.ActivityLogs.Add(activityLog);
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
