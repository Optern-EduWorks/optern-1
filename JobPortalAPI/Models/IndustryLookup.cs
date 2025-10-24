using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class IndustryLookup
    {
        [Key]
        public int IndustryID { get; set; }
        public string IndustryName { get; set; } = string.Empty;
    }
}
