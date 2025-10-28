using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class Resume
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        public User User { get; set; }

        // Personal Information
        [Required]
        [StringLength(100)]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        [StringLength(20)]
        public string PhoneNumber { get; set; }

        [Url]
        [StringLength(200)]
        public string LinkedInProfile { get; set; }

        [StringLength(500)]
        public string Address { get; set; }

        [StringLength(1000)]
        public string ProfessionalObjective { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<ResumeEducation> Educations { get; set; }
        public ICollection<ResumeExperience> Experiences { get; set; }
        public ICollection<ResumeSkill> Skills { get; set; }
        public ICollection<ResumeProject> Projects { get; set; }
        public ICollection<ResumeCertification> Certifications { get; set; }
    }

    public class ResumeEducation
    {
        public int Id { get; set; }

        [Required]
        public int ResumeId { get; set; }

        public Resume Resume { get; set; }

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

        public int OrderIndex { get; set; } = 0;
    }

    public class ResumeExperience
    {
        public int Id { get; set; }

        [Required]
        public int ResumeId { get; set; }

        public Resume Resume { get; set; }

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

        public int OrderIndex { get; set; } = 0;
    }

    public class ResumeSkill
    {
        public int Id { get; set; }

        [Required]
        public int ResumeId { get; set; }

        public Resume Resume { get; set; }

        [Required]
        [StringLength(100)]
        public string SkillName { get; set; }

        [StringLength(50)]
        public string SkillType { get; set; } // "Technical" or "Soft"

        public int OrderIndex { get; set; } = 0;
    }

    public class ResumeProject
    {
        public int Id { get; set; }

        [Required]
        public int ResumeId { get; set; }

        public Resume Resume { get; set; }

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

        public int OrderIndex { get; set; } = 0;
    }

    public class ResumeCertification
    {
        public int Id { get; set; }

        [Required]
        public int ResumeId { get; set; }

        public Resume Resume { get; set; }

        [Required]
        [StringLength(200)]
        public string CertificationName { get; set; }

        [Required]
        [StringLength(200)]
        public string IssuingOrganization { get; set; }

        [Required]
        public DateTime IssueDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public int OrderIndex { get; set; } = 0;
    }
}
