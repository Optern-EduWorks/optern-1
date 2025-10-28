using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class StatusLookup
    {
        [Key]
        public int StatusID { get; set; }
        public string StatusName { get; set; } = string.Empty;
    }
}
