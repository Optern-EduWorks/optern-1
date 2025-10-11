import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule], // Add CommonModule to the imports array
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  // Property to track the active tab, initialized to 'personal'
  activeTab: string = 'personal';

  // Method to change the active tab
  selectTab(tab: string) {
    this.activeTab = tab;
  }
}
