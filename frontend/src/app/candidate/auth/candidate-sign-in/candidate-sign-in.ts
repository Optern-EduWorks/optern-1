import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface LoginForm { email: string; password: string }

@Component({
  standalone: true,
  selector: 'app-candidate-sign-in',
  templateUrl: './candidate-sign-in.html',
  styleUrls: ['./candidate-sign-in.css'],
  imports: [FormsModule, CommonModule]
})
export class CandidateSignIn {
  model: LoginForm = { email: '', password: '' };
  error: string | null = null;

  successMessage: string | null = null;

  constructor(private router: Router, private auth: AuthService, private route: ActivatedRoute) {
    // check for registration redirect
    const reg = this.route.snapshot.queryParamMap.get('registered');
    const email = this.route.snapshot.queryParamMap.get('email');
    if (reg) {
      this.successMessage = 'Account created successfully. Please sign in.';
      if (email) this.model.email = email;
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.error = null;
    // ensure any previous user is cleared before new login attempt
    this.auth.logout();
    this.auth.login(this.model.email, this.model.password).subscribe({
      next: () => this.router.navigate(['/candidate/dashboard']),
      error: (err) => {
        // Network failure
        if (err?.status === 0) {
          this.error = 'Unable to contact server. Please check if the server is running and try again.';
          return;
        }

        // Try common shapes: { message: '' }, plain string, HttpErrorResponse.message
        const serverErr = err?.error;
        if (serverErr) {
          if (typeof serverErr === 'string') {
            // Strip HTML tags and decode HTML entities
            this.error = this.stripHtml(serverErr);
          } else if (typeof serverErr.message === 'string') {
            this.error = this.stripHtml(serverErr.message);
          } else {
            this.error = 'Login failed. Please check your credentials and try again.';
          }
        } else if (err?.message) {
          this.error = this.stripHtml(err.message);
        } else {
          this.error = 'Login failed. Please check your credentials and try again.';
        }
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

  private stripHtml(html: string): string {
    // Create a temporary DOM element to parse HTML
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    // Get text content and trim whitespace
    return tmp.textContent || tmp.innerText || html;
  }
}
