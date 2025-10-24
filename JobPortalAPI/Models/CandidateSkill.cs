using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class CandidateSkill
    {
        [Key]
        public int SkillID { get; set; }
        public int CandidateID { get; set; }
        public string SkillName { get; set; } = string.Empty;
        public string ProficiencyLevel { get; set; } = string.Empty;
        public string SkillType { get; set; } = string.Empty;

        public CandidateProfile? Candidate { get; set; }

    }
}
