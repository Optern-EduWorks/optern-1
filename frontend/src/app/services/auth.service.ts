import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  userId: number;
  role: string;
  username: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // hydrate from localStorage if available
    const raw = localStorage.getItem('optern_user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.currentUserSubject.next(parsed);
      } catch {
        localStorage.removeItem('optern_user');
      }
    }
  }

  login(email: string, password: string) {
    // Backend expects PascalCase property names
    const payload = { Email: email, Password: password };
    return this.http.post<any>('/api/Auth/login', payload).pipe(
      tap(serverUser => {
        if (!serverUser) return;
        // Map server user properties to frontend User shape
        const user: User = {
          userId: serverUser.userId ?? serverUser.UserId ?? serverUser.UserID ?? serverUser.Id ?? 0,
          role: serverUser.role ?? serverUser.Role ?? '',
          username: serverUser.username ?? serverUser.Username ?? '',
          email: serverUser.email ?? serverUser.Email ?? ''
        };
        this.currentUserSubject.next(user);
        try { localStorage.setItem('optern_user', JSON.stringify(user)); } catch {}
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
}
