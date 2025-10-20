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
  isLoading = true;
  errorMessage: string | null = null;

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
        this.isLoading = false; // Set loading to false when data is received
        this.errorMessage = null; // Clear any previous error
      },
      error: (err) => {
        console.error('Error in recruiter jobs subscription:', err);
        console.warn('Failed to load recruiter jobs:', err);
        this.jobs = []; // Ensure jobs is always an array
        this.isLoading = false; // Set loading to false even on error
        this.errorMessage = this.getErrorMessage(err);
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
        this.isLoading = false; // Ensure loading is set to false on error
      }
    });
  }

  retryLoadJobs() {
    console.log('Retrying to load recruiter jobs');
    this.isLoading = true;
    this.loadJobs();
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

    // Set loading state for posting
    this.isLoading = true;

    this.jobService.create(payload).subscribe({
      next: (created) => {
        console.log('Job created successfully:', created);
        console.log('Raw response from server:', created);

        // Job is already added to the list by the service, no need to manually add
        // The service now immediately updates the BehaviorSubject to prevent flicker

        // Reset form
        this.newJob = { title: '', company: '', location: '', description: '', skills: [], salary: '', type: 'Full-time' };
        this.closePostJobModal();

        // Reset loading state
        this.isLoading = false;

        alert('Job posted successfully!');
      },
      error: (err) => {
        console.error('Error creating job:', err);
        console.error('Error response:', err.error);
        const errorMessage = err?.error?.message || err?.message || 'Unknown error occurred';
        alert('Failed to post job: ' + errorMessage);
        this.isLoading = false; // Reset loading state on error
      }
    });
  }

  setFilter(tab: string) {
    this.filterActiveTab = tab;
  }

  private getErrorMessage(err: any): string {
    console.log('Parsing error for user display:', err);

    if (err?.status === 401) {
      return 'Authentication failed. Please log in again.';
    } else if (err?.status === 403) {
      return 'Access denied. You may not have permission to view jobs.';
    } else if (err?.status === 404) {
      return 'Recruiter profile not found. Please contact support.';
    } else if (err?.status >= 500) {
      return 'Server error. Please try again later.';
    } else if (err?.error?.message) {
      return err.error.message;
    } else if (err?.message) {
      return err.message;
    } else {
      return 'Failed to load job opportunities. This might be due to a network issue or authentication problem.';
    }
  }
}
