using System;
using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class Greivance
    {
        [Key]
        public int GreivanceID { get; set; }
        public int SubmittedBy { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public string Priority { get; set; } = string.Empty;

        public User? Submitter { get; set; }
    }
}
