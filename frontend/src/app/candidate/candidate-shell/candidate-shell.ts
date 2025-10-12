import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-candidate-shell',
  standalone: true,
  imports: [SidebarComponent, RouterModule],
  templateUrl: './candidate-shell.html',
  styleUrls: ['./candidate-shell.css']
})
export class CandidateShellComponent {
  constructor(private auth: AuthService, private router: Router) {}

  get username(): string | null {
    const user = this.auth.getCurrentUser();
    if (!user) return null;
    return user.username || user.email || null;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
  toggleSidebar() {
    // No collapse functionality, just a stub for UI look
    console.log('Sidebar toggle clicked - no action');
  }
}
