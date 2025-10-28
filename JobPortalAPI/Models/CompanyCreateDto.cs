using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class CompanyCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Website { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public int IndustryID { get; set; }
    }
}
