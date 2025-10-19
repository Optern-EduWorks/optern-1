import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService, Job as UiJob } from '../../services/job.service';
import { FormsModule } from '@angular/forms';

interface Job {
  id: number;
  title: string;
  icon: string;
  status: 'active' | 'closed' | 'draft';
  location: string;
  workMode: string;
  salary: string;
  tags: { label: string; color: string }[];
  applicants: number;
  posted: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
}

@Component({
  selector: 'app-recruiter-opportunities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruiter-opportunities.html',
  styleUrls: ['./recruiter-opportunities.css'],
})
export class RecruiterOpportunitiesComponent {
  viewMode: 'grid' | 'list' = 'grid';
  showDetailModal = false;
  showPostJobModal = false;
  filterActiveTab: string = 'All Jobs';

  selectedJob?: UiJob | null = null;

  jobs: UiJob[] = [];
  private jobService = inject(JobService);

  // Simple model for posting a job
  newJob: {
    title?: string;
    company?: string;
    location?: string;
    description?: string;
    skills?: string[];
    salary?: string;
    type?: string;
    workMode?: string;
    requirements?: string;
    closingDate?: string;
  } = { title: '', company: '', location: '', description: '', skills: [], salary: '', type: 'Full-time' };

  constructor() {
    console.log('Initializing RecruiterOpportunities component');
    // Subscribe to the reactive recruiter jobs stream
    this.jobService.recruiterJobs$.subscribe({
      next: (data) => {
        console.log('Received updated recruiter jobs in component:', data);
        console.log('Number of jobs received:', data?.length || 0);
        this.jobs = data || [];
      },
      error: (err) => {
        console.error('Error in recruiter jobs subscription:', err);
        console.warn('Failed to load recruiter jobs:', err);
        this.jobs = []; // Ensure jobs is always an array
      }
    });

    // Initial load
    this.loadJobs();
  }

  private loadJobs() {
    console.log('Loading recruiter jobs in RecruiterOpportunities component');
    // This will trigger a refresh and update all subscribers
    this.jobService.getByRecruiter().subscribe({
      next: () => {
        console.log('Successfully triggered recruiter jobs refresh');
      },
      error: (err) => {
        console.error('Error triggering recruiter jobs refresh:', err);
        console.warn('Failed to load recruiter jobs:', err);
      }
    });
  }

  // Simple counts
  get allJobsCount() { return this.jobs.length; }
  get activeJobsCount() { return this.jobs.filter(j => (j.status ?? 'active') === 'active').length; }
  get closedJobsCount() { return this.jobs.filter(j => (j.status ?? '') === 'closed').length; }
  get draftJobsCount() { return this.jobs.filter(j => (j.status ?? '') === 'draft').length; }

  openDetailModal(job: UiJob) {
    this.selectedJob = job;
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedJob = undefined;
  }

  openPostJobModal() {
    this.showPostJobModal = true;
  }

  closePostJobModal() {
    this.showPostJobModal = false;
  }

  postJob() {
    if (!this.newJob.title || !this.newJob.location || !this.newJob.description || !this.newJob.salary) {
      alert('Please fill in all required fields');
      return;
    }

    // Convert requirements string to array if provided
    const requirementsArray = this.newJob.requirements ?
      this.newJob.requirements.split(',').map((req: string) => req.trim()).filter((req: string) => req.length > 0) : [];

    const payload: any = {
      Title: this.newJob.title,
      Location: this.newJob.location,
      Description: this.newJob.description,
      Skills: requirementsArray.join(','),
      SalaryRange: this.newJob.salary,
      EmploymentType: this.newJob.type || 'Full-time',
      RemoteAllowed: this.newJob.workMode === 'Remote' ? true : false
    };

    console.log('Creating job with payload:', payload);
    console.log('Form data being sent:', this.newJob);

    this.jobService.create(payload).subscribe({
      next: (created) => {
        console.log('Job created successfully:', created);
        console.log('Raw response from server:', created);

        // Add the created job to the list
        this.jobs.unshift(created);

        // Reset form
        this.newJob = { title: '', company: '', location: '', description: '', skills: [], salary: '', type: 'Full-time' };
        this.closePostJobModal();

        alert('Job posted successfully!');
      },
      error: (err) => {
        console.error('Error creating job:', err);
        console.error('Error response:', err.error);
        const errorMessage = err?.error?.message || err?.message || 'Unknown error occurred';
        alert('Failed to post job: ' + errorMessage);
      }
    });
  }

  setFilter(tab: string) {
    this.filterActiveTab = tab;
  }
}
