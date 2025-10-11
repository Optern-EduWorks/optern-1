import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-candidate-shell',
  standalone: true,
  imports: [SidebarComponent, RouterModule],
  templateUrl: './candidate-shell.html',
  styleUrls: ['./candidate-shell.css']
})
export class CandidateShellComponent {
  toggleSidebar() {
    // No collapse functionality, just a stub for UI look
    console.log('Sidebar toggle clicked - no action');
  }
}
