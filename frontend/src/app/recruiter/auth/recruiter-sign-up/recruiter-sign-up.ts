import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

interface RegisterForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: string;
  companyName?: string;
  companyWebsite?: string;
}

@Component({
  selector: 'app-recruiter-sign-up',
  standalone: true,
  templateUrl: './recruiter-sign-up.html',
  styleUrls: ['./recruiter-sign-up.css'],
  imports: [FormsModule, CommonModule]
})
export class RecruiterSignUp {
  model: RegisterForm = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'recruiter',
    companyName: '',
    companyWebsite: ''
  };

  error: string | null = null;
  loading = false;

  constructor(private router: Router, private auth: AuthService) {}

  onSubmit(event: Event) {
    event.preventDefault();
    this.error = null;

    // Clear any existing authenticated user before creating a new account
    this.auth.logout();

    // Validate passwords match
    if (this.model.password !== this.model.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    // Validate required fields
    if (!this.model.firstName || !this.model.lastName || !this.model.email || !this.model.password) {
      this.error = 'Please fill in all required fields';
      return;
    }

    const payload = {
      Username: this.model.username || `${this.model.firstName} ${this.model.lastName}`.trim(),
      Email: this.model.email,
      Password: this.model.password,
      Role: this.model.role ?? 'Recruiter',
      Status: 'Active',
      VerificationStatus: 'Unverified',
      PhoneNumber: '',
      CreatedAt: new Date(),
      UpdatedAt: new Date()
    };

    this.loading = true;
    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        // Registration succeeded. Redirect user to sign-in so they can login.
        void this.router.navigate(['/recruiter/sign-in'], {
          queryParams: {
            registered: '1',
            email: this.model.email
          }
        });
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 0) {
          this.error = 'Unable to contact server. Please try again later.';
          return;
        }

        const serverErr = err?.error;
        if (serverErr) {
          if (typeof serverErr === 'string') this.error = serverErr;
          else if (typeof serverErr.message === 'string') this.error = serverErr.message;
          else this.error = JSON.stringify(serverErr);
        } else if (err?.message) {
          this.error = err.message;
        } else {
          this.error = 'Registration failed';
        }
      }
    });
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
