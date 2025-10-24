using System;
using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class CandidateProfile
    {
        [Key]
        public int CandidateID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string LinkedInProfile { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ResumeURL { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public int GraduationYear { get; set; }
        public string College { get; set; } = string.Empty;
        public string Course { get; set; } = string.Empty;
        public string CurrentSemester { get; set; } = string.Empty;
        public bool EmailNotifications { get; set; } = true;
        public bool JobApplicationUpdates { get; set; } = true;
        public bool InterviewReminders { get; set; } = true;
        public bool MarketingCommunications { get; set; } = false;
        public int UserId { get; set; }
        public ICollection<Application>? Applications { get; set; }
    }
}
