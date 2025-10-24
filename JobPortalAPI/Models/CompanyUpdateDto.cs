using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class CompanyUpdateDto
    {
        [Required]
        public int CompanyID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Website { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }
}
