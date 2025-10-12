import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationService, Application } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applications.html',
  styleUrl: './applications.css'
})
export class Applications {
  viewMode: 'grid' | 'list' = 'grid';
  activeFilter: string = 'All Applications';

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
    // Attempt to load real applications for the current user
    const user = this.authService.getCurrentUser();
    // If there's no logged-in user, still attempt a general fetch
    this.applicationService.getAll().subscribe({
      next: (data) => {
        this.allApplications = data || [];
        this.filteredApplications = [...this.allApplications];
        this.calculateFilterCounts();
      },
      error: (err) => {
        console.warn('Could not load applications from API, falling back to empty list', err);
        this.allApplications = [];
        this.filteredApplications = [];
        this.calculateFilterCounts();
      }
    });
  }

  calculateFilterCounts() {
    this.filterCounts = {
      'All Applications': this.allApplications.length,
      'Applied': this.allApplications.filter(app => app.status === 'Applied').length,
      'Interview Scheduled': this.allApplications.filter(app => app.status === 'Interview Scheduled').length,
      'Shortlisted': this.allApplications.filter(app => app.status === 'Shortlisted').length,
      'Rejected': this.allApplications.filter(app => app.status === 'Rejected').length
    };
  }

  setView(mode: 'grid' | 'list') { this.viewMode = mode; }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.filteredApplications = (filter === 'All Applications')
      ? [...this.allApplications]
      : this.allApplications.filter(app => app.status === filter);
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
}
