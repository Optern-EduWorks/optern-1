using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class Company
    {
        [Key]
        public int CompanyID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Website { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public int IndustryID { get; set; }

        public IndustryLookup Industry { get; set; } = null!;

        public ICollection<Recruiter> Recruiters { get; set; } = new List<Recruiter>();

        public ICollection<Job> Jobs { get; set; } = new List<Job>();
    }
}
