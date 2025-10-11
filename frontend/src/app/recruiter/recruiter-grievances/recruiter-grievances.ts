import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interface for Grievance data structure
interface Grievance {
  id: number;
  title: string;
  category: string;
  priority: 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'LOW PRIORITY';
  status: 'submitted' | 'in-review' | 'resolved' | 'closed';
  submittedDate: string;
  updatedDate: string;
  description: string;
  attachments: Array<{ name: string; size: string }>;
  responses: Array<{ text: string; type: 'support' | 'user' }>;
}

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
export class RecruiterGrievancesComponent {
  
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
    category: 'other',
    priority: 'medium',
    description: '',
    attachments: []
  };
  
  // Tab counts
  tabCounts = {
    all: 4,
    submitted: 1,
    inReview: 1,
    resolved: 1,
    closed: 1
  };
  
  // Grievances data
  grievances: Grievance[] = [
    {
      id: 1,
      title: 'Candidate Profile Not Loading',
      category: 'Technical Issue',
      priority: 'MEDIUM PRIORITY',
      status: 'in-review',
      submittedDate: '1/15/2024',
      updatedDate: '1/16/2024',
      description: 'I am unable to view candidate profiles on the platform. The page shows a loading spinner but never loads the actual profile information.',
      attachments: [
        { name: 'screenshot_error.png', size: '245 KB' }
      ],
      responses: [
        {
          text: 'We are investigating this issue with our technical team. This appears to be affecting a small number of recruiters.',
          type: 'support'
        }
      ]
    },
    {
      id: 2,
      title: 'Posted Job Not Appearing',
      category: 'Application Related',
      priority: 'HIGH PRIORITY',
      status: 'resolved',
      submittedDate: '1/10/2024',
      updatedDate: '1/12/2024',
      description: 'I posted a new job opportunity yesterday but it is not showing up in the opportunities list for candidates to see.',
      attachments: [],
      responses: [
        {
          text: 'This issue has been resolved. Your job posting had pending approval which has now been completed. It is now live and visible to candidates.',
          type: 'support'
        }
      ]
    },
    {
      id: 3,
      title: 'Payment Issue with Premium Features',
      category: 'Company Related',
      priority: 'HIGH PRIORITY',
      status: 'closed',
      submittedDate: '1/5/2024',
      updatedDate: '1/8/2024',
      description: 'I upgraded to premium recruiter account but I am still not able to access advanced search filters and candidate contact information.',
      attachments: [],
      responses: [
        {
          text: 'Your premium subscription has been activated successfully. All premium features are now available in your account.',
          type: 'support'
        }
      ]
    },
    {
      id: 4,
      title: 'Unable to Export Candidate Data',
      category: 'Technical Issue',
      priority: 'LOW PRIORITY',
      status: 'submitted',
      submittedDate: '1/20/2024',
      updatedDate: '1/20/2024',
      description: 'The export to CSV function is not working when I try to download candidate shortlist data.',
      attachments: [],
      responses: []
    }
  ];
  
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
  viewDetails(grievanceId: number): void {
    this.selectedGrievance = this.grievances.find(g => g.id === grievanceId) || null;
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
   * Handle file upload
   */
  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.grievanceForm.attachments = Array.from(files);
    }
  }
  
  /**
   * Submit grievance form
   */
  submitGrievance(): void {
    console.log('Submitting grievance:', this.grievanceForm);
    // TODO: Implement API call to submit grievance
    this.closeSubmitModal();
    // Show success message or refresh list
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
}
