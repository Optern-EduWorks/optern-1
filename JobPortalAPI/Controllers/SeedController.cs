using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class SeedController : ControllerBase
{
    private readonly JobPortalContext _context;

    public SeedController(JobPortalContext context) => _context = context;

    [HttpPost("data")]
    public async Task<IActionResult> SeedData()
    {
        try
        {
            // Check if data already exists
            if (await _context.Companies.AnyAsync() || await _context.CandidateProfiles.AnyAsync())
            {
                return Ok("Data already exists");
            }

            // Create industry lookup first
            var industry = new IndustryLookup
            {
                IndustryName = "Technology"
            };
            _context.IndustryLookups.Add(industry);
            await _context.SaveChangesAsync();

            // Create test company
            var company = new Company
            {
                Name = "Tech Solutions Inc",
                Website = "https://techsolutions.com",
                Size = "51-200",
                Address = "123 Tech Street, Silicon Valley",
                Phone = "123-456-7890",
                CreatedDate = DateTime.UtcNow,
                IndustryID = industry.IndustryID
            };
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            // Create test users first
            var recruiterUser = new User
            {
                Role = "Recruiter",
                Username = "johnsmith",
                Email = "john@techsolutions.com",
                Status = "Active",
                PhoneNumber = "123-456-7890",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                VerificationStatus = "Verified",
                Password = "password123" // In real app, this would be hashed
            };
            _context.Users.Add(recruiterUser);
            await _context.SaveChangesAsync();

            var candidateUser = new User
            {
                Role = "Candidate",
                Username = "janedoe",
                Email = "jane.doe@email.com",
                Status = "Active",
                PhoneNumber = "987-654-3210",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                VerificationStatus = "Verified",
                Password = "password123" // In real app, this would be hashed
            };
            _context.Users.Add(candidateUser);
            await _context.SaveChangesAsync();

            // Create test recruiter with UserId
            var recruiter = new Recruiter
            {
                FullName = "John Smith",
                Email = "john@techsolutions.com",
                PhoneNumber = "123-456-7890",
                CompanyID = company.CompanyID,
                JobTitle = "Senior Recruiter",
                Bio = "Experienced HR professional",
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };
            _context.Recruiters.Add(recruiter);
            await _context.SaveChangesAsync();

            // Create test candidate with UserId
            var candidate = new CandidateProfile
            {
                FullName = "Jane Doe",
                Email = "jane.doe@email.com",
                PhoneNumber = "987-654-3210",
                Address = "123 Main St, City, State",
                DateOfBirth = new DateTime(1990, 1, 1),
                Gender = "Female",
                Status = "Active",
                GraduationYear = 2020,
                College = "University of Technology",
                Course = "Computer Science",
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };
            _context.CandidateProfiles.Add(candidate);
            await _context.SaveChangesAsync();

            // Create additional companies and recruiters for diverse job opportunities
            var companies = new List<Company>
            {
                new Company
                {
                    Name = "Google Inc",
                    Website = "https://google.com",
                    Size = "10000+",
                    Address = "1600 Amphitheatre Parkway, Mountain View, CA",
                    Phone = "650-253-0000",
                    CreatedDate = DateTime.UtcNow,
                    IndustryID = industry.IndustryID
                },
                new Company
                {
                    Name = "Microsoft Corporation",
                    Website = "https://microsoft.com",
                    Size = "10000+",
                    Address = "One Microsoft Way, Redmond, WA",
                    Phone = "425-882-8080",
                    CreatedDate = DateTime.UtcNow,
                    IndustryID = industry.IndustryID
                },
                new Company
                {
                    Name = "Amazon Web Services",
                    Website = "https://aws.amazon.com",
                    Size = "10000+",
                    Address = "410 Terry Ave N, Seattle, WA",
                    Phone = "206-266-1000",
                    CreatedDate = DateTime.UtcNow,
                    IndustryID = industry.IndustryID
                },
                new Company
                {
                    Name = "Meta Platforms",
                    Website = "https://meta.com",
                    Size = "5000-10000",
                    Address = "1 Hacker Way, Menlo Park, CA",
                    Phone = "650-543-4800",
                    CreatedDate = DateTime.UtcNow,
                    IndustryID = industry.IndustryID
                },
                new Company
                {
                    Name = "Netflix Inc",
                    Website = "https://netflix.com",
                    Size = "5000-10000",
                    Address = "100 Winchester Circle, Los Gatos, CA",
                    Phone = "408-540-3700",
                    CreatedDate = DateTime.UtcNow,
                    IndustryID = industry.IndustryID
                }
            };
            _context.Companies.AddRange(companies);
            await _context.SaveChangesAsync();

            // Create additional recruiters
            var additionalRecruiters = new List<Recruiter>
            {
                new Recruiter
                {
                    FullName = "Sarah Johnson",
                    Email = "sarah.johnson@google.com",
                    PhoneNumber = "650-253-0001",
                    CompanyID = companies[0].CompanyID,
                    JobTitle = "Senior Talent Acquisition Manager",
                    Bio = "Experienced in tech recruiting with focus on software engineering roles",
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                },
                new Recruiter
                {
                    FullName = "Michael Chen",
                    Email = "michael.chen@microsoft.com",
                    PhoneNumber = "425-882-8081",
                    CompanyID = companies[1].CompanyID,
                    JobTitle = "Technical Recruiter",
                    Bio = "Specialized in cloud computing and AI roles",
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                },
                new Recruiter
                {
                    FullName = "Emily Rodriguez",
                    Email = "emily.rodriguez@aws.amazon.com",
                    PhoneNumber = "206-266-1001",
                    CompanyID = companies[2].CompanyID,
                    JobTitle = "Cloud Solutions Recruiter",
                    Bio = "Expert in AWS cloud services and DevOps recruiting",
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                },
                new Recruiter
                {
                    FullName = "David Kim",
                    Email = "david.kim@meta.com",
                    PhoneNumber = "650-543-4801",
                    CompanyID = companies[3].CompanyID,
                    JobTitle = "Product Recruiter",
                    Bio = "Focused on product management and design roles",
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                },
                new Recruiter
                {
                    FullName = "Lisa Thompson",
                    Email = "lisa.thompson@netflix.com",
                    PhoneNumber = "408-540-3701",
                    CompanyID = companies[4].CompanyID,
                    JobTitle = "Engineering Recruiter",
                    Bio = "Passionate about streaming technology and content delivery",
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                }
            };
            _context.Recruiters.AddRange(additionalRecruiters);
            await _context.SaveChangesAsync();

            // Create diverse job opportunities
            var jobs = new List<Job>
            {
                // Original job
                new Job
                {
                    Title = "Software Developer",
                    CompanyID = company.CompanyID,
                    RecruiterID = recruiter.RecruiterID,
                    Description = "We are looking for a skilled software developer to join our team. You will work on cutting-edge technologies and contribute to innovative projects.",
                    Location = "New York, NY",
                    SalaryRange = "$80,000 - $120,000",
                    EmploymentType = "Full-time",
                    Skills = "JavaScript, React, Node.js",
                    PostedDate = DateTime.UtcNow,
                    ClosingDate = DateTime.UtcNow.AddDays(30),
                    RemoteAllowed = true,
                    Category = "Technology"
                },
                // Google jobs
                new Job
                {
                    Title = "Senior Software Engineer",
                    CompanyID = companies[0].CompanyID,
                    RecruiterID = additionalRecruiters[0].RecruiterID,
                    Description = "Join Google's engineering team to build scalable systems that impact billions of users worldwide. Work on distributed systems, machine learning infrastructure, and cloud technologies.",
                    Location = "Mountain View, CA",
                    SalaryRange = "$150,000 - $250,000",
                    EmploymentType = "Full-time",
                    Skills = "C++, Java, Python, Distributed Systems, Machine Learning",
                    PostedDate = DateTime.UtcNow.AddDays(-2),
                    ClosingDate = DateTime.UtcNow.AddDays(28),
                    RemoteAllowed = true,
                    Category = "Technology"
                },
                new Job
                {
                    Title = "Product Manager",
                    CompanyID = companies[0].CompanyID,
                    RecruiterID = additionalRecruiters[0].RecruiterID,
                    Description = "Drive product strategy and execution for Google's consumer products. Work closely with engineering teams to deliver innovative features and improve user experience.",
                    Location = "San Francisco, CA",
                    SalaryRange = "$130,000 - $200,000",
                    EmploymentType = "Full-time",
                    Skills = "Product Management, Analytics, User Research, SQL",
                    PostedDate = DateTime.UtcNow.AddDays(-1),
                    ClosingDate = DateTime.UtcNow.AddDays(29),
                    RemoteAllowed = false,
                    Category = "Technology"
                },
                // Microsoft jobs
                new Job
                {
                    Title = "Cloud Solutions Architect",
                    CompanyID = companies[1].CompanyID,
                    RecruiterID = additionalRecruiters[1].RecruiterID,
                    Description = "Design and implement cloud solutions using Microsoft Azure. Help enterprise customers migrate to the cloud and optimize their infrastructure.",
                    Location = "Seattle, WA",
                    SalaryRange = "$140,000 - $220,000",
                    EmploymentType = "Full-time",
                    Skills = "Azure, AWS, Cloud Architecture, DevOps, Kubernetes",
                    PostedDate = DateTime.UtcNow.AddDays(-3),
                    ClosingDate = DateTime.UtcNow.AddDays(27),
                    RemoteAllowed = true,
                    Category = "Technology"
                },
                new Job
                {
                    Title = "Data Scientist",
                    CompanyID = companies[1].CompanyID,
                    RecruiterID = additionalRecruiters[1].RecruiterID,
                    Description = "Apply machine learning and statistical analysis to solve complex business problems. Work with large datasets and build predictive models.",
                    Location = "Redmond, WA",
                    SalaryRange = "$120,000 - $180,000",
                    EmploymentType = "Full-time",
                    Skills = "Python, R, Machine Learning, SQL, Statistics",
                    PostedDate = DateTime.UtcNow.AddDays(-1),
                    ClosingDate = DateTime.UtcNow.AddDays(29),
                    RemoteAllowed = true,
                    Category = "Technology"
                },
                // AWS jobs
                new Job
                {
                    Title = "DevOps Engineer",
                    CompanyID = companies[2].CompanyID,
                    RecruiterID = additionalRecruiters[2].RecruiterID,
                    Description = "Build and maintain CI/CD pipelines, infrastructure as code, and automated deployment systems for AWS services.",
                    Location = "Seattle, WA",
                    SalaryRange = "$110,000 - $170,000",
                    EmploymentType = "Full-time",
                    Skills = "AWS, Terraform, Jenkins, Docker, Kubernetes",
                    PostedDate = DateTime.UtcNow.AddDays(-4),
                    ClosingDate = DateTime.UtcNow.AddDays(26),
                    RemoteAllowed = true,
                    Category = "Technology"
                },
                new Job
                {
                    Title = "Solutions Engineer",
                    CompanyID = companies[2].CompanyID,
                    RecruiterID = additionalRecruiters[2].RecruiterID,
                    Description = "Help customers design and implement cloud solutions. Provide technical guidance and conduct product demonstrations.",
                    Location = "Austin, TX",
                    SalaryRange = "$100,000 - $160,000",
                    EmploymentType = "Full-time",
                    Skills = "AWS, Cloud Computing, Technical Sales, System Administration",
                    PostedDate = DateTime.UtcNow.AddDays(-2),
                    ClosingDate = DateTime.UtcNow.AddDays(28),
                    RemoteAllowed = false,
                    Category = "Technology"
                },
                // Meta jobs
                new Job
                {
                    Title = "Frontend Engineer",
                    CompanyID = companies[3].CompanyID,
                    RecruiterID = additionalRecruiters[3].RecruiterID,
                    Description = "Build beautiful and performant user interfaces for Meta's products. Work with React, GraphQL, and modern web technologies.",
                    Location = "Menlo Park, CA",
                    SalaryRange = "$130,000 - $200,000",
                    EmploymentType = "Full-time",
                    Skills = "React, JavaScript, GraphQL, CSS, TypeScript",
                    PostedDate = DateTime.UtcNow.AddDays(-3),
                    ClosingDate = DateTime.UtcNow.AddDays(27),
                    RemoteAllowed = true,
                    Category = "Technology"
                },
                new Job
                {
                    Title = "Machine Learning Engineer",
                    CompanyID = companies[3].CompanyID,
                    RecruiterID = additionalRecruiters[3].RecruiterID,
                    Description = "Develop and deploy machine learning models at scale. Work on recommendation systems, computer vision, and natural language processing.",
                    Location = "New York, NY",
                    SalaryRange = "$140,000 - $220,000",
                    EmploymentType = "Full-time",
                    Skills = "Python, TensorFlow, PyTorch, Machine Learning, Deep Learning",
                    PostedDate = DateTime.UtcNow.AddDays(-1),
                    ClosingDate = DateTime.UtcNow.AddDays(29),
                    RemoteAllowed = true,
                    Category = "Technology"
                },
                // Netflix jobs
                new Job
                {
                    Title = "Senior Backend Engineer",
                    CompanyID = companies[4].CompanyID,
                    RecruiterID = additionalRecruiters[4].RecruiterID,
                    Description = "Build scalable backend services for Netflix's streaming platform. Work with microservices architecture and handle millions of concurrent users.",
                    Location = "Los Gatos, CA",
                    SalaryRange = "$150,000 - $250,000",
                    EmploymentType = "Full-time",
                    Skills = "Java, Spring Boot, Microservices, AWS, Cassandra",
                    PostedDate = DateTime.UtcNow.AddDays(-5),
                    ClosingDate = DateTime.UtcNow.AddDays(25),
                    RemoteAllowed = true,
                    Category = "Technology"
                },
                new Job
                {
                    Title = "Data Engineer",
                    CompanyID = companies[4].CompanyID,
                    RecruiterID = additionalRecruiters[4].RecruiterID,
                    Description = "Design and maintain data pipelines for analytics and machine learning. Work with big data technologies and real-time streaming data.",
                    Location = "Los Angeles, CA",
                    SalaryRange = "$120,000 - $190,000",
                    EmploymentType = "Full-time",
                    Skills = "Python, Spark, Kafka, SQL, Airflow",
                    PostedDate = DateTime.UtcNow.AddDays(-2),
                    ClosingDate = DateTime.UtcNow.AddDays(28),
                    RemoteAllowed = false,
                    Category = "Technology"
                },
                // Additional diverse jobs
                new Job
                {
                    Title = "Full Stack Developer",
                    CompanyID = company.CompanyID,
                    RecruiterID = recruiter.RecruiterID,
                    Description = "Develop end-to-end web applications using modern technologies. Work on both frontend and backend components.",
                    Location = "Austin, TX",
                    SalaryRange = "$90,000 - $140,000",
                    EmploymentType = "Full-time",
                    Skills = "JavaScript, Angular, Node.js, MongoDB, Express",
                    PostedDate = DateTime.UtcNow.AddDays(-1),
                    ClosingDate = DateTime.UtcNow.AddDays(29),
                    RemoteAllowed = true,
                    Category = "Technology"
                },
                new Job
                {
                    Title = "UI/UX Designer",
                    CompanyID = companies[3].CompanyID,
                    RecruiterID = additionalRecruiters[3].RecruiterID,
                    Description = "Create intuitive and beautiful user experiences. Conduct user research, design interfaces, and collaborate with product teams.",
                    Location = "San Francisco, CA",
                    SalaryRange = "$100,000 - $160,000",
                    EmploymentType = "Full-time",
                    Skills = "Figma, Sketch, User Research, Prototyping, Design Systems",
                    PostedDate = DateTime.UtcNow.AddDays(-3),
                    ClosingDate = DateTime.UtcNow.AddDays(27),
                    RemoteAllowed = true,
                    Category = "Design"
                },
                new Job
                {
                    Title = "Cybersecurity Analyst",
                    CompanyID = companies[1].CompanyID,
                    RecruiterID = additionalRecruiters[1].RecruiterID,
                    Description = "Protect organizational information systems. Monitor for security threats, conduct vulnerability assessments, and implement security measures.",
                    Location = "Washington, DC",
                    SalaryRange = "$95,000 - $150,000",
                    EmploymentType = "Full-time",
                    Skills = "Network Security, SIEM, Penetration Testing, CISSP, Incident Response",
                    PostedDate = DateTime.UtcNow.AddDays(-4),
                    ClosingDate = DateTime.UtcNow.AddDays(26),
                    RemoteAllowed = false,
                    Category = "Security"
                },
                new Job
                {
                    Title = "Mobile App Developer",
                    CompanyID = companies[0].CompanyID,
                    RecruiterID = additionalRecruiters[0].RecruiterID,
                    Description = "Develop native and cross-platform mobile applications. Work with iOS and Android platforms using modern development frameworks.",
                    Location = "Sunnyvale, CA",
                    SalaryRange = "$110,000 - $180,000",
                    EmploymentType = "Full-time",
                    Skills = "React Native, Flutter, iOS, Android, Swift, Kotlin",
                    PostedDate = DateTime.UtcNow.AddDays(-2),
                    ClosingDate = DateTime.UtcNow.AddDays(28),
                    RemoteAllowed = true,
                    Category = "Technology"
                }
            };
            _context.Jobs.AddRange(jobs);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Test data created successfully",
                CompanyId = company.CompanyID,
                RecruiterId = recruiter.RecruiterID,
                CandidateId = candidate.CandidateID,
                JobsCreated = jobs.Count,
                RecruiterUserId = recruiterUser.UserId,
                CandidateUserId = candidateUser.UserId
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error seeding data: {ex.Message}");
        }
    }
}
