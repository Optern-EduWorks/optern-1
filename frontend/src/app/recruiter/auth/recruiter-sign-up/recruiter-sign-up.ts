import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recruiter-sign-up',
  standalone: true,
  templateUrl: './recruiter-sign-up.html',
  styleUrls: ['./recruiter-sign-up.css']
})
export class RecruiterSignUp {
  constructor(private router: Router) {}

  // onCreateAccount(event: Event) {
  //   event.preventDefault();
  //   // Add sign-up logic here (e.g., call API to create user)
  //   // On successful account creation navigate to recruiter dashboard
    
  //   this.router.navigate(['/recruiter/dashboard']);
  // }

  onSubmit(event: Event) {
    event.preventDefault();
    // Add authentication logic here (e.g., call API and verify credentials)
    // If authenticated successfully, navigate to recruiter dashboard
    
    this.router.navigate(['/recruiter/dashboard']);
  }


  goToSignIn(event: Event) {
    event.preventDefault();
    this.router.navigate(['/recruiter/sign-in']);
  }

  goToHome(event: Event) {
    event.preventDefault();
    this.router.navigate(['/']);
  }
}
