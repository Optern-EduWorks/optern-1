import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-candidate-sign-up',
  templateUrl: './candidate-sign-up.html',
  styleUrls: ['./candidate-sign-up.css']
})
export class CandidateSignUp {
  constructor(private router: Router) {}

  onCreateAccount(event: Event) {
    event.preventDefault();
    // Add create account logic here before navigation
    this.router.navigate(['/candidate/dashboard']);
  }

  goToSignIn(event: Event) {
    event.preventDefault();
    this.router.navigate(['/candidate/sign-in']);
  }

  goToHome(event: Event) {
    event.preventDefault();
    this.router.navigate(['/']);
  }
}
