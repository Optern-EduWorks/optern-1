import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruiterProfileService } from '../../services/recruiter-profile.service';
import { CompanyService, CompanyUpdateDto } from '../../services/company.service';
import { RecruiterProfile, Company } from '../../models/recruiter-profile.model';

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
  address: string;
  companySize: string;
  phone: string;
  benefits: string[];
  about: string;
  culture: string;
  headquarters?: string;
  founded?: string;
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
export class RecruiterProfileComponent implements OnInit {

  // === PROPERTIES ===

  // Active tab
  activeTab: string = 'personal';

  // Edit mode
  isEditMode: boolean = false;

  // Company edit mode
  isCompanyEditMode: boolean = false;

  // Loading state
  isLoading: boolean = true;

  // Error state
  errorMessage: string = '';

  // Recruiter profile data from backend
  recruiterProfile: RecruiterProfile | null = null;

  // User profile header (computed from recruiterProfile)
  get userProfile() {
    if (!this.recruiterProfile) {
      return {
        initials: 'R',
        fullName: 'Loading...',
        title: 'Recruiter',
        company: 'Company',
        email: '',
        memberSince: 'Loading...'
      };
    }

    const names = this.recruiterProfile.fullName.split(' ');
    const initials = names.length >= 2
      ? names[0].charAt(0) + names[1].charAt(0)
      : names[0].charAt(0);

    return {
      initials: initials.toUpperCase(),
      fullName: this.recruiterProfile.fullName,
      title: this.recruiterProfile.jobTitle,
      company: 'Company', // Will be populated from company data
      email: this.recruiterProfile.email,
      memberSince: `Since ${this.recruiterProfile.createdDate.getFullYear()}`
    };
  }

