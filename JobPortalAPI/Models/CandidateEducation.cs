using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class CandidateEducation
    {
        [Key]
        public int EducationID { get; set; }
        public int CandidateID { get; set; }
        public string Institution { get; set; } = string.Empty;
        public string Degree { get; set; } = string.Empty;
        public int GraduationYear { get; set; }
        public string Grade { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;

        public CandidateProfile? Candidate { get; set; }
    }
}
