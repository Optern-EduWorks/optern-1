using System;
using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class Application
    {
        [Key]
        public int ApplicationID { get; set; }
        public int JobID { get; set; }
        public int CandidateID { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime AppliedDate { get; set; }
        public string CoverLetter { get; set; } = string.Empty;
        public string ResumeUrl { get; set; } = string.Empty;
        public string InterviewStatus { get; set; } = string.Empty;

        public Job? Job { get; set; }
        public CandidateProfile? Candidate { get; set; }
    }
}
