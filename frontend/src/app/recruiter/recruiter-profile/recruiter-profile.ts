import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interface for Personal Information
interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joinDate: string;
  employeeId: string;
}

// Interface for Company Information
interface CompanyInfo {
  name: string;
  industry: string;
  website: string;
  headquarters: string;
  companySize: string;
  founded: string;
  benefits: string[];
  about: string;
  culture: string;
}

// Interface for Recruitment Statistics
interface RecruitmentStats {
  totalHires: number;
  activeJobs: number;
  monthlyApplications: number;
  successRate: number;
  avgTimeToHire: number;
  candidateSatisfaction: number;
  newHires: number;
  interviewsScheduled: number;
  offersExtended: number;
}

@Component({
  selector: 'app-recruiter-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruiter-profile.html',
  styleUrls: ['./recruiter-profile.css']
})
export class RecruiterProfileComponent {
  
  // === PROPERTIES ===
  
  // Active tab
  activeTab: string = 'personal';
  
  // Edit mode
  isEditMode: boolean = false;
  
  // User profile header
  userProfile = {
    initials: 'JR',
    fullName: 'Jane Recruiter',
    title: 'Senior Talent Acquisition Manager',
    company: 'TechCorp Inc',
    email: 'jane.recruiter@techcorp.com',
    memberSince: 'Since 2022'
  };
  
  // Personal Information
  personalInfo: PersonalInfo = {
    firstName: 'Jane',
    lastName: 'Recruiter',
    email: 'jane.recruiter@techcorp.com',
    phone: '+1 (555) 987-6543',
    position: 'Senior Talent Acquisition Manager',
    department: 'Human Resources',
    joinDate: '3/15/2022',
    employeeId: 'TC-HR-1001'
  };
  
  // Company Information
  companyInfo: CompanyInfo = {
    name: 'TechCorp Inc',
    industry: 'Technology',
    website: 'https://techcorp.com',
    headquarters: 'San Francisco, CA',
    companySize: '1000-5000 employees',
    founded: '2015',
    benefits: ['Health Insurance', 'Flexible Work', 'Stock Options', 'Professional Development'],
    about: 'Leading technology company focused on innovative solutions for modern businesses.',
    culture: 'Innovation-driven, collaborative, and inclusive workplace with focus on work-life balance.'
  };
  
  // Recruitment Statistics
  recruitmentStats: RecruitmentStats = {
    totalHires: 45,
    activeJobs: 8,
    monthlyApplications: 156,
    successRate: 78,
    avgTimeToHire: 18,
    candidateSatisfaction: 4.6,
    newHires: 12,
    interviewsScheduled: 23,
    offersExtended: 8
  };
  
  // === PUBLIC METHODS ===
  
  /**
   * Set active tab
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.isEditMode = false; // Reset edit mode when switching tabs
  }
  
  /**
   * Toggle edit mode
   */
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }
  
  /**
   * Save profile changes
   */
  saveProfile(): void {
    console.log('Saving profile:', this.personalInfo);
    // TODO: Implement API call to save profile
    this.isEditMode = false;
    // Show success message
  }
  
  /**
   * Cancel edit mode
   */
  cancelEdit(): void {
    this.isEditMode = false;
    // TODO: Reset form data to original values
  }
  
  /**
   * Get stat card color class
   */
  getStatCardClass(index: number): string {
    const classes = ['stat-card-green', 'stat-card-blue', 'stat-card-orange', 'stat-card-purple'];
    return classes[index % classes.length];
  }
}
