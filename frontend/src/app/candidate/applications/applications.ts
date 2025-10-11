import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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

    allApplications = [
    {
      logo: 'https://i.imgur.com/2JV8V4A.png',
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$80,000 - $120,000',
      appliedDate: '1/15/2024',
      status: 'Interview Scheduled',
      interviewDate: '1/25/2024',
      description: 'We are seeking a skilled Frontend Developer to join our dynamic team.',
      requirements: ['HTML', 'CSS', 'JavaScript', 'Angular'],
      // Standardized properties
      remote: true,
      hybrid: false,
      onsite: false,
    },
    {
      logo: 'https://i.imgur.com/5g2x4sB.png',
      title: 'Data Science Intern',
      company: 'DataFlow Inc',
      location: 'New York, NY',
      type: 'Internship',
      salary: '$25/hour',
      appliedDate: '1/12/2024',
      status: 'Shortlisted',
      description: 'Work with our data science team to analyze complex datasets and build machine learning models.',
      requirements: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
      // Standardized properties
      remote: false,
      hybrid: true,
      onsite: false,
    },
    {
      logo: 'https://i.imgur.com/s65r3vV.png',
      title: 'UX Designer',
      company: 'Design Studio',
      location: 'Remote',
      type: 'Contract',
      salary: '$60,000 - $85,000',
      appliedDate: '1/10/2024',
      status: 'Applied',
      description: 'Create beautiful and intuitive user experiences for our next-gen products.',
      requirements: ['Figma', 'Sketch', 'User Research'],
      // Standardized properties
      remote: true,
      hybrid: false,
      onsite: false,
    },
    {
      logo: 'https://i.imgur.com/PvYpGk5.png',
      title: 'Backend Engineer',
      company: 'CloudTech',
      location: 'Austin, TX',
      type: 'Full-time',
      salary: '$90,000 - $140,000',
      appliedDate: '1/8/2024',
      status: 'Rejected',
      description: 'Build and maintain our server-side logic, databases, and APIs.',
      requirements: ['Node.js', 'Express', 'PostgreSQL'],
      // Standardized properties
      remote: false,
      hybrid: false,
      onsite: true,
    },
    {
      logo: 'https://i.imgur.com/2JV8V4A.png',
      title: 'Product Manager Intern',
      company: 'StartupXYZ',
      location: 'Seattle, WA',
      type: 'Internship',
      salary: '$22/hour',
      appliedDate: '1/5/2024',
      status: 'Applied',
      description: 'Help guide the development of our core product features from concept to launch.',
      requirements: ['Agile', 'JIRA', 'Market Research'],
      // Standardized properties
      remote: false,
      hybrid: true,
      onsite: false,
    }
  ];


  filteredApplications = [...this.allApplications];
  filterCounts: { [key: string]: number } = {};

  constructor() {
    this.calculateFilterCounts();
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
