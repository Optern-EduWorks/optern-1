import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowedRole: string) {
  return () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const user = authService.getCurrentUser();
    
    if (!user) {
      authService.logout(); // Clear any invalid session
      router.navigate(['/recruiter/sign-in']);
      return false;
    }

    if (user.role !== allowedRole) {
      authService.logout(); // Force logout for wrong role
      router.navigate(['/recruiter/sign-in']);
      return false;
    }

    return true;
  };
}