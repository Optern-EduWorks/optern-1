import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowedRole: string) {
  return async () => {
    const router = inject(Router);
    const authService = inject(AuthService);

    // Wait for authentication to initialize
    await authService.initializeAsyncAuth();

    const user = authService.getCurrentUser();
    console.log('Role guard check - user:', user);

    if (!user || !user.userId || !user.token) {
      console.log('Role guard: No valid user found, setting test user for development');
      // For development/testing, set test user if none exists
      const testUser = {
        userId: 1,
        role: allowedRole === 'candidate' ? 'student' : 'recruiter',
        username: allowedRole === 'candidate' ? 'Test Candidate' : 'Test Recruiter',
        email: allowedRole === 'candidate' ? 'candidate@test.com' : 'recruiter@test.com',
        token: 'test-token'
      };
      authService['currentUserSubject'].next(testUser);
      localStorage.setItem('optern_user', JSON.stringify(testUser));
      console.log('Role guard: Set test user:', testUser);
      return true;
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
