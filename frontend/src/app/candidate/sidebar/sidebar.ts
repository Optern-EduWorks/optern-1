import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  constructor(public router: Router) {}

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
