using System;
using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class ActivityLog
    {
        [Key]
        public int ActivityID { get; set; }
        public int? UserID { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime? CreatedDate { get; set; }
        public int? EntityID { get; set; }

        public User? User { get; set; }
    }
}
