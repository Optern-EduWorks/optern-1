import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  currentUser: any = null;

  constructor(public router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to current user changes
    this.loadCurrentUser();
  }

  private loadCurrentUser() {
    // Get current user from auth service
    this.currentUser = this.authService.getCurrentUser();

    // Also subscribe to auth state changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  goToDashboard() {
    this.router.navigate(['/candidate/dashboard']);
  }

  goToOpportunities() {
    this.router.navigate(['/candidate/opportunities']);
  }

  goToApplications() {
    this.router.navigate(['/candidate/applications']);
  }

  goToResumeBuilder() {
    this.router.navigate(['/candidate/resume-builder']);
  }

  goToGrievances() {
    this.router.navigate(['/candidate/grievances']);
  }

  goToProfile() {
    this.router.navigate(['/candidate/profile']);
  }

  logout() {
    // Implement logout logic as needed
    this.router.navigate(['/']);
  }
}
