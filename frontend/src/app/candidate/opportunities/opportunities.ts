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

  // Jobs loaded from backend. If backend is not available, this will remain empty.
  jobs: Job[] = [];

  private jobService = inject(JobService);
  private applicationService = inject(ApplicationService);
  private authService = inject(AuthService);

  constructor() {
    // Attempt to load jobs from backend; errors are safe during development
    this.jobService.getAll().subscribe({
      next: (data) => (this.jobs = data),
      error: (err) => console.warn('Could not load jobs from API (backend may be offline):', err)
    });
  }

  apply(job: Job) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Please sign in before applying');
      return;
    }
    const currentUserId = currentUser.userId;
    const payload = {
      JobID: job.jobID,
      CandidateID: currentUserId,
      Status: 'Applied',
      AppliedDate: new Date(),
      CoverLetter: '',
      ResumeUrl: ''
    };
    this.applicationService.create(payload).subscribe({
      next: () => alert('Application submitted'),
      error: (err) => alert('Application failed: ' + (err?.error?.message ?? err))
    });
  }
}
