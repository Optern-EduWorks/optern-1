import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-candidate-sign-in',
  templateUrl: './candidate-sign-in.html',
  styleUrls: ['./candidate-sign-in.css'],
})
export class CandidateSignIn {
  constructor(private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault();
    // Add your sign-in logic here before navigating
    this.router.navigate(['/candidate/dashboard']);
  }

  navigateToSignUp() {
    this.router.navigate(['/candidate/sign-up']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
