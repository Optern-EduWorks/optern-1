import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';

export interface User {
  userId: number;
  role: string;
  username: string;
  email: string;
  phoneNumber?: string;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private initialized = false;

  constructor(private http: HttpClient) {
    // Initialize authentication synchronously first
    this.initializeAuth();
  }

  private initializeAuth() {
    // hydrate from localStorage if available
    const raw = localStorage.getItem('optern_user');
    console.log('AuthService constructor - raw localStorage data:', raw);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        console.log('Parsed user from localStorage:', parsed);
        this.currentUserSubject.next(parsed);
        this.initialized = true;
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('optern_user');
        this.initialized = true;
      }
    } else {
      console.log('No user data found in localStorage, setting fallback test user');
      // Set fallback test user synchronously
      const testUser: User = {
        userId: 1,
        role: 'candidate',
        username: 'Test Candidate',
        email: 'candidate@test.com',
        token: 'test-token'
      };
      this.currentUserSubject.next(testUser);
      localStorage.setItem('optern_user', JSON.stringify(testUser));
      this.initialized = true;
    }
  }

  // Method to initialize authentication asynchronously
  async initializeAsyncAuth(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('Attempting async login with test credentials');
      const response = await this.login('candidate@test.com', 'password123').toPromise();
      console.log('Async test login successful:', response);
      this.initialized = true;
    } catch (error) {
      console.log('Async test login failed, keeping fallback test user:', error);
      this.initialized = true;
    }
  }

  login(email: string, password: string) {
    // Backend expects PascalCase property names
    const payload = { Email: email, Password: password };
    console.log('Attempting login for:', email);
    return this.http.post<any>('/api/Auth/login', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap({
        next: (response) => {
          console.log('Raw login response:', response);

          // Handle different response structures
          let serverUser;
          if (response.user) {
            serverUser = response.user;
          } else if (response.data && response.data.user) {
            serverUser = response.data.user;
          } else {
            serverUser = response;
          }

          console.log('Extracted user data:', serverUser);

          if (!serverUser) {
            console.error('No user data in response');
            return;
          }

          // Backend returns PascalCase (UserId, Role, Username, Email)
          // Map to our frontend User interface with better fallback handling
          const user: User = {
            userId: serverUser.UserId || serverUser.userId || 0,
            role: serverUser.Role || serverUser.role || '',
            username: serverUser.Username || serverUser.username || serverUser.Email || serverUser.email || '',
            email: serverUser.Email || serverUser.email || '',
            token: response.token
          };

          console.log('Final mapped user:', user);

          if (user.userId > 0) {
            this.currentUserSubject.next(user);
            try {
              localStorage.setItem('optern_user', JSON.stringify(user));
              console.log('User saved to localStorage successfully');
            } catch (e) {
              console.error('Failed to save user to localStorage:', e);
            }
          } else {
            console.error('Invalid user data - userId is 0 or missing');
          }
        },
        error: (error) => {
          // Log error for debugging but don't expose internal details
          console.error('Login error:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message
          });
        }
      })
    );
  }

  register(payload: any) {
    // POST to /api/Users
    return this.http.post('/api/Users', payload);
  }

  logout() {
    this.currentUserSubject.next(null);
    try { localStorage.removeItem('optern_user'); } catch {}
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    const user = this.getCurrentUser();
    return user?.token || null;
  }

  changePassword(currentPassword: string, newPassword: string) {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.userId || !currentUser.token) {
      console.error('Change password failed: No user logged in or no token');
      return throwError(() => new Error('Please log in to change your password'));
    }

    const payload = {
      CurrentPassword: currentPassword,
      NewPassword: newPassword
    };
    console.log('Attempting password change for user:', currentUser.userId);
    return this.http.post('/api/Auth/change-password', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`
      }
    });
  }
}