  // Editable personal information (separate from computed getter)
  editablePersonalInfo: PersonalInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    joinDate: '',
    employeeId: ''
  };

  // Editable company information
  editableCompanyInfo: CompanyInfo = {
    name: '',
    industry: '',
    website: '',
    address: '',
    companySize: '',
    phone: '',
    benefits: [],
    about: '',
    culture: ''
  };

  // Personal Information (computed from recruiterProfile)
  get personalInfo(): PersonalInfo {
    if (!this.recruiterProfile) {
      return {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        joinDate: '',
        employeeId: ''
      };
    }

    const names = this.recruiterProfile.fullName.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    return {
      firstName: firstName,
      lastName: lastName,
      email: this.recruiterProfile.email,
      phone: this.recruiterProfile.phoneNumber,
      position: this.recruiterProfile.jobTitle,
      department: 'Human Resources', // Default department
      joinDate: this.recruiterProfile.createdDate.toLocaleDateString(),
      employeeId: `R-${this.recruiterProfile.recruiterID.toString().padStart(4, '0')}`
    };
  }

  // Company Information
  companyInfo: CompanyInfo = {
    name: 'TechCorp Inc',
    industry: 'Technology',
    website: 'https://techcorp.com',
    address: 'San Francisco, CA',
    companySize: '1000-5000 employees',
    phone: '+1 (555) 123-4567',
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

  constructor(private recruiterProfileService: RecruiterProfileService, private companyService: CompanyService) {}

  // === LIFECYCLE METHODS ===

  ngOnInit(): void {
    this.loadProfile();
  }

  // Initialize editable form data when profile loads
  private initializeEditableForm(): void {
    if (this.recruiterProfile) {
      const names = this.recruiterProfile.fullName.split(' ');
      this.editablePersonalInfo = {
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: this.recruiterProfile.email,
        phone: this.recruiterProfile.phoneNumber,
        position: this.recruiterProfile.jobTitle,
        department: 'Human Resources', // Default department
        joinDate: this.recruiterProfile.createdDate.toLocaleDateString(),
        employeeId: `R-${this.recruiterProfile.recruiterID.toString().padStart(4, '0')}`
      };

      // Initialize company info from backend data if available
      if (this.recruiterProfile.company) {
        this.companyInfo = {
          name: this.recruiterProfile.company.name,
          industry: this.recruiterProfile.company.industry?.name || 'Technology',
          website: this.recruiterProfile.company.website,
          address: this.recruiterProfile.company.address,
          companySize: this.recruiterProfile.company.size,
          phone: this.recruiterProfile.company.phone,
          benefits: ['Health Insurance', 'Flexible Work', 'Stock Options', 'Professional Development'], // Default benefits
          about: 'Leading technology company focused on innovative solutions for modern businesses.',
          culture: 'Innovation-driven, collaborative, and inclusive workplace with focus on work-life balance.',
          headquarters: '',
          founded: ''
        };
      }

      // Initialize editable company info
      this.editableCompanyInfo = { ...this.companyInfo };
    }
  }

  // === PUBLIC METHODS ===

  /**
   * Load recruiter profile from backend
   */
  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.recruiterProfileService.getProfile().subscribe({
      next: (profile) => {
        console.log('Profile loaded:', profile);
        this.recruiterProfile = profile;
        this.initializeEditableForm(); // Initialize form data after loading profile
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = error.message || 'Failed to load profile';
        this.isLoading = false;
      }
    });
  }

  /**
   * Set active tab
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.isEditMode = false; // Reset edit mode when switching tabs
    this.isCompanyEditMode = false; // Reset company edit mode when switching tabs
  }

  /**
   * Toggle edit mode
   */
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  /**
   * Toggle company edit mode
   */
  toggleCompanyEditMode(): void {
    this.isCompanyEditMode = !this.isCompanyEditMode;
  }

  /**
   * Save profile changes
   */
  saveProfile(): void {
    if (!this.recruiterProfile) {
      console.error('No profile to save');
      this.errorMessage = 'No profile data available to save';
      return;
    }

    if (!this.recruiterProfile.recruiterID) {
      console.error('Profile missing ID');
      this.errorMessage = 'Profile ID is missing. Please refresh and try again.';
      return;
    }

    // Update the profile with form data
    this.updateProfileFromEditableForm();

    // Create a copy to avoid mutating the original
    const updatedProfile: RecruiterProfile = {
      ...this.recruiterProfile,
      updatedDate: new Date() // Update timestamp
    };

    console.log('Saving profile:', updatedProfile);

    this.recruiterProfileService.updateProfile(updatedProfile).subscribe({
      next: (savedProfile) => {
        console.log('Profile saved successfully:', savedProfile);
        this.recruiterProfile = savedProfile;
        this.initializeEditableForm(); // Re-sync form data with saved profile
        this.isEditMode = false;
        this.errorMessage = ''; // Clear any previous errors
        // TODO: Show success message
      },
      error: (error) => {
        console.error('Error saving profile:', error);
        this.errorMessage = error.message || 'Failed to save profile';
        // TODO: Show error message to user
      }
    });
  }

  /**
   * Cancel edit mode
   */
  cancelEdit(): void {
    this.isEditMode = false;
    // Reload profile to reset any unsaved changes
    this.loadProfile();
  }

  /**
   * Save company changes
   */
  saveCompany(): void {
    if (!this.recruiterProfile) {
      console.error('No recruiter profile to save');
      this.errorMessage = 'No recruiter profile data available to save';
      return;
    }

    if (!this.recruiterProfile.company) {
      console.error('No company associated with recruiter profile');
      this.errorMessage = 'No company data available to save. Please contact support.';
      return;
    }

    if (!this.recruiterProfile.company.companyID || this.recruiterProfile.company.companyID <= 0) {
      console.error('Invalid company ID:', this.recruiterProfile.company.companyID);
      this.errorMessage = 'Invalid company ID. Please refresh the page and try again.';
      return;
    }

    // Create company object for backend (only fields that exist in backend model)
    const updatedCompany: CompanyUpdateDto = {
      companyID: this.recruiterProfile.company.companyID,
      name: this.editableCompanyInfo.name,
      website: this.editableCompanyInfo.website,
      size: this.editableCompanyInfo.companySize,
      address: this.editableCompanyInfo.address,
      phone: this.editableCompanyInfo.phone
    };

    console.log('Saving company:', updatedCompany);

    this.companyService.update(this.recruiterProfile.company.companyID, updatedCompany).subscribe({
      next: (savedCompany) => {
        console.log('Company saved successfully:', savedCompany);
        // Reload the profile to get the latest data from server
        this.loadProfile();
        this.isCompanyEditMode = false;
        this.errorMessage = ''; // Clear any previous errors
        // TODO: Show success message
      },
      error: (error) => {
        console.error('Error saving company:', error);
        this.errorMessage = error.message || 'Failed to save company';
        // TODO: Show error message to user
      }
    });
  }

  /**
   * Cancel company edit mode
   */
  cancelCompanyEdit(): void {
    this.isCompanyEditMode = false;
    // Reset editable company info to current company info
    this.editableCompanyInfo = { ...this.companyInfo };
  }

  /**
   * Update profile from editable form data
   */
  updateProfileFromEditableForm(): void {
    if (!this.recruiterProfile) return;

    // Update the recruiter profile with changes from editable form
    this.recruiterProfile.fullName = `${this.editablePersonalInfo.firstName} ${this.editablePersonalInfo.lastName}`.trim();
    this.recruiterProfile.email = this.editablePersonalInfo.email;
    this.recruiterProfile.phoneNumber = this.editablePersonalInfo.phone;
    this.recruiterProfile.jobTitle = this.editablePersonalInfo.position;

    console.log('Updated profile from editable form:', this.recruiterProfile);
  }

  /**
   * Get stat card color class
   */
  getStatCardClass(index: number): string {
    const classes = ['stat-card-green', 'stat-card-blue', 'stat-card-orange', 'stat-card-purple'];
    return classes[index % classes.length];
  }
}
