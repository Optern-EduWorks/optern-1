using System;
using System.ComponentModel.DataAnnotations;

namespace JobPortalAPI.Models
{
    public class CandidateCertification
    {
        [Key]
        public int CandidateCertificationID { get; set; }
        public int CandidateID { get; set; }
        public int CertificationID { get; set; } 
        public string Name { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public DateTime Obtained { get; set; }
        public DateTime? Expiry { get; set; }
        public string CredentialUrl { get; set; } = string.Empty;

        public CandidateProfile? Candidate { get; set; }
    }
}
