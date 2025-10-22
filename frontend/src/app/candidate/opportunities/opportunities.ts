import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { JobService, Job } from '../../services/job.service';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-opportunities',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  // Updated file paths
  templateUrl: './opportunities.html',
  styleUrls: ['./opportunities.css']
})
// Updated class name
export class Opportunities {
  // Default view is 'list'
  viewMode: 'grid' | 'list' = 'list';

  // Method to switch views
  setView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  // Jobs loaded from backend with auto-refresh
  jobs: Job[] = [];

  // Track applied job IDs to show visual feedback
  appliedJobIds: Set<number> = new Set();

  private jobService = inject(JobService);
  private applicationService = inject(ApplicationService);
  private authService = inject(AuthService);

  constructor() {
    console.log('Initializing Opportunities component');
    // Subscribe to the reactive jobs stream
    this.jobService.jobs$.subscribe({
      next: (data) => {
        console.log('Received updated jobs in component:', data);
        console.log('Number of jobs received:', data?.length || 0);
        this.jobs = data || [];
      },
      error: (err) => {
        console.error('Error in jobs subscription:', err);
        console.warn('Could not load jobs from API:', err);
      }
    });

    // Initial load
    this.loadJobs();
  }

  loadJobs() {
    console.log('Loading jobs in Opportunities component');
    // This will trigger a refresh and update all subscribers
    this.jobService.getAll().subscribe({
      next: () => {
        console.log('Successfully triggered jobs refresh');
      },
      error: (err) => {
        console.error('Error triggering jobs refresh:', err);
        console.warn('Could not load jobs from API:', err);
      }
    });
  }

  refreshJobs() {
    this.loadJobs();
  }

  // Check if job has been applied to
  hasApplied(job: Job): boolean {
    return this.appliedJobIds.has(job.jobID);
  }

  // Get button text based on application status
  getButtonText(job: Job): string {
    return this.hasApplied(job) ? 'Applied ✓' : 'Apply Now';
  }

  // Get button class based on application status
  getButtonClass(job: Job): string {
    return this.hasApplied(job) ? 'applied-btn' : 'apply-now-btn';
  }

  apply(job: Job) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Please sign in before applying');
      return;
    }

    if (!currentUser.token) {
      alert('Authentication token missing. Please sign in again.');
      return;
    }

    console.log('Applying for job:', job.title, 'with ID:', job.jobID);

    const payload = {
      JobID: job.jobID,
      Status: 'Applied',
      AppliedDate: new Date(),
      CoverLetter: '',
      ResumeUrl: ''
    };

    console.log('Application payload:', payload);

    this.applicationService.create(payload).subscribe({
      next: (response: any) => {
        console.log('Application response:', response);
        if (response && response.success) {
          // Show more detailed success message
          alert(`✅ Application submitted successfully!\n\n📋 Application Details:\n• Job: ${job.title}\n• Company: ${job.company}\n• Applied: ${new Date().toLocaleDateString()}\n\nYou will be notified about the status of your application.`);

          // Disable the apply button for this job
          const applyButton = document.querySelector(`[data-job-id="${job.jobID}"]`) as HTMLButtonElement;
          if (applyButton) {
            applyButton.textContent = 'Applied ✓';
            applyButton.disabled = true;
            applyButton.style.backgroundColor = '#28a745';
            applyButton.style.cursor = 'not-allowed';
          }

          // Optionally refresh jobs to update applicant count
          this.refreshJobs();
        } else {
          alert('Application submitted but response was unexpected');
        }
      },
      error: (err) => {
        console.error('Application error:', err);
        let errorMessage = '❌ Application failed';

        if (err?.error?.message) {
          errorMessage += ': ' + err.error.message;
        } else if (err?.message) {
          errorMessage += ': ' + err.message;
        } else if (err?.status) {
          errorMessage += ` (Error ${err.status})`;
        }

        alert(errorMessage);
      }
    });
  }
}
