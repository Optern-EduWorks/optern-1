import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // import FormsModule

interface Application {
  id: number;
  name: string;
  role: string;
  initials: string;
  color: string;
  email: string;
  location: string;
  experience: string;
  applied: string;
  skills: string[];
  status: 'Pending' | 'Shortlisted' | 'Reviewed' | 'Rejected' | 'Hired';
  rating: number;
  education?: string;
  coverLetter?: string;
  phone?: string;
}

@Component({
  selector: 'app-applications-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruiter-applications.html',
  styleUrls: ['./recruiter-applications.css']
})
export class ApplicationsManagementComponent {
  search = "";
  filterStatus = "All Status";
  viewMode: 'grid' | 'list' = 'list';
  showDetailModal = false;
  showAnalyticsModal = false;
  selectedApplication?: Application;

  applications: Application[] = [
    {
      id: 1,
      name: 'John Smith',
      role: 'Senior Frontend Developer',
      initials: 'J',
      color: 'purple',
      email: 'john.smith@email.com',
      location: 'San Francisco, CA',
      experience: '5 years',
      applied: '1/20/2024',
      skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Node.js'],
      status: 'Pending',
      rating: 4.5,
      education: 'Stanford University',
      coverLetter: "I am excited to apply for this position and bring my frontend expertise to your team.",
      phone: "+1 (555) 123-4567"
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'UX Designer',
      initials: 'S',
      color: 'orange',
      email: 'sarah.j@email.com',
      location: 'New York, NY',
      experience: '3 years',
      applied: '1/19/2024',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'],
      status: 'Shortlisted',
      rating: 4.8,
      education: 'NYU',
      coverLetter: "",
      phone: "+1 (555) 987-6543"
    },
    {
      id: 3,
      name: 'Mike Chen',
      role: 'Backend Engineer',
      initials: 'M',
      color: 'blue',
      email: 'mike.chen@email.com',
      location: 'Seattle, WA',
      experience: '4 years',
      applied: '1/18/2024',
      skills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker'],
      status: 'Reviewed',
      rating: 4.3,
      education: 'Berkeley',
      coverLetter: "",
      phone: "+1 (555) 234-5678"
    },
    {
      id: 4,
      name: 'Emily Davis',
      role: 'Data Science Intern',
      initials: 'E',
      color: 'purple',
      email: 'emily.davis@email.com',
      location: 'Boston, MA',
      experience: '1 year',
      applied: '1/17/2024',
      skills: ['Python', 'R', 'Machine Learning'],
      status: 'Shortlisted',
      rating: 4.2,
      education: 'MIT',
      coverLetter: "",
      phone: "+1 (555) 999-1111"
    },
    {
      id: 5,
      name: 'David Wilson',
      role: 'Product Manager',
      initials: 'D',
      color: 'pink',
      email: 'david.wilson@email.com',
      location: 'Austin, TX',
      experience: '6 years',
      applied: '1/16/2024',
      skills: ['Product Strategy', 'Agile', 'Analytics'],
      status: 'Rejected',
      rating: 4.0,
      education: 'Texas A&M',
      coverLetter: "",
      phone: "+1 (555) 801-3302"
    },
    {
      id: 6,
      name: 'Lisa Parker',
      role: 'DevOps Engineer',
      initials: 'L',
      color: 'magenta',
      email: 'lisa.parker@email.com',
      location: 'Denver, CO',
      experience: '5 years',
      applied: '1/15/2024',
      skills: ['AWS', 'Kubernetes', 'Docker'],
      status: 'Hired',
      rating: 4.9,
      education: 'CU Boulder',
      coverLetter: "",
      phone: "+1 (555) 678-3339"
    }
  ];

  get filteredApplications() {
    if (this.filterStatus === "All Status") return this.applications;
    return this.applications.filter(app => app.status === this.filterStatus);
  }

  openDetailModal(app: Application) {
    this.selectedApplication = app;
    this.showDetailModal = true;
  }
  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedApplication = undefined;
  }
  openAnalyticsModal() {
    this.showAnalyticsModal = true;
  }
  closeAnalyticsModal() {
    this.showAnalyticsModal = false;
  }
  shortlist(app: Application): void {
    // Example implementation to change application status to 'Shortlisted'
    app.status = 'Shortlisted';
    // You can add any additional logic here, e.g., save to backend or show notification
    console.log(`Application for ${app.name} has been shortlisted.`);
  }
}
