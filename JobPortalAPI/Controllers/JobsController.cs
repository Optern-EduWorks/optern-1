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
    public async Task<ActionResult<IEnumerable<Job>>> GetAll()
    {
        Console.WriteLine("JobsController - GetAll called");
        Console.WriteLine($"Request path: {HttpContext.Request.Path}");
        Console.WriteLine($"Request method: {HttpContext.Request.Method}");
        
        // Include company and recruiter details, show all jobs
        var jobs = await _context.Jobs
            .Include(j => j.Company)
            .Include(j => j.Recruiter)
            .OrderByDescending(j => j.PostedDate)
            .ToListAsync();

        Console.WriteLine($"Found {jobs.Count} jobs");
        return jobs;
    }

    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<Job>>> GetAllJobs() =>
        await _context.Jobs.Include(j => j.Company).Include(j => j.Recruiter).ToListAsync();

    [HttpGet("by-recruiter")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<Job>>> GetByRecruiter()
    {
        Console.WriteLine("JobsController - GetByRecruiter called");
        Console.WriteLine($"Request path: {HttpContext.Request.Path}");
        Console.WriteLine($"Request method: {HttpContext.Request.Method}");
        Console.WriteLine($"Request headers: {string.Join(", ", HttpContext.Request.Headers.Select(h => $"{h.Key}={h.Value}").ToList())}");
        
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        Console.WriteLine($"Looking for recruiter with email: {emailClaim.Value}");
        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.Email == emailClaim.Value);
        
        // Log all recruiters in database for debugging
        var allRecruiters = await _context.Recruiters.ToListAsync();
        Console.WriteLine($"Total recruiters in database: {allRecruiters.Count}");
        Console.WriteLine("All recruiters:");
        foreach (var r in allRecruiters)
        {
            Console.WriteLine($"RecruiterID: {r.RecruiterID}, Email: {r.Email}, CompanyID: {r.CompanyID}");
        }

        if (recruiter == null)
        {
            Console.WriteLine("No recruiter profile found, creating one");
            // Auto-create recruiter profile
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailClaim.Value && u.Role == "recruiter");
            if (user == null)
            {
                Console.WriteLine($"User not found or not a recruiter: {emailClaim.Value}");
                return Unauthorized(new { message = "User is not a recruiter", email = emailClaim.Value });
            }

            // Get first available company or create one
            var company = await _context.Companies.FirstOrDefaultAsync();
            if (company == null)
            {
                // Get or create default industry
                var industry = await _context.Set<IndustryLookup>().FirstOrDefaultAsync();
                if (industry == null)
                {
                    industry = new IndustryLookup { IndustryName = "Technology" };
                    _context.Set<IndustryLookup>().Add(industry);
                    await _context.SaveChangesAsync();
                }

                // Create a default company
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
        }

        // First check if any jobs exist at all
        var allJobs = await _context.Jobs.ToListAsync();
        Console.WriteLine($"Total jobs in database: {allJobs.Count}");
        if (allJobs.Any())
        {
            Console.WriteLine("Sample job IDs in database:");
            foreach (var job in allJobs.Take(5))
            {
                Console.WriteLine($"JobID: {job.JobID}, RecruiterID: {job.RecruiterID}, Title: {job.Title}");
            }
        }

        // Now get jobs for this recruiter
        Console.WriteLine($"Looking for jobs with RecruiterID: {recruiter.RecruiterID}");
        var query = _context.Jobs
            .Include(j => j.Company)
            .Include(j => j.Recruiter)
            .Where(j => j.RecruiterID == recruiter.RecruiterID)
            .OrderByDescending(j => j.PostedDate);

        Console.WriteLine($"Generated SQL: {query.ToQueryString()}");
        var jobs = await query.ToListAsync();

        Console.WriteLine($"Found {jobs.Count} jobs for recruiter {recruiter.Email}");

        // Log the found jobs
        if (jobs.Any())
        {
            Console.WriteLine("Found jobs:");
            foreach (var job in jobs)
            {
                Console.WriteLine($"JobID: {job.JobID}, Title: {job.Title}, Company: {job.Company?.Name}");
            }

            // Convert to DTOs to avoid circular references
            var jobDtos = jobs.Select(job => new
            {
                jobID = job.JobID,
                title = job.Title,
                company = job.Company?.Name ?? "Unknown Company",
                location = job.Location,
                salary = job.SalaryRange,
                remote = job.RemoteAllowed,
                type = job.EmploymentType,
                applicants = 0, // Default value since we don't have applications table relationship
                skills = job.Skills ?? "",
                description = job.Description,
                rating = 4.5, // Default rating
                posted = job.PostedDate.ToString("yyyy-MM-dd"),
                logo = "https://i.imgur.com/2JV8V4A.png", // Default logo
                priority = "medium priority",
                status = "active",
                icon = job.Title?.Substring(0, 1).ToUpper() ?? "J",
                workMode = job.RemoteAllowed ? "Remote" : "Onsite",
                tags = string.IsNullOrEmpty(job.Skills) ? new[] { new { label = "General", color = "blue" } } : job.Skills.Split(',').Select(s => new { label = s.Trim(), color = "blue" }),
                requirements = new string[] { },
                benefits = new string[] { }
            });

            return Ok(new { success = true, jobs = jobDtos, count = jobs.Count });
        }
        else
        {
            Console.WriteLine("No jobs found for this recruiter");
            return Ok(new { success = true, jobs = new List<object>(), count = 0 });
        }
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
        Console.WriteLine("JobsController - Create called");
        Console.WriteLine($"Request path: {HttpContext.Request.Path}");
        Console.WriteLine($"Request method: {HttpContext.Request.Method}");
        Console.WriteLine($"Request headers: {string.Join(", ", HttpContext.Request.Headers.Select(h => $"{h.Key}={h.Value}"))}");
        Console.WriteLine($"Job data received: {System.Text.Json.JsonSerializer.Serialize(job)}");

        // Get user email from authenticated user
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        // Check if user is a recruiter
        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.Email == emailClaim.Value);
        
        // If not a recruiter, create a temporary recruiter profile
        if (recruiter == null)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == emailClaim.Value);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            // Get first available company or create one
            var company = await _context.Companies.FirstOrDefaultAsync();
            if (company == null)
            {
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

            recruiter = new Recruiter
            {
                FullName = user.Username,
                Email = user.Email,
                JobTitle = "User",
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now,
                CompanyID = company.CompanyID
            };

            _context.Recruiters.Add(recruiter);
            await _context.SaveChangesAsync();
        }

        // Set RecruiterID
        job.RecruiterID = recruiter.RecruiterID;

        // Set CompanyID from recruiter's company if not provided
        if (job.CompanyID == 0)
        {
            var recruiterCompany = await _context.Companies.FindAsync(recruiter.CompanyID);
            if (recruiterCompany != null)
            {
                job.CompanyID = recruiterCompany.CompanyID;
                Console.WriteLine($"Using recruiter's company: {recruiterCompany.Name} (ID: {recruiterCompany.CompanyID})");
            }
            else
            {
                return BadRequest(new { message = "Recruiter's company not found" });
            }
        }

        // Set default dates if not provided
        job.PostedDate = DateTime.Now;
        if (job.ClosingDate == default)
        {
            job.ClosingDate = DateTime.Now.AddDays(30);
        }

        try
        {
            Console.WriteLine($"About to save job: Title={job.Title}, RecruiterID={job.RecruiterID}, CompanyID={job.CompanyID}");
            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();
            Console.WriteLine($"Job saved successfully with ID: {job.JobID}");

            // Verify the job was saved
            var savedJob = await _context.Jobs
                .Include(j => j.Company)
                .Include(j => j.Recruiter)
                .FirstOrDefaultAsync(j => j.JobID == job.JobID);

            if (savedJob != null)
            {
                Console.WriteLine($"Job verified in database: ID={savedJob.JobID}, Title={savedJob.Title}, RecruiterID={savedJob.RecruiterID}, CompanyID={savedJob.CompanyID}");

                // Return the actual job data instead of hardcoded values
                var jobDto = new
                {
                    jobID = savedJob.JobID,
                    title = savedJob.Title,
                    company = savedJob.Company?.Name ?? "Unknown Company",
                    location = savedJob.Location,
                    salary = savedJob.SalaryRange,
                    remote = savedJob.RemoteAllowed,
                    type = savedJob.EmploymentType,
                    applicants = 0, // Keep as 0 since no applications yet
                    skills = savedJob.Skills ?? "",
                    description = savedJob.Description,
                    rating = 4.5, // Default rating for new jobs
                    posted = savedJob.PostedDate.ToString("yyyy-MM-dd"),
                    logo = "https://i.imgur.com/2JV8V4A.png", // Default logo
                    priority = "medium priority", // Default priority
                    status = "active", // New jobs are active by default
                    icon = savedJob.Title?.Substring(0, 1).ToUpper() ?? "J",
                    workMode = savedJob.RemoteAllowed ? "Remote" : "Onsite",
                    tags = string.IsNullOrEmpty(savedJob.Skills) ? new[] { new { label = "General", color = "blue" } } : savedJob.Skills.Split(',').Select(s => new { label = s.Trim(), color = "blue" }),
                    requirements = string.IsNullOrEmpty(savedJob.Description) ? new string[] { } : new[] { savedJob.Description }, // Use description as requirements if available
                    benefits = new string[] { } // Empty for now, can be enhanced later
                };

                Console.WriteLine($"Returning job DTO: {System.Text.Json.JsonSerializer.Serialize(jobDto)}");

                return Ok(new {
                    success = true,
                    message = "Job created successfully",
                    job = jobDto,
                    jobId = savedJob.JobID
                });
            }
            else
            {
                Console.WriteLine("Warning: Job was not found in database after saving!");
                return BadRequest(new { success = false, message = "Job was saved but could not be verified" });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saving job: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { success = false, message = "Error creating job", error = ex.Message });
        }
    }

    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok(new { message = "API is working", timestamp = DateTime.Now });
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
