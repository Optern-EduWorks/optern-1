import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recruiter-sign-in',
  standalone: true,
  templateUrl: './recruiter-sign-in.html',
  styleUrls: ['./recruiter-sign-in.css']
})
export class RecruiterSignIn {
  constructor(private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault();
    // Add authentication logic here (e.g., call API and verify credentials)
    // If authenticated successfully, navigate to recruiter dashboard
    
    this.router.navigate(['/recruiter/dashboard']);
  }

  goToSignUp(event: Event) {
    event.preventDefault();
    this.router.navigate(['/recruiter/sign-up']);
  }

  goToHome(event: Event) {
    event.preventDefault();
    this.router.navigate(['/']);
  }
}
