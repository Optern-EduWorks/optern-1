import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recruiter-sidebar.html',
  styleUrls: ['./recruiter-sidebar.css']
})
export class RecruiterSidebarComponent {
  constructor(public router: Router) {}

  goToDashboard()         { this.router.navigate(['/recruiter/dashboard']); }
  goToOpportunities()         { this.router.navigate(['/recruiter/opportunities']); }
  goToApplications()         { this.router.navigate(['/recruiter/applications']); }
  goToCandidates()         { this.router.navigate(['/recruiter/candidates']); }
  goToGrievances()         { this.router.navigate(['/recruiter/grievances']); }
  goToProfile()         { this.router.navigate(['/recruiter/profile']); }
  logout()                { this.router.navigate(['/']); }
}
