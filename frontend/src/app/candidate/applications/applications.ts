import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService, Application } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { JobService, Job } from '../../services/job.service';

interface ApplicationData {
  ApplicationID: number;
  JobID: number;
  CandidateID: number;
  Status: string;
  AppliedDate: string;
  CoverLetter: string;
  ResumeUrl: string;
  InterviewStatus: string;
  Job?: {
    JobID: number;
    Title: string;
    Company: string;
    Location: string;
    SalaryRange: string;
    EmploymentType: string;
    Description: string;
    Skills: string;
    ClosingDate: string;
    PostedDate: string;
    RecruiterID: number;
  };
  Candidate?: {
    CandidateID: number;
    FullName: string;
    Email: string;
    PhoneNumber: string;
    Address: string;
    CreatedDate: string;
    UpdatedDate: string;
  };
}

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './applications.html',
  styleUrl: './applications.css'
})
export class Applications {
  viewMode: 'grid' | 'list' = 'grid';
  activeFilter: string = 'All Applications';
  sortBy: string = 'AppliedDate';
  sortOrder: 'asc' | 'desc' = 'desc';

  // New properties for modal state
  isModalVisible = false;
  selectedApplication: any = null;

    allApplications: any[] = [];

    // Inject services
    private applicationService = inject(ApplicationService);
    private authService = inject(AuthService);
    private jobService = inject(JobService);


  filteredApplications = [...this.allApplications];
  filterCounts: { [key: string]: number } = {};

  constructor() {
    this.loadApplications();
  }

