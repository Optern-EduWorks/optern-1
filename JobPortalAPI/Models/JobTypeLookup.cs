using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class JobTypeLookup
    {
        [Key]
        public int JobTypeID { get; set; }
        public string JobTypeName { get; set; } = string.Empty;
    }
}
