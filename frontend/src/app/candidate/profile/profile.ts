import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { CandidateProfile } from '../../models/candidate-profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  // Property to track the active tab, initialized to 'personal'
  activeTab: string = 'personal';

  // Profile data
  profile: CandidateProfile = {
    candidateID: 0,
    fullName: '',
    email: '',
    phoneNumber: '',
    linkedInProfile: '',
    address: '',
    dateOfBirth: new Date(),
    gender: '',
    status: '',
    resumeURL: '',
    createdDate: new Date(),
    updatedDate: new Date(),
    graduationYear: 0,
    college: '',
    course: '',
    currentSemester: ''
  };

  // Form data for editing
  editProfile: CandidateProfile = { ...this.profile };

  // UI state
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  // Notification settings
  notificationSettings = {
    emailNotifications: true,
    jobApplicationUpdates: true,
    interviewReminders: true,
    marketingCommunications: false
  };

  // Password management
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Password visibility toggles
  passwordVisibility = {
    current: false,
    new: false,
    confirm: false
  };

  constructor(private profileService: ProfileService, private authService: AuthService) {}

  ngOnInit() {
    console.log('Profile component initialized');
    this.loadProfile();
    // Listen for auth service changes to refresh profile when user logs in
    this.authService.currentUser$.subscribe(user => {
      console.log('Auth service user changed:', user);
      if (user && user.userId > 0) {
        console.log('Valid user logged in, refreshing profile...');
        this.forceReloadProfile();
      } else {
        console.log('User logged out or invalid user, clearing profile...');
        // Clear profile data when user logs out
        this.profile = this.getDefaultProfile();
        this.editProfile = { ...this.profile };
      }
    });
  }

  // Method to refresh profile data (can be called after login)
  refreshProfile() {
    console.log('Refreshing profile...');
    this.loadProfile();
  }

  // Method to force reload profile (can be called from parent components)
  forceReloadProfile() {
    console.log('Force reloading profile...');
    this.isLoading = true;
    this.errorMessage = '';

    const currentUser = this.authService.getCurrentUser();
    console.log('Current user:', currentUser);

    if (currentUser && currentUser.userId) {
      // Use the main getProfile method instead of getProfileById
      this.profileService.getProfile().subscribe({
        next: (data: CandidateProfile | null) => {
          console.log('Profile force loaded:', data);
          if (data) {
            this.profile = data;
            this.editProfile = { ...data };
          } else {
            this.profile = this.getDefaultProfile();
            this.editProfile = { ...this.profile };
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error force loading profile:', error);
          this.errorMessage = `Failed to load profile: ${error.message || 'Please try again.'}`;
          this.isLoading = false;
          // Use default profile on error
          this.profile = this.getDefaultProfile();
          this.editProfile = { ...this.profile };
        }
      });
    } else {
      this.loadProfile();
    }
  }

  // Method to change the active tab
  selectTab(tab: string) {
    this.activeTab = tab;
    this.clearMessages();
  }

  // Load profile data
  loadProfile() {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Loading profile...');
    this.profileService.getProfile().subscribe({
      next: (data: CandidateProfile | null) => {
        console.log('Profile loaded:', data);
        if (data && data.candidateID && data.candidateID > 0) {
          this.profile = data;
          console.log('Using existing profile:', this.profile);
        } else {
          // No existing profile, use default
          this.profile = this.getDefaultProfile();
          console.log('Using default profile:', this.profile);
        }
        this.editProfile = { ...this.profile };
        // Update notification settings from profile
        this.notificationSettings = {
          emailNotifications: this.profile.emailNotifications ?? true,
          jobApplicationUpdates: this.profile.jobApplicationUpdates ?? true,
          interviewReminders: this.profile.interviewReminders ?? true,
          marketingCommunications: this.profile.marketingCommunications ?? false
        };
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading profile:', error);
        this.errorMessage = `Failed to load profile data: ${error.message || 'Please try again.'}`;
        this.isLoading = false;
        // Use default profile on error
        this.profile = this.getDefaultProfile();
        this.editProfile = { ...this.profile };
      }
    });
  }

  // Save profile data
  saveProfile() {
    console.log('Save profile called');
    console.log('Current editProfile:', this.editProfile);
    console.log('Current profile:', this.profile);

    // Ensure editProfile is initialized
    if (!this.editProfile) {
      console.error('editProfile is null, initializing with default');
      this.editProfile = this.getDefaultProfile();
    }

    if (!this.validateProfile()) {
      console.log('Profile validation failed');
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Ensure the profile has the current user's ID
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user in saveProfile:', currentUser);

    if (!currentUser || !currentUser.userId) {
      console.error('No current user found');
      this.errorMessage = 'Please log in to save your profile';
      this.isSaving = false;
      return;
    }

    // Create a safe copy of the profile to avoid mutations
    // Ensure we have a valid profile object
    const baseProfile = this.editProfile || this.getDefaultProfile();

    const profileToSave: CandidateProfile = {
      ...baseProfile,
      candidateID: currentUser.userId,
      email: currentUser.email,
      updatedDate: new Date()
    };

    console.log('Profile to save:', profileToSave);

    this.profileService.updateProfile(profileToSave).subscribe({
      next: (data: CandidateProfile) => {
        console.log('Profile saved successfully:', data);
        // Update both profile objects with the saved data
        this.profile = { ...data };
        this.editProfile = { ...data };
        this.successMessage = 'Profile updated successfully!';
        this.isSaving = false;
        setTimeout(() => this.clearMessages(), 3000);
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        this.errorMessage = `Failed to update profile: ${error.message || 'Please try again.'}`;
        this.isSaving = false;
      }
    });
  }

  // Save academic information
  saveAcademicInfo() {
    console.log('Save academic info called');

    // Ensure editProfile is initialized
    if (!this.editProfile) {
      console.error('editProfile is null, initializing with default');
      this.editProfile = this.getDefaultProfile();
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Get current user
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      this.errorMessage = 'Please log in to save your profile';
      this.isSaving = false;
      return;
    }

    // Create a safe copy for academic info update
    const profileToSave: CandidateProfile = {
      ...this.editProfile,
      candidateID: currentUser.userId,
      email: currentUser.email,
      updatedDate: new Date()
    };

    console.log('Saving academic info:', profileToSave);

    this.profileService.updateProfile(profileToSave).subscribe({
      next: (data: CandidateProfile) => {
        console.log('Academic info saved successfully:', data);
        this.profile = { ...data };
        this.editProfile = { ...data };
        this.successMessage = 'Academic information updated successfully!';
        this.isSaving = false;
        setTimeout(() => this.clearMessages(), 3000);
      },
      error: (error: any) => {
        console.error('Error updating academic info:', error);
        this.errorMessage = 'Failed to update academic information. Please try again.';
        this.isSaving = false;
      }
    });
  }

  // Save notification preferences
  saveNotificationPreferences() {
    console.log('Saving notification preferences:', this.notificationSettings);

    // Update the profile with notification settings
    this.editProfile.emailNotifications = this.notificationSettings.emailNotifications;
    this.editProfile.jobApplicationUpdates = this.notificationSettings.jobApplicationUpdates;
    this.editProfile.interviewReminders = this.notificationSettings.interviewReminders;
    this.editProfile.marketingCommunications = this.notificationSettings.marketingCommunications;

    // Save the profile
    this.saveProfile();
  }

  // Update password
  updatePassword() {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.errorMessage = 'Please fill in all password fields.';
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'New password and confirmation do not match.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Updating password for user');

    this.authService.changePassword(this.passwordData.currentPassword, this.passwordData.newPassword).subscribe({
      next: (response) => {
        console.log('Password updated successfully:', response);
        this.successMessage = 'Password updated successfully!';
        this.isSaving = false;
        // Clear password fields
        this.passwordData.currentPassword = '';
        this.passwordData.newPassword = '';
        this.passwordData.confirmPassword = '';
        setTimeout(() => this.clearMessages(), 3000);
      },
      error: (error) => {
        console.error('Error updating password:', error);
        this.errorMessage = error.error?.message || 'Failed to update password. Please try again.';
        this.isSaving = false;
      }
    });
  }

  // Toggle password visibility
  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    this.passwordVisibility[field] = !this.passwordVisibility[field];
  }

  // Validate profile data
  private validateProfile(): boolean {
    if (!this.editProfile.fullName?.trim()) {
      this.errorMessage = 'Full name is required.';
      return false;
    }
    if (!this.editProfile.email?.trim()) {
      this.errorMessage = 'Email is required.';
      return false;
    }
    if (!this.editProfile.phoneNumber?.trim()) {
      this.errorMessage = 'Phone number is required.';
      return false;
    }
    return true;
  }

  // Get default profile structure
  private getDefaultProfile(): CandidateProfile {
    return {
      candidateID: 0,
      fullName: '',
      email: '',
      phoneNumber: '',
      linkedInProfile: '',
      address: '',
      dateOfBirth: new Date(),
      gender: '',
      status: 'Active',
      resumeURL: '',
      createdDate: new Date(),
      updatedDate: new Date(),
      graduationYear: new Date().getFullYear(),
      college: '',
      course: '',
      currentSemester: ''
    };
  }

  // Clear messages
  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Cancel editing
  cancelEdit() {
    this.editProfile = { ...this.profile };
    this.clearMessages();
  }
}
