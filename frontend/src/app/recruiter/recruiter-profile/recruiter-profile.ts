import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruiterService, RecruiterProfile } from '../../services/recruiter.service';

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
  
  // Loading state
  isLoading: boolean = true;
  
  // Error state
  errorMessage: string | null = null;
  
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
  
  // Service injection
  private recruiterService = inject(RecruiterService);
  
  // Real profile data
  realProfile: RecruiterProfile | null = null;
  
  constructor() {
    this.loadProfile();
  }
  
  // === PRIVATE METHODS ===
  
  /**
   * Load recruiter profile from API
   */
  private loadProfile() {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.recruiterService.getProfile().subscribe({
      next: (profile) => {
        this.realProfile = profile;
        this.updateLocalData(profile);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load recruiter profile:', err);
        this.errorMessage = 'Failed to load profile data';
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Update local data with real profile data
   */
  private updateLocalData(profile: RecruiterProfile) {
    // Update user profile header
    this.userProfile = {
      initials: this.getInitials(profile.fullName),
      fullName: profile.fullName,
      title: profile.jobTitle,
      company: profile.company?.name || 'Unknown Company',
      email: profile.email,
      memberSince: 'Since 2022' // This could be calculated from createdDate
    };
    
    // Update personal info
    const nameParts = profile.fullName.split(' ');
    this.personalInfo = {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: profile.email,
      phone: profile.phoneNumber || '',
      position: profile.jobTitle,
      department: 'Human Resources', // Default value
      joinDate: '3/15/2022', // This could be calculated from createdDate
      employeeId: `TC-HR-${profile.recruiterID}` // Generate from recruiter ID
    };
    
    // Update company info if available
    if (profile.company) {
      this.companyInfo = {
        name: profile.company.name,
        industry: profile.company.industry?.industryName || 'Technology',
        website: profile.company.website || 'https://example.com',
        headquarters: profile.company.address || 'Not specified',
        companySize: profile.company.size || 'Not specified',
        founded: '2015', // Default value
        benefits: ['Health Insurance', 'Flexible Work', 'Stock Options', 'Professional Development'],
        about: 'Leading technology company focused on innovative solutions for modern businesses.',
        culture: 'Innovation-driven, collaborative, and inclusive workplace with focus on work-life balance.'
      };
    }
  }
  
  /**
   * Get initials from full name
   */
  private getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
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
    if (!this.realProfile) {
      console.error('No profile data available');
      return;
    }
    
    const updateData = {
      fullName: `${this.personalInfo.firstName} ${this.personalInfo.lastName}`.trim(),
      jobTitle: this.personalInfo.position,
      phoneNumber: this.personalInfo.phone,
      bio: this.personalInfo.department // Using department as bio for now
    };
    
    this.recruiterService.updateProfile(updateData).subscribe({
      next: () => {
        console.log('Profile updated successfully');
        this.isEditMode = false;
        // Reload profile to get updated data
        this.loadProfile();
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.errorMessage = 'Failed to update profile';
      }
    });
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
  
  /**
   * Reload profile data (public method for retry button)
   */
  public reloadProfile(): void {
    this.loadProfile();
  }
}
