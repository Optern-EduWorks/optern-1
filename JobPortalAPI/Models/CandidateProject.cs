using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class CandidateProject
    {
        [Key]
        public int ProjectID { get; set; }
        public int CandidateID { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Technologies { get; set; } = string.Empty;
        public string ProjectUrl { get; set; } = string.Empty;

        public CandidateProfile? Candidate { get; set; }
    }
}
