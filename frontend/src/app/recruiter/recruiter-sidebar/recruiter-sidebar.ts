import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecruiterService, RecruiterProfile } from '../../services/recruiter.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recruiter-sidebar.html',
  styleUrls: ['./recruiter-sidebar.css']
})
export class RecruiterSidebarComponent implements OnInit {
  // User data properties
  userInitials: string = 'J';
  userName: string = 'Jane Recruiter';
  userEmail: string = 'jane.recruiter@techcorp.com';
  userCompany: string = 'TechCorp Inc';

  // Services
  private recruiterService = inject(RecruiterService);
  private authService = inject(AuthService);

  constructor(public router: Router) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  private loadUserProfile() {
    // First try to get basic user info from auth service
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userEmail = currentUser.email || this.userEmail;
      this.userName = currentUser.username || this.userName;
      this.userInitials = this.getInitials(this.userName);
    }

    // Then get detailed recruiter profile
    this.recruiterService.getProfile().subscribe({
      next: (profile: RecruiterProfile) => {
        this.userName = profile.fullName;
        this.userEmail = profile.email;
        this.userCompany = profile.company?.name || 'Unknown Company';
        this.userInitials = this.getInitials(profile.fullName);
      },
      error: (err) => {
        console.warn('Failed to load recruiter profile for sidebar:', err);
        // Keep the fallback data from auth service
      }
    });
  }

  private getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  goToDashboard()         { this.router.navigate(['/recruiter/dashboard']); }
  goToOpportunities()     { this.router.navigate(['/recruiter/opportunities']); }
  goToApplications()      { this.router.navigate(['/recruiter/applications']); }
  goToCandidates()        { this.router.navigate(['/recruiter/candidates']); }
  goToGrievances()        { this.router.navigate(['/recruiter/grievances']); }
  goToProfile()           { this.router.navigate(['/recruiter/profile']); }
  logout()                { this.router.navigate(['/']); }
}
