using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class InterviewStatusLookup
    {
        [Key]
        public int InterviewStatusID { get; set; }
        public string InterviewStatusName { get; set; } = string.Empty;
    }
}
