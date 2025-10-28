using System;
using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class Recruiter
    {
        [Key]
        public int RecruiterID { get; set; }
        public int CompanyID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public int UserId { get; set; }

        public Company? Company { get; set; } 
        public ICollection<Job> Jobs { get; set; } = new List<Job>();
    }
}
