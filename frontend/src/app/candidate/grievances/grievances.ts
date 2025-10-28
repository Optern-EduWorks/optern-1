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
  selectedGrievanceCategory: string = '';

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

    // Try to load from localStorage first
    const localGrievances = this.getGrievancesFromStorage();
    if (localGrievances.length > 0) {
      console.log('Loaded grievances from localStorage:', localGrievances);
      this.allGrievances = localGrievances;
      this.filteredGrievances = [...this.allGrievances];
      this.calculateFilterCounts();
      this.isLoading = false;
      return;
    }

    // Fallback to API
    this.grievanceService.getGrievancesByUser(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (grievances) => {
          console.log('Successfully loaded grievances from API:', grievances);
          this.allGrievances = grievances || [];
          this.filteredGrievances = [...this.allGrievances];
          this.calculateFilterCounts();
          this.saveGrievancesToStorage();
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
    // Get category from the grievance data, not the form
    this.selectedGrievanceCategory = (grievance as any).category || 'Other';
    console.log('Opening details modal for grievance:', grievance);
    console.log('Attachment file name:', (grievance as any).attachmentFileName);
    console.log('Attachment file size:', (grievance as any).attachmentFileSize);
    console.log('Category:', (grievance as any).category);
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
    const newGrievance: any = {
      greivanceID: Date.now(), // Temporary ID
      submittedBy: this.currentUserId,
      title: grievanceData.title,
      description: grievanceData.description,
      priority: grievanceData.priority,
      category: this.grievanceForm.category,
      status: 'Submitted',
      createdDate: new Date().toISOString()
    };

    this.allGrievances.unshift(newGrievance);
    this.calculateFilterCounts();
    this.setFilter(this.activeFilter);
    this.closeSubmitModal();
    this.selectedFile = null;
    this.isSubmitting = false;

    // Save to localStorage
    this.saveGrievancesToStorage();

    // For demo purposes, keep the temporary grievance
    console.log('Grievance submitted locally:', newGrievance);
  }

  private submitGrievanceWithFile() {
    // For demo purposes, immediately add to the list
    const newGrievance: any = {
      greivanceID: Date.now(), // Temporary ID
      submittedBy: this.currentUserId,
      title: this.grievanceForm.title.trim(),
      description: this.grievanceForm.description.trim(),
      priority: this.grievanceForm.priority,
      category: this.grievanceForm.category,
      status: 'Submitted',
      createdDate: new Date().toISOString(),
      attachmentFileName: this.selectedFile?.name,
      attachmentFilePath: `/uploads/grievances/${this.selectedFile?.name}`,
      attachmentFileSize: this.selectedFile?.size
    };

    this.allGrievances.unshift(newGrievance);
    this.calculateFilterCounts();
    this.setFilter(this.activeFilter);
    this.closeSubmitModal();
    this.selectedFile = null;
    this.isSubmitting = false;

    // Save to localStorage
    this.saveGrievancesToStorage();

    // For demo purposes, keep the temporary grievance
    console.log('Grievance with file submitted locally:', newGrievance);
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

  // --- Delete Functionality ---
  deleteGrievance(grievance: Grievance) {
    if (!confirm(`Are you sure you want to delete the grievance "${grievance.title}"? This action cannot be undone.`)) {
      return;
    }

    this.error = null;
    const grievanceId = grievance.greivanceID;

    if (!grievanceId) {
      this.error = 'Invalid grievance ID. Cannot delete.';
      return;
    }

    // Remove from local array
    this.allGrievances = this.allGrievances.filter(g => g.greivanceID !== grievanceId);
    this.calculateFilterCounts();
    this.setFilter(this.activeFilter);

    // Save to localStorage
    this.saveGrievancesToStorage();

    console.log('Deleted grievance locally:', grievanceId);
  }

  // --- Local Storage Methods ---
  private getGrievancesFromStorage(): Grievance[] {
    try {
      const stored = localStorage.getItem(`grievances_${this.currentUserId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  private saveGrievancesToStorage(): void {
    try {
      localStorage.setItem(`grievances_${this.currentUserId}`, JSON.stringify(this.allGrievances));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
