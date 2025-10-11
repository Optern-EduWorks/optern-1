import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage {
  constructor(private router: Router) {}

  // Candidate Portal - Login
  goToCandidateSignIn() {
    this.router.navigate(['/candidate/sign-in']);
  }

  // Candidate Portal - Demo (Direct to Dashboard)
  goToCandidateDemo() {
    this.router.navigate(['/candidate/dashboard']);
  }

  // Recruiter Portal - Login
  goToRecruiterSignIn() {
    this.router.navigate(['/recruiter/sign-in']);
  }

  // Recruiter Portal - Demo (Direct to Dashboard)
  goToRecruiterDemo() {
    this.router.navigate(['/recruiter/dashboard']);
  }

  // Admin Portal - Login (unchanged)
  goToAdminSignIn() {
    this.router.navigate(['/admin/sign-in']);
  }
}
