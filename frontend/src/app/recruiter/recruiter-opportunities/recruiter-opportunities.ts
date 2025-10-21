import { Component, inject, ChangeDetectorRef } from '@angular/core';
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
  isInitialLoad = true;

  selectedJob?: UiJob | null = null;

  // Search and filter properties
  searchQuery: string = '';
  selectedType: string = 'All Types';


  jobs: UiJob[] = [];
  private jobService = inject(JobService);
  private cdr = inject(ChangeDetectorRef);

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

    // Subscribe to the reactive recruiter jobs stream first
    this.jobService.recruiterJobs$.subscribe({
      next: (data) => {
        console.log('Received updated recruiter jobs in component:', data);
        console.log('Number of jobs received:', data?.length || 0);
        this.jobs = data || [];
        // Only set loading to false if this is not the initial load
        if (!this.isInitialLoad) {
          this.isLoading = false;
        }
        this.errorMessage = null; // Clear any previous error
        this.cdr.detectChanges(); // Force change detection
      },
      error: (err) => {
        console.error('Error in recruiter jobs subscription:', err);
        console.warn('Failed to load recruiter jobs:', err);
        // Do NOT set jobs to empty array on error - keep current jobs to prevent flicker
        this.isLoading = false; // Set loading to false even on error
        this.errorMessage = this.getErrorMessage(err);
        this.cdr.detectChanges(); // Force change detection
      }
    });

    // Load jobs from database on component initialization
    this.loadJobsFromDatabase();
  }

  loadJobsFromDatabase() {
    console.log('Loading jobs from database on component init');
    this.isLoading = true;
    this.isInitialLoad = true;

    this.jobService.loadRecruiterJobs().subscribe({
      next: (jobs) => {
        console.log('Successfully loaded jobs from database:', jobs);
        this.jobs = jobs || [];
        this.isLoading = false;
        this.isInitialLoad = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Failed to load jobs from database:', err);
        // Do NOT clear jobs on auth errors to prevent vanishing - keep current jobs
        if (err?.status === 401 || err?.status === 403) {
          console.warn('Authentication error - keeping current jobs to prevent vanishing');
          this.errorMessage = this.getErrorMessage(err);
        } else {
          // For other errors, clear jobs and show error
          this.jobs = [];
          this.errorMessage = this.getErrorMessage(err);
        }
        this.isLoading = false;
        this.isInitialLoad = false;
      }
    });
  }



  // Simple counts
  get allJobsCount() { return this.jobs.length; }
  get activeJobsCount() { return this.jobs.filter(j => (j.status ?? 'active') === 'active').length; }
  get closedJobsCount() { return this.jobs.filter(j => (j.status ?? '') === 'closed').length; }
  get draftJobsCount() { return this.jobs.filter(j => (j.status ?? '') === 'draft').length; }

  // Filtered jobs based on search, type, and status filter
  get filteredJobs() {
    let filtered = this.jobs;

    // Apply status filter first
    if (this.filterActiveTab !== 'All Jobs') {
      const statusMap: { [key: string]: string } = {
        'Active': 'active',
        'Closed': 'closed',
        'Draft': 'draft'
      };
      const targetStatus = statusMap[this.filterActiveTab];
      if (targetStatus) {
        filtered = filtered.filter(job => (job.status ?? 'active') === targetStatus);
      }
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (this.selectedType !== 'All Types') {
      filtered = filtered.filter(job => job.type === this.selectedType);
    }

    return filtered;
  }

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
