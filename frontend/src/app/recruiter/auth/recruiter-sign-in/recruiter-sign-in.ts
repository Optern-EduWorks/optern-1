import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

interface LoginForm { email: string; password: string }

@Component({
  selector: 'app-recruiter-sign-in',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './recruiter-sign-in.html',
  styleUrls: ['./recruiter-sign-in.css']
})
export class RecruiterSignIn {
  model: LoginForm = { email: '', password: '' };
  error: string | null = null;

  constructor(private router: Router, private auth: AuthService) {}

  onSubmit(event: Event) {
    event.preventDefault();
    this.error = null;
    this.auth.logout();
    this.auth.login(this.model.email, this.model.password).subscribe({
      next: () => this.router.navigate(['/recruiter/dashboard']),
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

  goToSignUp(event: Event) {
    event.preventDefault();
    this.router.navigate(['/recruiter/sign-up']);
  }

  goToHome(event: Event) {
    event.preventDefault();
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
