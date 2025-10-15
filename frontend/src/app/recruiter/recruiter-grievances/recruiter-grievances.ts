import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GrievanceService, Grievance, GrievanceDisplay, CreateGrievanceRequest } from '../../services/grievance.service';

// Interface for Grievance Form
interface GrievanceForm {
  title: string;
  category: string;
  priority: string;
  description: string;
  attachments: File[];
}

@Component({
  selector: 'app-recruiter-grievances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruiter-grievances.html',
  styleUrls: ['./recruiter-grievances.css']
})
export class RecruiterGrievancesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // === PROPERTIES ===

  // Active tab filter
  activeTab: string = 'all';

  // Modal visibility states
  showSubmitModal: boolean = false;
  showDetailModal: boolean = false;

  // Selected grievance for detail view
  selectedGrievance: Grievance | null = null;

  // Form data
  grievanceForm: GrievanceForm = {
    title: '',
    category: 'Other',
    priority: 'Medium',
    description: '',
    attachments: []
  };

  // Loading and error states
  isLoading = false;
  error: string | null = null;

  // Tab counts (will be calculated from API data)
  tabCounts = {
    all: 0,
    submitted: 0,
    inReview: 0,
    resolved: 0,
    closed: 0
  };

  // API data - all grievances from API
  grievances: Grievance[] = [];

  // File upload
  selectedFile: File | null = null;
  isSubmitting = false;

  // Current user ID (placeholder - should come from auth service)
  currentUserId = 2; // Different from candidate (user ID 1)

  constructor(private grievanceService: GrievanceService) {}

  ngOnInit() {
    this.loadGrievances();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGrievances() {
    this.isLoading = true;
    this.error = null;

    // For recruiters, we'll load all grievances (they can see all grievances)
    this.grievanceService.getAllGrievances()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (grievances) => {
          this.grievances = grievances;
          this.calculateTabCounts();
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
          console.error('Error loading grievances:', error);
        }
      });
  }

  calculateTabCounts() {
    this.tabCounts = {
      all: this.grievances.length,
      submitted: this.grievances.filter(g => g.status.toLowerCase() === 'submitted').length,
      inReview: this.grievances.filter(g => g.status.toLowerCase() === 'in review').length,
      resolved: this.grievances.filter(g => g.status.toLowerCase() === 'resolved').length,
      closed: this.grievances.filter(g => g.status.toLowerCase() === 'closed').length
    };
  }

  // === COMPUTED PROPERTIES ===
  
  /**
   * Get filtered grievances based on active tab
   */
  get filteredGrievances(): Grievance[] {
    if (this.activeTab === 'all') {
      return this.grievances;
    }
    
    const statusMap: { [key: string]: string } = {
      'submitted': 'submitted',
      'in-review': 'in-review',
      'resolved': 'resolved',
      'closed': 'closed'
    };
    
    return this.grievances.filter(g => g.status === statusMap[this.activeTab]);
  }
  
  // === PUBLIC METHODS ===
  
  /**
   * Set active tab filter
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  /**
   * Open submit grievance modal
   */
  openSubmitModal(): void {
    this.showSubmitModal = true;
    this.resetForm();
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Close submit grievance modal
   */
  closeSubmitModal(): void {
    this.showSubmitModal = false;
    document.body.style.overflow = 'auto';
  }
  
  /**
   * Open grievance detail modal
   */
  viewDetails(grievanceId: number | undefined): void {
    if (grievanceId === undefined) return;

    this.selectedGrievance = this.grievances.find(g => g.greivanceID === grievanceId) || null;
    this.showDetailModal = true;
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Close grievance detail modal
   */
  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedGrievance = null;
    document.body.style.overflow = 'auto';
  }
  
  /**
   * Handle file selection
   */
  onFileSelected(event: any): void {
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

  /**
   * Submit grievance form
   */
  submitGrievance(): void {
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

  private submitGrievanceWithoutFile(): void {
    const grievanceData: CreateGrievanceRequest = {
      submittedBy: this.currentUserId,
      title: this.grievanceForm.title.trim(),
      description: this.grievanceForm.description.trim(),
      priority: this.grievanceForm.priority,
      status: 'Submitted'
    };

    this.grievanceService.createGrievance(grievanceData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newGrievance) => {
          this.grievances.unshift(newGrievance);
          this.calculateTabCounts();
          this.closeSubmitModal();
          this.selectedFile = null;
          this.isSubmitting = false;
        },
        error: (error) => {
          this.error = error.message;
          this.isSubmitting = false;
          console.error('Error creating grievance:', error);
        }
      });
  }

  private submitGrievanceWithFile(): void {
    const formData = new FormData();
    formData.append('submittedBy', this.currentUserId.toString());
    formData.append('title', this.grievanceForm.title.trim());
    formData.append('description', this.grievanceForm.description.trim());
    formData.append('priority', this.grievanceForm.priority);
    formData.append('attachment', this.selectedFile!);

    this.grievanceService.createGrievanceWithAttachment(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newGrievance) => {
          this.grievances.unshift(newGrievance);
          this.calculateTabCounts();
          this.closeSubmitModal();
          this.selectedFile = null;
          this.isSubmitting = false;
        },
        error: (error) => {
          this.error = error.message;
          this.isSubmitting = false;
          console.error('Error creating grievance with attachment:', error);
        }
      });
  }
  
  /**
   * Reset form data
   */
  resetForm(): void {
    this.grievanceForm = {
      title: '',
      category: 'other',
      priority: 'medium',
      description: '',
      attachments: []
    };
  }
  
  /**
   * Get status display text
   */
  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'submitted': 'Submitted',
      'in-review': 'In Review',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    return statusMap[status] || status;
  }
  
  /**
   * Get status badge class
   */
  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'submitted': 'status-submitted',
      'in-review': 'status-in-review',
      'resolved': 'status-resolved',
      'closed': 'status-closed'
    };
    return classMap[status] || '';
  }
  
  /**
   * Get priority badge class
   */
  getPriorityClass(priority: string): string {
    if (priority.includes('HIGH')) return 'priority-high';
    if (priority.includes('MEDIUM')) return 'priority-medium';
    if (priority.includes('LOW')) return 'priority-low';
    return '';
  }
  
  /**
   * Download attachment
   */
  downloadAttachment(attachment: { name: string; size: string }): void {
    console.log('Downloading:', attachment.name);
    // TODO: Implement download logic
  }

  /**
   * Format date helper method
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
