using System;
using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class CandidateExperience
    {
        [Key]
        public int ExperienceID { get; set; }
        public int CandidateID { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Responsibilities { get; set; } = string.Empty;
        public bool IsCurrent { get; set; }

        public CandidateProfile? Candidate { get; set; }
    }
}