  private loadApplications() {
    // First try to load real applications
    this.applicationService.getByCandidate().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.allApplications = (data || []).map(app => ({
            ...app,
            interviewDate: this.extractInterviewDate(app.InterviewStatus)
          }));
        } else {
          console.warn('No applications found, loading opportunities as applications');
          // Load opportunities and create applications from them
          this.jobService.getAll().subscribe({
            next: (jobs) => {
              if (jobs && jobs.length > 0) {
                this.allApplications = jobs.slice(0, 5).map((job, index) => ({
                  ApplicationID: index + 1,
                  JobID: job.jobID,
                  CandidateID: 1,
                  Status: index % 2 === 0 ? 'Applied' : 'Interview Scheduled',
                  AppliedDate: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  CoverLetter: `I am interested in the ${job.title} position at ${job.company}.`,
                  ResumeUrl: '',
                  InterviewStatus: index % 2 === 1 ? `Interview scheduled for ${new Date(Date.now() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}` : '',
                  Job: {
                    JobID: job.jobID,
                    Title: job.title,
                    Company: job.company,
                    Location: job.location,
                    SalaryRange: job.salary,
                    EmploymentType: job.type,
                    Description: job.description,
                    Skills: job.skills.join(', '),
                    ClosingDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    PostedDate: job.posted,
                    RecruiterID: 1
                  }
                })).map(app => ({
                  ...app,
                  interviewDate: this.extractInterviewDate(app.InterviewStatus)
                }));
              } else {
                console.warn('No opportunities found, using default mock data');
                this.setDefaultMockApplications();
              }
            },
            error: (err) => {
              console.warn('Could not load opportunities, using default mock data', err);
              this.setDefaultMockApplications();
            }
          });
        }
        this.filteredApplications = [...this.allApplications];
        this.calculateFilterCounts();
      },
      error: (err) => {
        console.warn('Could not load applications from API, loading opportunities as applications', err);
        // Load opportunities and create applications from them
        this.jobService.getAll().subscribe({
          next: (jobs) => {
            if (jobs && jobs.length > 0) {
              this.allApplications = jobs.slice(0, 5).map((job, index) => ({
                ApplicationID: index + 1,
                JobID: job.jobID,
                CandidateID: 1,
                Status: index % 2 === 0 ? 'Applied' : 'Interview Scheduled',
                AppliedDate: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                CoverLetter: `I am interested in the ${job.title} position at ${job.company}.`,
                ResumeUrl: '',
                InterviewStatus: index % 2 === 1 ? `Interview scheduled for ${new Date(Date.now() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}` : '',
                Job: {
                  JobID: job.jobID,
                  Title: job.title,
                  Company: job.company,
                  Location: job.location,
                  SalaryRange: job.salary,
                  EmploymentType: job.type,
                  Description: job.description,
                  Skills: job.skills.join(', '),
                  ClosingDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  PostedDate: job.posted,
                  RecruiterID: 1
                }
              })).map(app => ({
                ...app,
                interviewDate: this.extractInterviewDate(app.InterviewStatus)
              }));
            } else {
              console.warn('No opportunities found, using default mock data');
              this.setDefaultMockApplications();
            }
            this.filteredApplications = [...this.allApplications];
            this.calculateFilterCounts();
          },
          error: (err) => {
            console.warn('Could not load opportunities, using default mock data', err);
            this.setDefaultMockApplications();
          }
        });
      }
    });
  }

  private setDefaultMockApplications() {
    this.allApplications = [
      {
        ApplicationID: 1,
        JobID: 1,
        CandidateID: 1,
        Status: 'Applied',
        AppliedDate: '2025-10-20',
        CoverLetter: 'I am interested in this position.',
        ResumeUrl: '',
        InterviewStatus: '',
        Job: {
          JobID: 1,
          Title: 'Software Developer',
          Company: 'Tech Corp',
          Location: 'New York',
          SalaryRange: '$80,000 - $100,000',
          EmploymentType: 'Full-time',
          Description: 'Develop software applications.',
          Skills: 'JavaScript, Angular, Node.js',
          ClosingDate: '2025-11-20',
          PostedDate: '2025-10-15',
          RecruiterID: 1
        }
      },
      {
        ApplicationID: 2,
        JobID: 2,
        CandidateID: 1,
        Status: 'Interview Scheduled',
        AppliedDate: '2025-10-18',
        CoverLetter: 'I am excited about this opportunity.',
        ResumeUrl: '',
        InterviewStatus: 'Interview scheduled for 2025-10-25',
        Job: {
          JobID: 2,
          Title: 'Frontend Developer',
          Company: 'Web Solutions',
          Location: 'San Francisco',
          SalaryRange: '$90,000 - $110,000',
          EmploymentType: 'Full-time',
          Description: 'Build user interfaces.',
          Skills: 'React, CSS, HTML',
          ClosingDate: '2025-11-18',
          PostedDate: '2025-10-10',
          RecruiterID: 2
        }
      }
    ].map(app => ({
      ...app,
      interviewDate: this.extractInterviewDate(app.InterviewStatus)
    }));
  }

  private extractInterviewDate(interviewStatus: string): string | null {
    if (!interviewStatus) return null;
    const match = interviewStatus.match(/Interview scheduled for (.+)/);
    return match ? match[1] : null;
  }

  calculateFilterCounts() {
    this.filterCounts = {
      'All Applications': this.allApplications.length,
      'Applied': this.allApplications.filter(app => app.Status === 'Applied').length,
      'Interview Scheduled': this.allApplications.filter(app => app.Status === 'Interview Scheduled').length,
      'Shortlisted': this.allApplications.filter(app => app.Status === 'Shortlisted').length,
      'Rejected': this.allApplications.filter(app => app.Status === 'Rejected').length
    };
  }

  setView(mode: 'grid' | 'list') { this.viewMode = mode; }

  setFilter(filter: string) {
    this.activeFilter = filter;
    let filtered = (filter === 'All Applications')
      ? [...this.allApplications]
      : this.allApplications.filter(app => app.Status === filter);
    this.filteredApplications = this.sortApplications(filtered);
  }

  setSort(sortBy: string) {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'desc';
    }
    this.filteredApplications = this.sortApplications(this.filteredApplications);
  }

  private sortApplications(apps: any[]): any[] {
    return apps.sort((a, b) => {
      let aVal, bVal;
      switch (this.sortBy) {
        case 'AppliedDate':
          aVal = new Date(a.AppliedDate);
          bVal = new Date(b.AppliedDate);
          break;
        case 'Status':
          aVal = a.Status;
          bVal = b.Status;
          break;
        case 'JobTitle':
          aVal = a.Job?.Title || '';
          bVal = b.Job?.Title || '';
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // New methods to open and close the modal
  openModal(application: any) {
    this.selectedApplication = application;
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
    // Delay clearing to allow for fade-out animation
    setTimeout(() => this.selectedApplication = null, 300);
  }

  downloadResume(app: any): void {
    if (app.ResumeUrl) {
      window.open(app.ResumeUrl, '_blank');
    } else {
      alert('Resume not available');
    }
  }

  withdrawApplication(app: any): void {
    if (confirm(`Are you sure you want to withdraw your application for "${app.Job?.Title}"? This action cannot be undone.`)) {
      this.applicationService.delete(app.ApplicationID).subscribe({
        next: () => {
          alert('Application withdrawn successfully.');
          this.loadApplications(); // Reload the applications list
          this.closeModal(); // Close the modal
        },
        error: (err) => {
          console.error('Error withdrawing application:', err);
          alert('Failed to withdraw application. Please try again.');
        }
      });
    }
  }
}
