import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';



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


  filteredApplications = [...this.allApplications];
  filterCounts: { [key: string]: number } = {};

  constructor() {
    this.loadApplications();
  }

  private loadApplications() {
    // Load real applications from the API
    this.applicationService.getByCandidate().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.allApplications = (data || []).map(app => ({
            ...app,
            interviewDate: this.extractInterviewDate(app.InterviewStatus)
          }));
          console.log(`Loaded ${this.allApplications.length} real applications`);
        } else {
          // No applications found - show empty state instead of dummy data
          this.allApplications = [];
          console.log('No applications found for this candidate');
        }
        this.filteredApplications = [...this.allApplications];
        this.calculateFilterCounts();
      },
      error: (err) => {
        console.error('Could not load applications from API:', err);
        // On error, show empty state instead of dummy data
        this.allApplications = [];
        this.filteredApplications = [];
        this.filterCounts = {
          'All Applications': 0,
          'Applied': 0,
          'Interview Scheduled': 0,
          'Shortlisted': 0,
          'Rejected': 0
        };
      }
    });
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
