import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RecruiterSidebarComponent } from '../recruiter-sidebar/recruiter-sidebar';

@Component({
  selector: 'app-recruiter-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RecruiterSidebarComponent
  ],
  templateUrl: './recruiter-shell.html',
  styleUrl: './recruiter-shell.css'
})
export class RecruiterShellComponent {}
