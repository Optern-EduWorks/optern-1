import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // import FormsModule
import { ApplicationService } from '../../services/application.service';
import { SignalRService } from '../../services/signalr.service';
import { Subscription } from 'rxjs';

interface Application {
  id: number;
  name: string;
  role: string;
  company: string;
  initials: string;
  color: string;
  email: string;
  location: string;
  experience: string;
  applied: string;
  skills: string[];
  status: string;
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
export class ApplicationsManagementComponent implements OnInit, OnDestroy {
  search = "";
  filterStatus = "All Status";
  viewMode: 'grid' | 'list' = 'list';
  showDetailModal = false;
  showAnalyticsModal = false;
  selectedApplication?: Application;

  applications: any[] = [];

  private applicationService = inject(ApplicationService);
  private signalRService = inject(SignalRService);
  private subscription: Subscription = new Subscription();

  constructor() {
    this.loadApplications();
  }

  ngOnInit() {
    this.setupSignalR();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private async setupSignalR() {
    try {
      await this.signalRService.startConnection();
      console.log('SignalR connection established for recruiter applications');

      // Subscribe to dashboard updates
      this.subscription.add(
        this.signalRService.dashboardUpdates.subscribe(update => {
          if (update && update.data && (update.data.type === 'application-created' || update.data.type === 'application-status-updated' || update.data.type === 'application-deleted')) {
            console.log('Received application update:', update.data.type, 'refreshing applications');
            this.loadApplications();
          }
        })
      );
    } catch (error) {
      console.error('Error setting up SignalR connection:', error);
    }
  }

  private loadApplications() {
    this.applicationService.getByRecruiter().subscribe({
      next: (data) => {
        // Map API data to expected format
        this.applications = (data || []).map(app => ({
          id: app.ApplicationID,
          name: app.Candidate?.FullName || 'Unknown Candidate',
          role: app.Job?.Title || 'Unknown Position',
          company: app.Job?.Company?.Name || 'Unknown Company',
          initials: (app.Candidate?.FullName || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          color: this.getRandomColor(),
          email: app.Candidate?.Email || '',
          location: app.Candidate?.Address || '',
          experience: 'Not specified', // Could be added to candidate profile later
          applied: new Date(app.AppliedDate).toLocaleDateString(),
          skills: [], // Could be added to candidate profile later
          status: app.Status,
          rating: 4, // Default rating, could be added to application model
          education: 'Not specified', // Could be added to candidate profile later
          coverLetter: app.CoverLetter || '',
          phone: app.Candidate?.PhoneNumber || '',
          applicationID: app.ApplicationID,
          jobID: app.JobID,
          candidateID: app.CandidateID,
          interviewStatus: app.InterviewStatus,
          resumeUrl: app.ResumeUrl
        }));
      },
      error: (err) => {
        console.warn('Failed to load applications', err);
        this.applications = [];
      }
    });
  }

  private getRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  get filteredApplications() {
    let filtered = this.applications;

    // Filter by status
    if (this.filterStatus !== "All Status") {
      filtered = filtered.filter(app => app.status === this.filterStatus);
    }

    // Filter by search term
    if (this.search.trim()) {
      const searchTerm = this.search.toLowerCase();
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(searchTerm) ||
        app.email.toLowerCase().includes(searchTerm) ||
        app.role.toLowerCase().includes(searchTerm) ||
        app.company.toLowerCase().includes(searchTerm) ||
        app.location.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
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
  shortlist(app: Application | undefined): void {
    if (app) {
      // Update status in backend if application has id
      if ((app as any).applicationID) {
        const id = (app as any).applicationID;
        this.applicationService.update(id, { status: 'Shortlisted' }).subscribe({
          next: () => {
            (app as any).status = 'Shortlisted';
            alert('Candidate shortlisted successfully!');
          },
          error: (err) => alert('Failed to shortlist: ' + (err?.error?.message ?? err))
        });
      } else {
        (app as any).status = 'Shortlisted';
      }
    }
  }

  updateStatus(app: Application | undefined, newStatus: string): void {
    if (app) {
      if ((app as any).applicationID) {
        const id = (app as any).applicationID;
        this.applicationService.update(id, { status: newStatus }).subscribe({
          next: () => {
            (app as any).status = newStatus;
            alert(`Application status updated to ${newStatus}!`);
          },
          error: (err) => alert('Failed to update status: ' + (err?.error?.message ?? err))
        });
      }
    }
  }

  scheduleInterview(app: Application): void {
    const interviewDate = prompt('Enter interview date and time (YYYY-MM-DD HH:MM):');
    if (interviewDate) {
      if ((app as any).applicationID) {
        const id = (app as any).applicationID;
        this.applicationService.update(id, {
          status: 'Interview Scheduled',
          interviewStatus: `Interview scheduled for ${interviewDate}`
        }).subscribe({
          next: () => {
            (app as any).status = 'Interview Scheduled';
            (app as any).interviewStatus = `Interview scheduled for ${interviewDate}`;
            alert('Interview scheduled successfully!');
          },
          error: (err) => alert('Failed to schedule interview: ' + (err?.error?.message ?? err))
        });
      }
    }
  }

  scheduleInterviewFromModal(app: Application | undefined): void {
    if (app) {
      this.scheduleInterview(app);
    }
  }

  downloadResume(app: Application | undefined): void {
    if (app) {
      // Check if resume URL exists
      if ((app as any).resumeUrl) {
        window.open((app as any).resumeUrl, '_blank');
      } else {
        alert('Resume not available for this candidate');
      }
    }
  }

  getStarRating(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('bi-star-fill');
    }

    if (hasHalfStar) {
      stars.push('bi-star-half');
    }

    while (stars.length < 5) {
      stars.push('bi-star');
    }

    return stars;
  }
}
