import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

interface RegisterForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: string;
  university?: string;
  course?: string;
}

@Component({
  standalone: true,
  selector: 'app-candidate-sign-up',
  templateUrl: './candidate-sign-up.html',
  styleUrls: ['./candidate-sign-up.css'],
  imports: [FormsModule]
})
export class CandidateSignUp {
  model: RegisterForm = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    university: '',
    course: ''
  };

  error: string | null = null;
  loading = false;

  constructor(private router: Router, private auth: AuthService) {}

  onCreateAccount(event: Event) {
    event.preventDefault();
    this.error = null;
    // Clear any existing authenticated user before creating a new account
    this.auth.logout();
    if (this.model.password !== this.model.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    const payload = {
      Username: this.model.username || `${this.model.firstName} ${this.model.lastName}`.trim(),
      Email: this.model.email,
      Password: this.model.password,
      Role: this.model.role ?? 'Candidate',
      FirstName: this.model.firstName,
      LastName: this.model.lastName,
      University: this.model.university,
      Course: this.model.course,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
      Status: 'Active',
      VerificationStatus: 'Unverified',
      PhoneNumber: ''
    };

    this.loading = true;
    this.auth.register(payload).subscribe({
      next: () => {
        // After successful registration, auto-login the newly registered user
        this.auth.login(this.model.email, this.model.password).subscribe({
          next: () => {
            this.loading = false;
            void this.router.navigate(['/candidate/dashboard']);
          },
          error: (err) => {
            this.loading = false;
            if (err?.status === 0) this.error = 'Unable to contact server. Registration succeeded but auto-login failed.';
            else this.error = err?.error?.message ?? 'Registration succeeded but auto-login failed. Please sign in.';
            // ensure the user is not left authenticated as a previous user
            this.auth.logout();
            void this.router.navigate(['/candidate/sign-in']);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 0) this.error = 'Unable to contact server. Please try again later.';
        else this.error = err?.error?.message ?? 'Registration failed';
      }
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
