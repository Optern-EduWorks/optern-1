using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class SeedController : ControllerBase
{
    private readonly JobPortalContext _context;

    public SeedController(JobPortalContext context) => _context = context;

    [HttpPost("data")]
    public async Task<IActionResult> SeedData()
    {
        try
        {
            // Check if data already exists
            if (await _context.Companies.AnyAsync() || await _context.CandidateProfiles.AnyAsync())
            {
                return Ok("Data already exists");
            }

            // Create industry lookup first
            var industry = new IndustryLookup
            {
                IndustryName = "Technology"
            };
            _context.IndustryLookups.Add(industry);
            await _context.SaveChangesAsync();

            // Create test company
            var company = new Company
            {
                Name = "Tech Solutions Inc",
                Website = "https://techsolutions.com",
                Size = "51-200",
                Address = "123 Tech Street, Silicon Valley",
                Phone = "123-456-7890",
                CreatedDate = DateTime.UtcNow,
                IndustryID = industry.IndustryID
            };
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            // Create test users first
            var recruiterUser = new User
            {
                Role = "Recruiter",
                Username = "johnsmith",
                Email = "john@techsolutions.com",
                Status = "Active",
                PhoneNumber = "123-456-7890",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                VerificationStatus = "Verified",
                Password = "password123" // In real app, this would be hashed
            };
            _context.Users.Add(recruiterUser);
            await _context.SaveChangesAsync();

            var candidateUser = new User
            {
                Role = "Candidate",
                Username = "janedoe",
                Email = "jane.doe@email.com",
                Status = "Active",
                PhoneNumber = "987-654-3210",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                VerificationStatus = "Verified",
                Password = "password123" // In real app, this would be hashed
            };
            _context.Users.Add(candidateUser);
            await _context.SaveChangesAsync();

            // Create test recruiter with UserId
            var recruiter = new Recruiter
            {
                FullName = "John Smith",
                Email = "john@techsolutions.com",
                PhoneNumber = "123-456-7890",
                CompanyID = company.CompanyID,
                JobTitle = "Senior Recruiter",
                Bio = "Experienced HR professional",
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };
            _context.Recruiters.Add(recruiter);
            await _context.SaveChangesAsync();

            // Create test candidate with UserId
            var candidate = new CandidateProfile
            {
                FullName = "Jane Doe",
                Email = "jane.doe@email.com",
                PhoneNumber = "987-654-3210",
                Address = "123 Main St, City, State",
                DateOfBirth = new DateTime(1990, 1, 1),
                Gender = "Female",
                Status = "Active",
                GraduationYear = 2020,
                College = "University of Technology",
                Course = "Computer Science",
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };
            _context.CandidateProfiles.Add(candidate);
            await _context.SaveChangesAsync();

            // Create test job
            var job = new Job
            {
                Title = "Software Developer",
                CompanyID = company.CompanyID,
                RecruiterID = recruiter.RecruiterID,
                Description = "We are looking for a skilled software developer to join our team.",
                Location = "New York, NY",
                SalaryRange = "$80,000 - $120,000",
                EmploymentType = "Full-time",
                Skills = "JavaScript, React, Node.js",
                PostedDate = DateTime.UtcNow,
                ClosingDate = DateTime.UtcNow.AddDays(30),
                RemoteAllowed = true,
                Category = "Technology"
            };
            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Test data created successfully",
                CompanyId = company.CompanyID,
                RecruiterId = recruiter.RecruiterID,
                CandidateId = candidate.CandidateID,
                JobId = job.JobID,
                RecruiterUserId = recruiterUser.UserId,
                CandidateUserId = candidateUser.UserId
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error seeding data: {ex.Message}");
        }
    }
}
