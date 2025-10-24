using System;

namespace JobPortalAPI.Models
{
    public class DashboardStats
    {
        public int TotalOpportunities { get; set; }
        public int AppliedJobs { get; set; }
        public int ApprovedApplications { get; set; }
        public int InReviewApplications { get; set; }
        public int ActiveJobs { get; set; }
        public int TotalApplications { get; set; }
        public int HiresThisMonth { get; set; }
        public int ScheduledInterviews { get; set; }
    }

    public class ActivityItem
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? TimeAgo { get; set; }
        public string? Status { get; set; }
        public string? Icon { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AnnouncementItem
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Subtitle { get; set; }
        public string? TimeAgo { get; set; }
        public string? Type { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class JobPerformanceItem
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Location { get; set; }
        public string? Type { get; set; }
        public string? PostedDate { get; set; }
        public int ApplicationCount { get; set; }
    }

    public class ChartData
    {
        public string[]? Labels { get; set; }
        public int[]? ApplicationsData { get; set; }
        public int[]? InterviewsData { get; set; }
    }
}
