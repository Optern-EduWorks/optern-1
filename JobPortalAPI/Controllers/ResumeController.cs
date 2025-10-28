using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;
using System.Security.Claims;

namespace JobPortalAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResumeController : ControllerBase
    {
        private readonly JobPortalContext _context;

        public ResumeController(JobPortalContext context)
        {
            _context = context;
        }

        // GET: api/Resume
        [HttpGet]
        public async Task<ActionResult<Resume>> GetResume()
        {
            var userIdClaim = User.FindFirst("UserId");
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim.Value);
            var resume = await _context.Resumes
                .Include(r => r.Educations)
                .Include(r => r.Experiences)
                .Include(r => r.Skills)
                .Include(r => r.Projects)
                .Include(r => r.Certifications)
                .FirstOrDefaultAsync(r => r.UserId == userId);

            if (resume == null)
            {
                return NotFound();
            }

            return resume;
        }

        // POST: api/Resume
        [HttpPost]
        public async Task<ActionResult<Resume>> CreateResume(ResumeCreateDto resumeDto)
        {
            try
            {
                Console.WriteLine($"Resume CreateResume called with data: {System.Text.Json.JsonSerializer.Serialize(resumeDto)}");

                var userIdClaim = User.FindFirst("UserId");
                if (userIdClaim == null)
                {
                    Console.WriteLine("UserId claim not found");
                    return Unauthorized();
                }

                var userId = int.Parse(userIdClaim.Value);
                Console.WriteLine($"Creating resume for user ID: {userId}");

                // Check if user already has a resume
                var existingResume = await _context.Resumes.FirstOrDefaultAsync(r => r.UserId == userId);
                if (existingResume != null)
                {
                    return BadRequest("User already has a resume. Use PUT to update.");
                }

                var resume = new Resume
                {
                    UserId = userId,
                    FullName = resumeDto.FullName,
                    Email = resumeDto.Email,
                    PhoneNumber = resumeDto.PhoneNumber,
                    LinkedInProfile = resumeDto.LinkedInProfile,
                    Address = resumeDto.Address,
                    ProfessionalObjective = resumeDto.ProfessionalObjective,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Resumes.Add(resume);
                await _context.SaveChangesAsync();

                // Return early if resume creation failed
                if (resume.Id == 0)
                {
                    Console.WriteLine("Resume creation failed - no ID generated");
                    return StatusCode(500, new { message = "Failed to create resume record" });
                }

                // Add education entries
                foreach (var educationDto in resumeDto.Educations)
                {
                    var education = new ResumeEducation
                    {
                        ResumeId = resume.Id,
                        Institution = educationDto.Institution,
                        Degree = educationDto.Degree,
                        GraduationYear = educationDto.GraduationYear,
                        GPA = educationDto.GPA
                    };
                    _context.ResumeEducations.Add(education);
                }

                // Add experience entries
                foreach (var experienceDto in resumeDto.Experiences)
                {
                    var experience = new ResumeExperience
                    {
                        ResumeId = resume.Id,
                        Company = experienceDto.Company,
                        Position = experienceDto.Position,
                        Duration = experienceDto.Duration,
                        Description = experienceDto.Description
                    };
                    _context.ResumeExperiences.Add(experience);
                }

                // Add skills
                foreach (var skillName in resumeDto.TechnicalSkills)
                {
                    var skill = new ResumeSkill
                    {
                        ResumeId = resume.Id,
                        SkillName = skillName,
                        SkillType = "Technical"
                    };
                    _context.ResumeSkills.Add(skill);
                }

                foreach (var skillName in resumeDto.SoftSkills)
                {
                    var skill = new ResumeSkill
                    {
                        ResumeId = resume.Id,
                        SkillName = skillName,
                        SkillType = "Soft"
                    };
                    _context.ResumeSkills.Add(skill);
                }

                // Add projects
                foreach (var projectDto in resumeDto.Projects)
                {
                    var project = new ResumeProject
                    {
                        ResumeId = resume.Id,
                        ProjectTitle = projectDto.ProjectTitle,
                        Technologies = projectDto.Technologies,
                        ProjectLink = projectDto.ProjectLink,
                        Description = projectDto.Description
                    };
                    _context.ResumeProjects.Add(project);
                }

                // Add certifications
                foreach (var certificationDto in resumeDto.Certifications)
                {
                    // Handle date parsing for frontend compatibility
                    DateTime issueDate;
                    DateTime? expiryDate = null;

                    try
                    {
                        // Try to parse the date string from frontend
                        if (DateTime.TryParse(certificationDto.IssueDate.ToString(), out issueDate))
                        {
                            // Successfully parsed
                        }
                        else
                        {
                            // If parsing fails, use current date as fallback
                            issueDate = DateTime.UtcNow;
                            Console.WriteLine($"Warning: Could not parse IssueDate '{certificationDto.IssueDate}', using current date");
                        }

                        if (certificationDto.ExpiryDate.HasValue && DateTime.TryParse(certificationDto.ExpiryDate.Value.ToString(), out DateTime parsedExpiryDate))
                        {
                            expiryDate = parsedExpiryDate;
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error parsing certification dates: {ex.Message}");
                        issueDate = DateTime.UtcNow;
                    }

                    var certification = new ResumeCertification
                    {
                        ResumeId = resume.Id,
                        CertificationName = certificationDto.CertificationName,
                        IssuingOrganization = certificationDto.IssuingOrganization,
                        IssueDate = issueDate,
                        ExpiryDate = expiryDate
                    };
                    _context.ResumeCertifications.Add(certification);
                }

                await _context.SaveChangesAsync();

                var createdResume = await _context.Resumes
                    .Include(r => r.Educations)
                    .Include(r => r.Experiences)
                    .Include(r => r.Skills)
                    .Include(r => r.Projects)
                    .Include(r => r.Certifications)
                    .FirstOrDefaultAsync(r => r.Id == resume.Id);

                return CreatedAtAction(nameof(GetResume), createdResume);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating resume: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error creating resume", error = ex.Message });
            }
        }

        // PUT: api/Resume
        [HttpPut]
        public async Task<IActionResult> UpdateResume(ResumeUpdateDto resumeDto)
        {
            try
            {
                Console.WriteLine($"Resume UpdateResume called with data: {System.Text.Json.JsonSerializer.Serialize(resumeDto)}");

                var userIdClaim = User.FindFirst("UserId");
                if (userIdClaim == null)
                {
                    Console.WriteLine("UserId claim not found");
                    return Unauthorized();
                }

                var userId = int.Parse(userIdClaim.Value);
                Console.WriteLine($"Updating resume for user ID: {userId}");

                var resume = await _context.Resumes
                    .Include(r => r.Educations)
                    .Include(r => r.Experiences)
                    .Include(r => r.Skills)
                    .Include(r => r.Projects)
                    .Include(r => r.Certifications)
                    .FirstOrDefaultAsync(r => r.UserId == userId);

                if (resume == null)
                {
                    return NotFound();
                }

                // Update basic information
                if (resumeDto.FullName != null) resume.FullName = resumeDto.FullName;
                if (resumeDto.Email != null) resume.Email = resumeDto.Email;
                if (resumeDto.PhoneNumber != null) resume.PhoneNumber = resumeDto.PhoneNumber;
                if (resumeDto.LinkedInProfile != null) resume.LinkedInProfile = resumeDto.LinkedInProfile;
                if (resumeDto.Address != null) resume.Address = resumeDto.Address;
                if (resumeDto.ProfessionalObjective != null) resume.ProfessionalObjective = resumeDto.ProfessionalObjective;

                resume.UpdatedAt = DateTime.UtcNow;

                // Update education entries
                if (resumeDto.Educations != null && resumeDto.Educations.Any())
                {
                    _context.ResumeEducations.RemoveRange(resume.Educations);
                    foreach (var educationDto in resumeDto.Educations)
                    {
                        var education = new ResumeEducation
                        {
                            ResumeId = resume.Id,
                            Institution = educationDto.Institution,
                            Degree = educationDto.Degree,
                            GraduationYear = educationDto.GraduationYear,
                            GPA = educationDto.GPA
                        };
                        _context.ResumeEducations.Add(education);
                    }
                }

                // Update experience entries
                if (resumeDto.Experiences != null && resumeDto.Experiences.Any())
                {
                    _context.ResumeExperiences.RemoveRange(resume.Experiences);
                    foreach (var experienceDto in resumeDto.Experiences)
                    {
                        var experience = new ResumeExperience
                        {
                            ResumeId = resume.Id,
                            Company = experienceDto.Company,
                            Position = experienceDto.Position,
                            Duration = experienceDto.Duration,
                            Description = experienceDto.Description
                        };
                        _context.ResumeExperiences.Add(experience);
                    }
                }

                // Update skills
                if ((resumeDto.TechnicalSkills != null && resumeDto.TechnicalSkills.Any()) ||
                    (resumeDto.SoftSkills != null && resumeDto.SoftSkills.Any()))
                {
                    _context.ResumeSkills.RemoveRange(resume.Skills);

                    if (resumeDto.TechnicalSkills != null)
                    {
                        foreach (var skillName in resumeDto.TechnicalSkills)
                        {
                            var skill = new ResumeSkill
                            {
                                ResumeId = resume.Id,
                                SkillName = skillName,
                                SkillType = "Technical"
                            };
                            _context.ResumeSkills.Add(skill);
                        }
                    }

                    if (resumeDto.SoftSkills != null)
                    {
                        foreach (var skillName in resumeDto.SoftSkills)
                        {
                            var skill = new ResumeSkill
                            {
                                ResumeId = resume.Id,
                                SkillName = skillName,
                                SkillType = "Soft"
                            };
                            _context.ResumeSkills.Add(skill);
                        }
                    }
                }

                // Update projects
                if (resumeDto.Projects != null && resumeDto.Projects.Any())
                {
                    _context.ResumeProjects.RemoveRange(resume.Projects);
                    foreach (var projectDto in resumeDto.Projects)
                    {
                        var project = new ResumeProject
                        {
                            ResumeId = resume.Id,
                            ProjectTitle = projectDto.ProjectTitle,
                            Technologies = projectDto.Technologies,
                            ProjectLink = projectDto.ProjectLink,
                            Description = projectDto.Description
                        };
                        _context.ResumeProjects.Add(project);
                    }
                }

                // Update certifications
                if (resumeDto.Certifications != null && resumeDto.Certifications.Any())
                {
                    _context.ResumeCertifications.RemoveRange(resume.Certifications);
                    foreach (var certificationDto in resumeDto.Certifications)
                    {
                        // Handle date parsing for frontend compatibility
                        DateTime issueDate;
                        DateTime? expiryDate = null;

                        try
                        {
                            // Try to parse the date string from frontend
                            if (DateTime.TryParse(certificationDto.IssueDate.ToString(), out issueDate))
                            {
                                // Successfully parsed
                            }
                            else
                            {
                                // If parsing fails, use current date as fallback
                                issueDate = DateTime.UtcNow;
                                Console.WriteLine($"Warning: Could not parse IssueDate '{certificationDto.IssueDate}', using current date");
                            }

                            if (certificationDto.ExpiryDate.HasValue && DateTime.TryParse(certificationDto.ExpiryDate.Value.ToString(), out DateTime parsedExpiryDate))
                            {
                                expiryDate = parsedExpiryDate;
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error parsing certification dates: {ex.Message}");
                            issueDate = DateTime.UtcNow;
                        }

                        var certification = new ResumeCertification
                        {
                            ResumeId = resume.Id,
                            CertificationName = certificationDto.CertificationName,
                            IssuingOrganization = certificationDto.IssuingOrganization,
                            IssueDate = issueDate,
                            ExpiryDate = expiryDate
                        };
                        _context.ResumeCertifications.Add(certification);
                    }
                }

                await _context.SaveChangesAsync();

                var updatedResume = await _context.Resumes
                    .Include(r => r.Educations)
                    .Include(r => r.Experiences)
                    .Include(r => r.Skills)
                    .Include(r => r.Projects)
                    .Include(r => r.Certifications)
                    .FirstOrDefaultAsync(r => r.Id == resume.Id);

                return Ok(updatedResume);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating resume: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error updating resume", error = ex.Message });
            }
        }

        // DELETE: api/Resume
        [HttpDelete]
        public async Task<IActionResult> DeleteResume()
        {
            var userIdClaim = User.FindFirst("UserId");
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdClaim.Value);
            var resume = await _context.Resumes.FirstOrDefaultAsync(r => r.UserId == userId);

            if (resume == null)
            {
                return NotFound();
            }

            _context.Resumes.Remove(resume);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
