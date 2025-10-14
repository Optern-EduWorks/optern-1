import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-candidate-shell',
  standalone: true,
  imports: [SidebarComponent, RouterModule, CommonModule],
  templateUrl: './candidate-shell.html',
  styleUrls: ['./candidate-shell.css']
})
export class CandidateShellComponent {
  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
  toggleSidebar() {
    // No collapse functionality, just a stub for UI look
    console.log('Sidebar toggle clicked - no action');
  }
}
