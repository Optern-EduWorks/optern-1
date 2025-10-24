using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobPortalAPI.Models
{
    public class Grievance
    {
        [Key]
        public int GreivanceID { get; set; }
        public int SubmittedBy { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public string Priority { get; set; } = string.Empty;

        // File attachment support
        public string? AttachmentFileName { get; set; }
        public string? AttachmentFilePath { get; set; }
        public long? AttachmentFileSize { get; set; }

        public User? Submitter { get; set; }
    }
}
