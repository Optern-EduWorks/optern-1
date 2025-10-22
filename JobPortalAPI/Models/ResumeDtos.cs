using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class ResumeCreateDto
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [StringLength(20)]
        public string PhoneNumber { get; set; }

        [Url]
        [StringLength(200)]
        public string LinkedInProfile { get; set; }

        [StringLength(500)]
        public string Address { get; set; }

        [StringLength(1000)]
        public string ProfessionalObjective { get; set; }

        public List<ResumeEducationCreateDto> Educations { get; set; } = new();
        public List<ResumeExperienceCreateDto> Experiences { get; set; } = new();
        public List<string> TechnicalSkills { get; set; } = new();
        public List<string> SoftSkills { get; set; } = new();
        public List<ResumeProjectCreateDto> Projects { get; set; } = new();
        public List<ResumeCertificationCreateDto> Certifications { get; set; } = new();
    }

    public class ResumeUpdateDto
    {
        [StringLength(100)]
        public string FullName { get; set; }

        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [StringLength(20)]
        public string PhoneNumber { get; set; }

        [Url]
        [StringLength(200)]
        public string LinkedInProfile { get; set; }

        [StringLength(500)]
        public string Address { get; set; }

        [StringLength(1000)]
        public string ProfessionalObjective { get; set; }

        public List<ResumeEducationCreateDto> Educations { get; set; } = new();
        public List<ResumeExperienceCreateDto> Experiences { get; set; } = new();
        public List<string> TechnicalSkills { get; set; } = new();
        public List<string> SoftSkills { get; set; } = new();
        public List<ResumeProjectCreateDto> Projects { get; set; } = new();
        public List<ResumeCertificationCreateDto> Certifications { get; set; } = new();
    }

    public class ResumeEducationCreateDto
    {
        [Required]
        [StringLength(200)]
        public string Institution { get; set; }

        [Required]
        [StringLength(200)]
        public string Degree { get; set; }

        [StringLength(10)]
        public string GraduationYear { get; set; }

        [StringLength(10)]
        public string GPA { get; set; }
    }

    public class ResumeExperienceCreateDto
    {
        [Required]
        [StringLength(200)]
        public string Company { get; set; }

        [Required]
        [StringLength(100)]
        public string Position { get; set; }

        [Required]
        [StringLength(100)]
        public string Duration { get; set; }

        [Required]
        [StringLength(2000)]
        public string Description { get; set; }
    }

    public class ResumeProjectCreateDto
    {
        [Required]
        [StringLength(200)]
        public string ProjectTitle { get; set; }

        [StringLength(500)]
        public string Technologies { get; set; }

        [Url]
        [StringLength(200)]
        public string ProjectLink { get; set; }

        [Required]
        [StringLength(2000)]
        public string Description { get; set; }
    }

    public class ResumeCertificationCreateDto
    {
        [Required]
        [StringLength(200)]
        public string CertificationName { get; set; }

        [Required]
        [StringLength(200)]
        public string IssuingOrganization { get; set; }

        [Required]
        public DateTime IssueDate { get; set; }

        public DateTime? ExpiryDate { get; set; }
    }
}
