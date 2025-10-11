import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for the form

@Component({
  selector: 'app-grievances',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule here
  templateUrl: './grievances.html',
  styleUrl: './grievances.css'
})
export class Grievances {
  // Modal visibility states
  isSubmitModalVisible = false;
  isDetailsModalVisible = false;

  // Data holders
  selectedGrievance: any = null;
  activeFilter: string = 'All Grievances';

  // Sample data for the grievances list
  allGrievances = [
    {
      id: 1,
      title: 'Application Status Not Updated',
      category: 'Application Release',
      priority: 'MEDIUM PRIORITY',
      status: 'In Review',
      submitted: '1/15/2024',
      updated: '1/16/2024',
      description: "I applied for a software engineer position at TechCorp two weeks ago, but the status still shows as 'applied' even though I was told I would hear back within a week.",
      attachments: [
        { name: 'application_screenshot.png', size: '245 KB' },
        { name: 'email_confirmation.pdf', size: '88 KB' }
      ],
      supportResponse: 'We are looking into this issue and have contacted the company to update your application status.'
    },
    {
      id: 2,
      title: 'Website Login Issues',
      category: 'Technical Issue',
      priority: 'HIGH PRIORITY',
      status: 'Resolved',
      submitted: '1/10/2024',
      updated: '1/12/2024',
      description: "I am unable to log into the OPTERN platform. It keeps showing 'invalid credentials' even though I am using the correct email and password.",
      attachments: [],
      supportResponse: 'This issue has been resolved. Your account had a temporary lock that has now been removed. You should be able to log in normally.'
    },
    {
      id: 3,
      title: 'Inappropriate Interview Questions',
      category: 'Discrimination',
      priority: 'HIGH PRIORITY',
      status: 'Submitted',
      submitted: '1/18/2024',
      updated: '1/18/2024',
      description: 'During my interview with DataFlow Inc, the interviewer asked personal questions about my family planning and marital status, which I believe are inappropriate and discriminatory.',
      attachments: [],
      supportResponse: null
    }
  ];

  filteredGrievances = [...this.allGrievances];
  filterCounts: { [key: string]: number } = {};

  constructor() {
    this.calculateFilterCounts();
  }

  // --- Modal Control ---
  openSubmitModal() { this.isSubmitModalVisible = true; }
  closeSubmitModal() { this.isSubmitModalVisible = false; }
  openDetailsModal(grievance: any) {
    this.selectedGrievance = grievance;
    this.isDetailsModalVisible = true;
  }
  closeDetailsModal() {
    this.isDetailsModalVisible = false;
    setTimeout(() => this.selectedGrievance = null, 300);
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
}
