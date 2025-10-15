using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Models;

namespace JobPortalAPI.Data
{
    public class JobPortalContext : DbContext
    {
        public JobPortalContext(DbContextOptions<JobPortalContext> options)
            : base(options)
        { }

        // Lookup Tables
        public DbSet<StatusLookup> StatusLookups { get; set; }
        public DbSet<IndustryLookup> IndustryLookups { get; set; }
        public DbSet<JobTypeLookup> JobTypeLookups { get; set; }
        public DbSet<LocationTypeLookup> LocationTypeLookups { get; set; }
        public DbSet<InterviewStatusLookup> InterviewStatusLookups { get; set; }

        // Core Tables
        public DbSet<User> Users { get; set; }
        public DbSet<CandidateProfile> CandidateProfiles { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Recruiter> Recruiters { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<CandidateEducation> CandidateEducations { get; set; }
        public DbSet<CandidateExperience> CandidateExperiences { get; set; }
        public DbSet<CandidateSkill> CandidateSkills { get; set; }
        public DbSet<CandidateProject> CandidateProjects { get; set; }
        public DbSet<CandidateCertification> CandidateCertifications { get; set; }
        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<Grievance> Grievances { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Job>()
                .HasOne(j => j.Recruiter)
                .WithMany(r => r.Jobs)
                .HasForeignKey(j => j.RecruiterID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Job>()
                .HasOne(j => j.Company)
                .WithMany(c => c.Jobs)
                .HasForeignKey(j => j.CompanyID)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
