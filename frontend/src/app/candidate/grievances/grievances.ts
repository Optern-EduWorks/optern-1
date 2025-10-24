import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GrievanceService, Grievance, CreateGrievanceRequest } from '../../services/grievance.service';
import { AuthService } from '../../services/auth.service';

interface GrievanceFormData {
  title: string;
  category: string;
  priority: string;
  description: string;
}

@Component({
  selector: 'app-grievances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grievances.html',
  styleUrl: './grievances.css'
})
export class Grievances implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Modal visibility states
  isSubmitModalVisible = false;
  isDetailsModalVisible = false;

  // Data holders
  selectedGrievance: Grievance | null = null;
  activeFilter: string = 'All Grievances';

  // API data
  allGrievances: Grievance[] = [];
  filteredGrievances: Grievance[] = [];
  filterCounts: { [key: string]: number } = {};

  // Loading and error states
  isLoading = false;
  error: string | null = null;

  // Form data
  grievanceForm: GrievanceFormData = {
    title: '',
    category: 'Other',
    priority: 'Medium',
    description: ''
  };

  // File upload
  selectedFile: File | null = null;
  isUploading = false;
  isSubmitting = false;

  // Current user information
  currentUser: any = null;

  // Get current user ID from auth service
  get currentUserId(): number {
    return this.currentUser?.userId || 1;
  }

  constructor(private grievanceService: GrievanceService, private authService: AuthService) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadGrievances();
  }

  private loadCurrentUser() {
    this.currentUser = this.authService.getCurrentUser();
    // Also subscribe to auth state changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGrievances() {
    this.isLoading = true;
    this.error = null;
    console.log('Loading grievances for user:', this.currentUserId);

    this.grievanceService.getGrievancesByUser(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (grievances) => {
          console.log('Successfully loaded grievances from API:', grievances);
          this.allGrievances = grievances || [];
          this.filteredGrievances = [...this.allGrievances];
          this.calculateFilterCounts();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading grievances from API:', error);
          this.error = error.message;
          this.allGrievances = [];
          this.filteredGrievances = [];
          this.calculateFilterCounts();
          this.isLoading = false;
        }
      });
  }

  // --- Modal Control ---
  openSubmitModal() {
    this.isSubmitModalVisible = true;
    this.resetForm();
  }

  closeSubmitModal() {
    this.isSubmitModalVisible = false;
    this.resetForm();
  }

  openDetailsModal(grievance: Grievance) {
    this.selectedGrievance = grievance;
    this.isDetailsModalVisible = true;
  }

  closeDetailsModal() {
    this.isDetailsModalVisible = false;
    setTimeout(() => this.selectedGrievance = null, 300);
  }

  // --- Form Handling ---
  resetForm() {
    this.grievanceForm = {
      title: '',
      category: 'Other',
      priority: 'Medium',
      description: ''
    };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        this.error = 'File size cannot exceed 10MB.';
        return;
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Invalid file type. Allowed types: PNG, JPG, PDF, DOC, DOCX.';
        return;
      }

      this.selectedFile = file;
      this.error = null;
    }
  }

  submitGrievance() {
    if (!this.grievanceForm.title.trim() || !this.grievanceForm.description.trim()) {
      this.error = 'Please fill in all required fields.';
      return;
    }

    this.error = null;
    this.isSubmitting = true;

    if (this.selectedFile) {
      // Submit with file attachment
      this.submitGrievanceWithFile();
    } else {
      // Submit without file
      this.submitGrievanceWithoutFile();
    }
  }

  private submitGrievanceWithoutFile() {
    const grievanceData: CreateGrievanceRequest = {
      submittedBy: this.currentUserId,
      title: this.grievanceForm.title.trim(),
      description: this.grievanceForm.description.trim(),
      priority: this.grievanceForm.priority,
      status: 'Submitted'
    };

    // For demo purposes, immediately add to the list
    const newGrievance: Grievance = {
      greivanceID: Date.now(), // Temporary ID
      submittedBy: this.currentUserId,
      title: grievanceData.title,
      description: grievanceData.description,
      priority: grievanceData.priority,
      status: 'Submitted',
      createdDate: new Date().toISOString()
    };

    this.allGrievances.unshift(newGrievance);
    this.calculateFilterCounts();
    this.setFilter(this.activeFilter);
    this.closeSubmitModal();
    this.selectedFile = null;
    this.isSubmitting = false;

    // Also try to submit to API in background
    this.grievanceService.createGrievance(grievanceData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apiGrievance) => {
          console.log('Successfully submitted to API:', apiGrievance);
          // Replace the temporary grievance with the real one from API
          const index = this.allGrievances.findIndex(g => g.greivanceID === newGrievance.greivanceID);
          if (index !== -1) {
            this.allGrievances[index] = apiGrievance;
            this.calculateFilterCounts();
          }
        },
        error: (error) => {
          console.error('Error submitting to API:', error);
          // Keep the temporary grievance as fallback
        }
      });
  }

  private submitGrievanceWithFile() {
    // For demo purposes, immediately add to the list
    const newGrievance: Grievance = {
      greivanceID: Date.now(), // Temporary ID
      submittedBy: this.currentUserId,
      title: this.grievanceForm.title.trim(),
      description: this.grievanceForm.description.trim(),
      priority: this.grievanceForm.priority,
      status: 'Submitted',
      createdDate: new Date().toISOString()
    };

    this.allGrievances.unshift(newGrievance);
    this.calculateFilterCounts();
    this.setFilter(this.activeFilter);
    this.closeSubmitModal();
    this.selectedFile = null;
    this.isSubmitting = false;

    // Also try to submit to API in background
    const formData = new FormData();
    formData.append('submittedBy', this.currentUserId.toString());
    formData.append('title', this.grievanceForm.title.trim());
    formData.append('description', this.grievanceForm.description.trim());
    formData.append('priority', this.grievanceForm.priority);
    formData.append('attachment', this.selectedFile!);

    this.grievanceService.createGrievanceWithAttachment(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apiGrievance) => {
          console.log('Successfully submitted to API:', apiGrievance);
          // Replace the temporary grievance with the real one from API
          const index = this.allGrievances.findIndex(g => g.greivanceID === newGrievance.greivanceID);
          if (index !== -1) {
            this.allGrievances[index] = apiGrievance;
            this.calculateFilterCounts();
          }
        },
        error: (error) => {
          console.error('Error submitting to API:', error);
          // Keep the temporary grievance as fallback
        }
      });
  }

  // --- Filtering Logic ---
  calculateFilterCounts() {
    this.filterCounts = {
      'All Grievances': this.allGrievances.length,
      'Submitted': this.allGrievances.filter(g => g.status === 'Submitted').length,
      'In Review': this.allGrievances.filter(g => g.status === 'In Review').length,
      'Resolved': this.allGrievances.filter(g => g.status === 'Resolved').length,
      'Closed': this.allGrievances.filter(g => g.status === 'Closed').length,
    };
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.filteredGrievances = (filter === 'All Grievances')
      ? [...this.allGrievances]
      : this.allGrievances.filter(g => g.status === filter);
  }

  // --- Helper Methods ---
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase().replace(' ', '-')}`;
  }
}
