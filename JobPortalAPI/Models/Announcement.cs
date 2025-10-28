using System;
using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class Announcement
    {
        [Key]
        public int AnnouncementID { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public bool IsPinned { get; set; }
        public int CreatedBy { get; set; }
        public DateTime ExpiryDate { get; set; }

        public User? Creator { get; set; }
    }
}
