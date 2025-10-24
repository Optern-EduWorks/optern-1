using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class LocationTypeLookup
    {
        [Key]
        public int LocationTypeID { get; set; }
        public string LocationTypeName { get; set; } = string.Empty;
    }
}
