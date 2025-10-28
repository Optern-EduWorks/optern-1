import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { SignalRService } from '../../services/signalr.service';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './applications.html',
  styleUrl: './applications.css'
})
export class Applications implements OnInit, OnDestroy {
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
  private signalRService = inject(SignalRService);
  private subscription: Subscription = new Subscription();

  filteredApplications = [...this.allApplications];
  filterCounts: { [key: string]: number } = {};

  constructor() {}

  ngOnInit() {
    this.loadApplications();
    this.setupSignalR();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private async setupSignalR() {
    try {
      await this.signalRService.startConnection();
      console.log('SignalR connection established for candidate applications');

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

  trackByApplicationId(index: number, app: any): any {
    return app.ApplicationID;
  }

  private loadApplications() {
    // Load real applications from the API
    this.applicationService.getByCandidate().subscribe({
      next: (data) => {
        console.log('Raw API response in loadApplications:', data);

        // Handle ASP.NET Core array serialization with $values wrapper
        let applications: any[] = [];
        if (data && (data as any).$values && Array.isArray((data as any).$values)) {
          applications = (data as any).$values;
          console.log('Extracted applications from $values wrapper:', applications.length);
        } else if (data && Array.isArray(data)) {
          applications = data;
          console.log('Data is already an array:', applications.length);
        } else {
          console.log('Unexpected data format:', typeof data, data);
        }

        console.log('Applications array before processing:', applications);

        if (applications.length > 0) {
          this.allApplications = applications.map(app => {
            // Clean the application object to remove $id, $ref, $values properties
            const cleanedApp = this.cleanObject(app);
            return {
              ...cleanedApp,
              Status: cleanedApp.Status || 'Applied', // Ensure Status has a default value
              interviewDate: this.extractInterviewDate(cleanedApp.InterviewStatus)
            };
          });
          console.log(`Loaded ${this.allApplications.length} real applications after cleaning`);
          console.log('First application sample:', this.allApplications[0]);
        } else {
          this.allApplications = [];
          console.log('No applications found');
        }
        this.filteredApplications = [...this.allApplications];
        this.calculateFilterCounts();
      },
      error: (err) => {
        console.error('Could not load applications from API:', err);
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

  private cleanObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanObject(item));
    }

    const cleaned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && !key.startsWith('$')) {
        cleaned[key] = this.cleanObject(obj[key]);
      }
    }
    return cleaned;
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
