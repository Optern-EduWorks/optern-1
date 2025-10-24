using System;
using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string VerificationStatus { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
