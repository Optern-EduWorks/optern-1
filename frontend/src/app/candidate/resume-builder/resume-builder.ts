import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-resume-builder',
  standalone: true,
  imports: [CommonModule], // Add CommonModule
  templateUrl: './resume-builder.html',
  styleUrl: './resume-builder.css'
})
export class ResumeBuilder {
  // Track the active tab for the resume sections
  activeTab: string = 'personal';

  // Method to change tabs
  selectTab(tab: string) {
    this.activeTab = tab;
  }
}
