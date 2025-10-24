import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowedRole: string) {
  return () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const user = authService.getCurrentUser();

    if (!user || !user.userId || !user.token) {
      console.log('Role guard: No valid user found, redirecting to login');
      authService.logout(); // Clear any invalid session
      const loginRoute = allowedRole === 'recruiter' ? '/recruiter/sign-in' : '/candidate/sign-in';
      router.navigate([loginRoute]);
      return false;
    }

    // Map backend roles to frontend expected roles
    const mappedRole = user.role === 'student' ? 'candidate' : user.role;

    if (mappedRole !== allowedRole) {
      console.log(`Role guard: User role '${user.role}' (mapped to '${mappedRole}') does not match required role '${allowedRole}'`);
      authService.logout(); // Force logout for wrong role
      const loginRoute = allowedRole === 'recruiter' ? '/recruiter/sign-in' : '/candidate/sign-in';
      router.navigate([loginRoute]);
      return false;
    }

    console.log(`Role guard: Access granted for ${user.role} user`);
    return true;
  };
}
