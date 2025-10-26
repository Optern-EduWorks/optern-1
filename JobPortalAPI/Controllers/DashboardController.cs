using JobPortalAPI.Data;
using JobPortalAPI.Hubs;
using JobPortalAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobPortalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly JobPortalContext _context;
        private readonly IHubContext<DashboardHub> _hubContext;

        public DashboardController(JobPortalContext context, IHubContext<DashboardHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // GET: api/dashboard/candidate-stats
        [HttpGet("candidate-stats")]
        public async Task<ActionResult<DashboardStats>> GetCandidateStats()
        {
            try
            {
                // Debug: Log all claims for troubleshooting
                Console.WriteLine("=== Dashboard Authentication Debug ===");
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"Claim: {claim.Type} = {claim.Value}");
                }

                // Get current user ID from JWT token
                var userIdClaim = User.FindFirst("UserId")?.Value;
                Console.WriteLine($"UserId claim found: {userIdClaim}");

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    Console.WriteLine("UserId claim not found or invalid");
                    return Unauthorized("Invalid user token");
                }

                Console.WriteLine($"Parsed userId: {userId}");

                // Debug: Log total jobs and their closing dates
                var allJobs = await _context.Jobs.ToListAsync();
                Console.WriteLine($"Total jobs in database: {allJobs.Count}");
                foreach (var job in allJobs.Take(5))
                {
                    Console.WriteLine($"Job {job.JobID}: {job.Title}, Closing: {job.ClosingDate}, IsFuture: {job.ClosingDate > DateTime.Now}");
                }

                var futureJobsCount = await _context.Jobs.CountAsync(j => j.ClosingDate > DateTime.Now);
                Console.WriteLine($"Jobs with future closing dates: {futureJobsCount}");

                // Check if candidate profile exists
                var candidate = await _context.CandidateProfiles.FirstOrDefaultAsync(c => c.UserId == userId);
                Console.WriteLine($"Found candidate profile: {candidate != null}, CandidateID: {candidate?.CandidateID}");

                if (candidate == null)
                {
                    Console.WriteLine($"No candidate profile found for userId: {userId}");
                    // Try to create candidate profile if it doesn't exist
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
                    if (user != null)
                    {
                        Console.WriteLine($"Creating candidate profile for user: {user.Email}");
                        candidate = new CandidateProfile
                        {
                            UserId = user.UserId,
                            FullName = user.Username,
                            Email = user.Email,
                            PhoneNumber = "",
                            Address = "",
                            CreatedDate = DateTime.Now,
                            UpdatedDate = DateTime.Now
                        };
                        _context.CandidateProfiles.Add(candidate);
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"Created candidate profile with ID: {candidate.CandidateID}");
                    }
                    else
                    {
                        Console.WriteLine($"User not found with ID: {userId}");
                        candidate = null;
                    }
                }

                var candidateId = candidate?.CandidateID ?? userId; // Fallback to userId if no profile found
                Console.WriteLine($"Using CandidateID: {candidateId}");

                var appliedJobsCount = await _context.Applications.CountAsync(a => a.CandidateID == candidateId);
                Console.WriteLine($"Applied jobs for candidate {candidateId}: {appliedJobsCount}");

                var stats = new DashboardStats
                {
                    TotalOpportunities = futureJobsCount,
                    AppliedJobs = appliedJobsCount,
                    ApprovedApplications = await _context.Applications.CountAsync(a => a.CandidateID == candidateId && a.Status == "Approved"),
                    InReviewApplications = await _context.Applications.CountAsync(a => a.CandidateID == candidateId && a.Status == "In Review"),
                    ActiveJobs = 0, // For candidates, this is not applicable
                    TotalApplications = appliedJobsCount,
                    HiresThisMonth = 0, // For candidates, this is not applicable
                    ScheduledInterviews = 0 // For candidates, this is not applicable
                };

                Console.WriteLine($"Dashboard stats for user {userId}: {System.Text.Json.JsonSerializer.Serialize(stats)}");

                // Broadcast stats update to candidate group
                await _hubContext.Clients.Group("candidate").SendAsync("ReceiveDashboardUpdate", "stats-update", new
                {
                    type = "candidate-stats",
                    userId = userId,
                    stats = stats
                });

                return Ok(stats);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetCandidateStats: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/dashboard/recruiter-stats
        [HttpGet("recruiter-stats")]
        public async Task<ActionResult<DashboardStats>> GetRecruiterStats()
        {
            try
            {
                // Get current user ID from JWT token
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized("Invalid user token");
                }

                var stats = new DashboardStats
                {
                    ActiveJobs = await _context.Jobs.CountAsync(j => j.RecruiterID == userId && j.ClosingDate > DateTime.Now),
                    TotalApplications = await _context.Applications.CountAsync(a => a.Job.RecruiterID == userId),
                    HiresThisMonth = await _context.Applications.CountAsync(a =>
                        a.Job.RecruiterID == userId &&
                        a.Status == "Hired" &&
                        a.AppliedDate.Month == DateTime.Now.Month &&
                        a.AppliedDate.Year == DateTime.Now.Year),
                    ScheduledInterviews = await _context.Applications.CountAsync(a =>
                        a.Job.RecruiterID == userId &&
                        a.Status == "Interview Scheduled")
                };

                // Broadcast stats update to recruiter group
                await _hubContext.Clients.Group("recruiter").SendAsync("ReceiveDashboardUpdate", "stats-update", new
                {
                    type = "recruiter-stats",
                    userId = userId,
                    stats = stats
                });

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/dashboard/candidate-activities
        [HttpGet("candidate-activities")]
        public async Task<ActionResult<IEnumerable<ActivityItem>>> GetCandidateActivities()
        {
            try
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                Console.WriteLine($"=== Candidate Activities Debug ===");
                Console.WriteLine($"UserId claim: {userIdClaim}");

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    Console.WriteLine("UserId claim not found or invalid");
                    return Unauthorized("Invalid user token");
                }

                Console.WriteLine($"Parsed userId: {userId}");

                // Check if candidate profile exists
                var candidate = await _context.CandidateProfiles.FirstOrDefaultAsync(c => c.UserId == userId);
                Console.WriteLine($"Found candidate profile: {candidate != null}, CandidateID: {candidate?.CandidateID}");

                if (candidate == null)
                {
                    Console.WriteLine($"No candidate profile found for userId: {userId}");
                    // Try to create candidate profile if it doesn't exist
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
                    if (user != null)
                    {
                        Console.WriteLine($"Creating candidate profile for user: {user.Email}");
                        candidate = new CandidateProfile
                        {
                            UserId = user.UserId,
                            FullName = user.Username,
                            Email = user.Email,
                            PhoneNumber = "",
                            Address = "",
                            CreatedDate = DateTime.Now,
                            UpdatedDate = DateTime.Now
                        };
                        _context.CandidateProfiles.Add(candidate);
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"Created candidate profile with ID: {candidate.CandidateID}");
                    }
                    else
                    {
                        Console.WriteLine($"User not found with ID: {userId}");
                        return Ok(new List<ActivityItem>()); // Return empty array instead of error
                    }
                }

                var activities = await _context.Applications
                    .Include(a => a.Job)
                    .ThenInclude(j => j.Company)
                    .Where(a => a.CandidateID == candidate.CandidateID)
                    .OrderByDescending(a => a.AppliedDate)
                    .Take(5)
                    .ToListAsync();

                // Convert to ActivityItem after database query to avoid EF issues
                var activityItems = activities.Select(a => new ActivityItem
                {
                    Id = a.ApplicationID,
                    Title = a.Job.Title,
                    Description = $"Applied to {a.Job.Company.Name}",
                    TimeAgo = GetTimeAgo(a.AppliedDate),
                    Status = a.Status,
                    Icon = "file-earmark-code",
                    CreatedAt = a.AppliedDate
                }).ToList();

                Console.WriteLine($"Found {activities.Count} activities for candidate {candidate.CandidateID}");
                return Ok(activities);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetCandidateActivities: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/dashboard/recruiter-activities
        [HttpGet("recruiter-activities")]
        public async Task<ActionResult<IEnumerable<ActivityItem>>> GetRecruiterActivities()
        {
            try
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized("Invalid user token");
                }

                var activities = await _context.Applications
                    .Include(a => a.Job)
                    .Include(a => a.Candidate)
                    .Where(a => a.Job.RecruiterID == userId)
                    .OrderByDescending(a => a.AppliedDate)
                    .Take(5)
                    .ToListAsync();

                // Convert to ActivityItem after database query to avoid EF issues
                var activityItems = activities.Select(a => new ActivityItem
                {
                    Id = a.ApplicationID,
                    Title = $"New application for {a.Job.Title}",
                    Description = $"{a.Candidate.FullName}",
                    TimeAgo = GetTimeAgo(a.AppliedDate),
                    Status = a.Status,
                    Icon = "file-earmark-code",
                    CreatedAt = a.AppliedDate
                }).ToList();

                return Ok(activities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/dashboard/debug-jobs
        [HttpGet("debug-jobs")]
        [AllowAnonymous] // Allow anonymous access for debugging
        public async Task<ActionResult<object>> DebugJobs()
        {
            try
            {
                var allJobs = await _context.Jobs.ToListAsync();
                var debugInfo = new
                {
                    totalJobs = allJobs.Count,
                    currentTime = DateTime.Now,
                    jobs = allJobs.Select(j => new
                    {
                        jobId = j.JobID,
                        title = j.Title,
                        closingDate = j.ClosingDate,
                        isFuture = j.ClosingDate > DateTime.Now,
                        postedDate = j.PostedDate,
                        recruiterId = j.RecruiterID
                    }).ToList()
                };

                Console.WriteLine($"Debug jobs: {System.Text.Json.JsonSerializer.Serialize(debugInfo)}");
                return Ok(debugInfo);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DebugJobs: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/dashboard/fix-job-dates
        [HttpPost("fix-job-dates")]
        [AllowAnonymous] // Allow anonymous access for debugging
        public async Task<ActionResult<object>> FixJobDates()
        {
            try
            {
                var allJobs = await _context.Jobs.ToListAsync();
                var updatedCount = 0;

                foreach (var job in allJobs)
                {
                    if (job.ClosingDate <= DateTime.Now)
                    {
                        job.ClosingDate = DateTime.Now.AddDays(30);
                        updatedCount++;
                    }
                }

                if (updatedCount > 0)
                {
                    await _context.SaveChangesAsync();
                }

                var debugInfo = new
                {
                    message = $"Updated {updatedCount} jobs with future closing dates",
                    totalJobs = allJobs.Count,
                    currentTime = DateTime.Now,
                    futureJobsCount = await _context.Jobs.CountAsync(j => j.ClosingDate > DateTime.Now)
                };

                Console.WriteLine($"Fixed job dates: {System.Text.Json.JsonSerializer.Serialize(debugInfo)}");
                return Ok(debugInfo);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in FixJobDates: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/dashboard/debug-user
        [HttpGet("debug-user")]
        [AllowAnonymous] // Allow anonymous access for debugging
        public async Task<ActionResult<object>> DebugUser()
        {
            try
            {
                var allUsers = await _context.Users.ToListAsync();
                var allCandidates = await _context.CandidateProfiles.ToListAsync();
                var allApplications = await _context.Applications.ToListAsync();

                var debugInfo = new
                {
                    totalUsers = allUsers.Count,
                    totalCandidates = allCandidates.Count,
                    totalApplications = allApplications.Count,
                    users = allUsers.Select(u => new { userId = u.UserId, email = u.Email, role = u.Role }).ToList(),
                    candidates = allCandidates.Select(c => new { candidateId = c.CandidateID, email = c.Email, userId = c.UserId }).ToList(),
                    applications = allApplications.Select(a => new { applicationId = a.ApplicationID, candidateId = a.CandidateID, jobId = a.JobID, status = a.Status }).ToList()
                };

                Console.WriteLine($"Debug user: {System.Text.Json.JsonSerializer.Serialize(debugInfo)}");
                return Ok(debugInfo);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DebugUser: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/dashboard/announcements
        [HttpGet("announcements")]
        public async Task<ActionResult<IEnumerable<AnnouncementItem>>> GetAnnouncements()
        {
            try
            {
                // For now, return static announcements. In a real app, these would come from database
                var announcements = new List<AnnouncementItem>
                {
                    new AnnouncementItem
                    {
                        Id = 1,
                        Title = "New Job Opportunities Added",
                        Subtitle = "Fresh jobs from top tech companies",
                        TimeAgo = "2 days ago",
                        Type = "info",
                        CreatedAt = DateTime.Now.AddDays(-2)
                    },
                    new AnnouncementItem
                    {
                        Id = 2,
                        Title = "Career Fair Registration Open",
                        Subtitle = "1 week left to register",
                        TimeAgo = "1 week ago",
                        Type = "event",
                        CreatedAt = DateTime.Now.AddDays(-7)
                    },
                    new AnnouncementItem
                    {
                        Id = 3,
                        Title = "Resume Workshop Available",
                        Subtitle = "Improve your resume with expert help",
                        TimeAgo = "2 weeks ago",
                        Type = "workshop",
                        CreatedAt = DateTime.Now.AddDays(-14)
                    }
                };

                return Ok(announcements);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/dashboard/top-jobs
        [HttpGet("top-jobs")]
        public async Task<ActionResult<IEnumerable<JobPerformanceItem>>> GetTopPerformingJobs()
        {
            try
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized("Invalid user token");
                }

                var topJobs = await _context.Jobs
                    .Where(j => j.RecruiterID == userId && j.ClosingDate > DateTime.Now)
                    .OrderByDescending(j => _context.Applications.Count(a => a.JobID == j.JobID))
                    .Take(3)
                    .Select(j => new JobPerformanceItem
                    {
                        Id = j.JobID,
                        Title = j.Title,
                        Location = j.Location,
                        Type = j.EmploymentType,
                        PostedDate = j.PostedDate.ToString("M/d/yyyy"),
                        ApplicationCount = _context.Applications.Count(a => a.JobID == j.JobID)
                    })
                    .ToListAsync();

                return Ok(topJobs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/dashboard/chart-data
        [HttpGet("chart-data")]
        public async Task<ActionResult<ChartData>> GetChartData()
        {
            try
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized("Invalid user token");
                }

                // Get data for the last 7 days
                var endDate = DateTime.Now;
                var startDate = endDate.AddDays(-6);

                var chartData = new ChartData
                {
                    Labels = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" },
                    ApplicationsData = new int[7],
                    InterviewsData = new int[7]
                };

                for (int i = 0; i < 7; i++)
                {
                    var date = startDate.AddDays(i);
                    chartData.ApplicationsData[i] = await _context.Applications
                        .CountAsync(a => a.Job.RecruiterID == userId &&
                                       a.AppliedDate.Date == date.Date);

                    chartData.InterviewsData[i] = await _context.Applications
                        .CountAsync(a => a.Job.RecruiterID == userId &&
                                       a.Status == "Interview Scheduled" &&
                                       a.AppliedDate.Date == date.Date);
                }

                return Ok(chartData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.Now - dateTime;

            if (timeSpan.TotalMinutes < 1)
                return "Just now";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} minutes ago";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} hours ago";
            if (timeSpan.TotalDays < 7)
                return $"{(int)timeSpan.TotalDays} days ago";
            if (timeSpan.TotalDays < 30)
                return $"{(int)(timeSpan.TotalDays / 7)} weeks ago";
            if (timeSpan.TotalDays < 365)
                return $"{(int)(timeSpan.TotalDays / 30)} months ago";

            return $"{(int)(timeSpan.TotalDays / 365)} years ago";
        }
    }
}
