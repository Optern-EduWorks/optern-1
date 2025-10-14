import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // import FormsModule
import { ApplicationService } from '../../services/application.service';

interface Application {
  id: number;
  name: string;
  role: string;
  initials: string;
  color: string;
  email: string;
  location: string;
  experience: string;
  applied: string;
  skills: string[];
  status: 'Pending' | 'Shortlisted' | 'Reviewed' | 'Rejected' | 'Hired';
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
export class ApplicationsManagementComponent {
  search = "";
  filterStatus = "All Status";
  viewMode: 'grid' | 'list' = 'list';
  showDetailModal = false;
  showAnalyticsModal = false;
  selectedApplication?: Application;

  applications: any[] = [];

  private applicationService = inject(ApplicationService);

  constructor() {
    this.loadApplications();
  }

  private loadApplications() {
    this.applicationService.getAll().subscribe({
      next: (data) => this.applications = data || [],
      error: (err) => {
        console.warn('Failed to load applications', err);
        this.applications = [];
      }
    });
  }

  get filteredApplications() {
    if (this.filterStatus === "All Status") return this.applications;
    return this.applications.filter(app => app.status === this.filterStatus);
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
  shortlist(app: Application): void {
    // Update status in backend if application has id
    if ((app as any).applicationID) {
      const id = (app as any).applicationID;
      this.applicationService.update(id, { status: 'Shortlisted' }).subscribe({
        next: () => {
          (app as any).status = 'Shortlisted';
        },
        error: (err) => alert('Failed to shortlist: ' + (err?.error?.message ?? err))
      });
    } else {
      (app as any).status = 'Shortlisted';
    }
  }
}
