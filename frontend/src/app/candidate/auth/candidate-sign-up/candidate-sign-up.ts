import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface RegisterForm { username:string; email:string; password:string }

@Component({
  standalone: true,
  selector: 'app-candidate-sign-up',
  templateUrl: './candidate-sign-up.html',
  styleUrls: ['./candidate-sign-up.css']
})
export class CandidateSignUp {
  model: RegisterForm = { username: '', email: '', password: '' };
  error: string | null = null;

  constructor(private router: Router, private auth: AuthService) {}

  onCreateAccount(event: Event) {
    event.preventDefault();
    this.error = null;
    const payload = {
      Username: this.model.username,
      Email: this.model.email,
      Password: this.model.password,
      Role: 'Candidate',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
      Status: 'Active',
      VerificationStatus: 'Unverified',
      PhoneNumber: ''
    };
    this.auth.register(payload).subscribe({
      next: () => this.router.navigate(['/candidate/dashboard']),
      error: (err) => this.error = err?.error?.message ?? 'Registration failed'
    });
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
