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
  imports: [CommonModule],
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
  newJob: Partial<UiJob> = { title: '', company: '', location: '', description: '', skills: [], salary: '', type: 'Full-time' };

  constructor() {
    this.loadJobs();
  }

  private loadJobs() {
    this.jobService.getAll().subscribe({ next: (data) => this.jobs = data, error: (err) => console.warn('Failed to load jobs', err) });
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
    const payload: any = {
      Title: this.newJob.title,
      Company: this.newJob.company,
      Location: this.newJob.location,
      Description: this.newJob.description,
      Skills: (this.newJob.skills || []).join(','),
      SalaryRange: this.newJob.salary,
      EmploymentType: this.newJob.type
    };
    this.jobService.create(payload).subscribe({
      next: (created) => {
        this.jobs.unshift(created);
        this.newJob = { title: '', company: '', location: '', description: '', skills: [], salary: '', type: 'Full-time' };
        this.closePostJobModal();
      },
      error: (err) => alert('Failed to post job: ' + (err?.error?.message ?? err))
    });
  }

  setFilter(tab: string) {
    this.filterActiveTab = tab;
  }
}
