using System;
using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class Job
    {
        [Key]
        public int JobID { get; set; }
        public int CompanyID { get; set; }
        public int RecruiterID { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string SalaryRange { get; set; } = string.Empty;
        public bool RemoteAllowed { get; set; }
        public string EmploymentType { get; set; } = string.Empty;
        public DateTime PostedDate { get; set; }
        public DateTime ClosingDate { get; set; }
        public string Skills { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;

        public Company? Company { get; set; }
        public Recruiter? Recruiter { get; set; }


    
    }
}
