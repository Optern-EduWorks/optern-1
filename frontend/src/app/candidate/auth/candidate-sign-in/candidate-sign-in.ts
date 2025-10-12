import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface LoginForm { email: string; password: string }

@Component({
  standalone: true,
  selector: 'app-candidate-sign-in',
  templateUrl: './candidate-sign-in.html',
  styleUrls: ['./candidate-sign-in.css'],
  imports: [FormsModule]
})
export class CandidateSignIn {
  model: LoginForm = { email: '', password: '' };
  error: string | null = null;

  constructor(private router: Router, private auth: AuthService) {}

  onSubmit(event: Event) {
    event.preventDefault();
    this.error = null;
    // ensure any previous user is cleared before new login attempt
    this.auth.logout();
    this.auth.login(this.model.email, this.model.password).subscribe({
      next: () => this.router.navigate(['/candidate/dashboard']),
      error: (err) => {
        if (err?.status === 0) this.error = 'Unable to contact server. Please try again later.';
        else this.error = err?.error?.message ?? 'Login failed';
      }
    });
  }

  loginWithCredentials(email: string, password: string) {
    this.model.email = email;
    this.model.password = password;
    this.onSubmit(new Event('submit'));
  }

  navigateToSignUp() {
    this.router.navigate(['/candidate/sign-up']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
