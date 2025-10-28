import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';
import { SignalRService } from '../../services/signalr.service';
import { Subscription } from 'rxjs';

// Interface for Candidate data structure
interface Candidate {
  id: number;
  name: string;
  role: string;
  email: string;
  avatarLetter: string;
  avatarColor: string;
  location: string;
  experience: string;
  degree?: string;
  skills: string[];
  extraSkillsCount: number;
  education: string;
  views: number;
  status: 'available' | 'employed' | 'not-looking';
  workExperience: Array<{ position: string; company: string; duration: string }>;
  lastActive?: string;
  applicationID: number;
  jobID: number;
  candidateID: number;
  appliedDate: string;
}

// Interface for Search History data structure
interface SearchHistory {
  id: number;
  title: string;
  skills: string;
  experience: string;
  location: string;
  resultsCount: number;
  timestamp: string;
}

@Component({
  selector: 'app-candidates-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruiter-candidates.html',
  styleUrls: ['./recruiter-candidates.css']
})
export class RecruiterCandidatesComponent implements OnInit, OnDestroy {

  // === PROPERTIES ===

  // Search query input
  searchQuery: string = '';

  // View mode: grid or list
  viewMode: 'grid' | 'list' = 'grid';

  // Modal visibility states
  showSearchHistoryModal: boolean = false;
  showProfileModal: boolean = false;

  // Selected candidate for profile modal
  selectedCandidate: Candidate | null = null;

  // Search history data (keeping for now, but could be fetched from API)
  searchHistory: SearchHistory[] = [
    {
      id: 1,
      title: 'React TypeScript',
      skills: 'React, TypeScript',
      experience: '3-5 years',
      location: 'San Francisco',
      resultsCount: 8,
      timestamp: '2024-01-22 14:30'
    },
    {
      id: 2,
      title: 'Data Science Python',
      skills: 'Python, Machine Learning',
      experience: '2+ years',
      location: '',
      resultsCount: 12,
      timestamp: '2024-01-21 10:15'
    },
    {
      id: 3,
      title: 'UX Designer Figma',
      skills: 'Figma, Prototyping',
      experience: '4+ years',
      location: 'Remote',
      resultsCount: 5,
      timestamp: '2024-01-20 16:45'
    }
  ];

  // Candidates data - now fetched from API
  candidates: Candidate[] = [];

  private applicationService = inject(ApplicationService);
  private signalRService = inject(SignalRService);
  private subscription: Subscription = new Subscription();

  constructor() {
    this.loadCandidates();
  }

  ngOnInit() {
    this.setupSignalR();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private async setupSignalR() {
    try {
      await this.signalRService.startConnection();
      console.log('SignalR connection established for recruiter candidates');

      // Subscribe to dashboard updates
      this.subscription.add(
        this.signalRService.dashboardUpdates.subscribe(update => {
          if (update && update.data && (update.data.type === 'application-created' || update.data.type === 'application-status-updated' || update.data.type === 'application-deleted')) {
            console.log('Received application update:', update.data.type, 'refreshing candidates');
            this.refreshCandidates();
          }
        })
      );
    } catch (error) {
      console.error('Error setting up SignalR connection:', error);
    }
  }

  refreshCandidates() {
    this.loadCandidates();
  }

  private loadCandidates() {
    this.applicationService.getByRecruiter().subscribe({
      next: (applications) => {
        // Map applications to candidates
        this.candidates = (applications || []).map((app, index) => ({
          id: app.CandidateID,
          name: app.Candidate?.FullName || 'Unknown Candidate',
          role: app.Job?.Title || 'Unknown Position',
          email: app.Candidate?.Email || '',
          avatarLetter: (app.Candidate?.FullName || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          avatarColor: this.getRandomColor(),
          location: app.Candidate?.Address || 'Not specified',
          experience: 'Not specified', // Could be added to candidate profile
          degree: 'Not specified',
          skills: [], // Could be added to candidate profile
          extraSkillsCount: 0,
          education: 'Not specified',
          views: 0, // Default
          status: 'available' as const, // Default
          workExperience: [], // Could be added
          applicationID: app.ApplicationID,
          jobID: app.JobID,
          candidateID: app.CandidateID,
          appliedDate: app.AppliedDate
        }));
      },
      error: (err) => {
        console.warn('Failed to load candidates', err);
        this.candidates = [];
      }
    });
  }

  private getRandomColor(): string {
    const colors = ['orange', 'purple', 'blue', 'green', 'red', 'teal'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // === PUBLIC METHODS ===
  
  /**
   * Get CSS class for skill tag based on skill type
   */
  getSkillTagClass(skill: string): string {
    const frontendSkills: string[] = ['React', 'TypeScript', 'Next.js', 'Vue.js', 'Angular', 'GraphQL'];
    const backendSkills: string[] = ['Node.js', 'PostgreSQL', 'Docker', 'AWS'];
    const dataScienceSkills: string[] = ['Python', 'Machine Learning', 'Pandas', 'TensorFlow', 'SQL'];
    const designSkills: string[] = ['Figma', 'Prototyping', 'User Research', 'Design Systems'];
    
    if (frontendSkills.includes(skill)) {
      return 'skill-tag green';
    }
    
    if (backendSkills.includes(skill)) {
      return 'skill-tag green';
    }
    
    if (dataScienceSkills.includes(skill)) {
      return 'skill-tag teal';
    }
    
    if (designSkills.includes(skill)) {
      return 'skill-tag green';
    }
    
    return 'skill-tag green';
  }
  
  /**
   * Set view mode (grid or list)
   */
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }
  
  /**
   * Handle search action
   */
  onSearch(): void {
    console.log('Search query:', this.searchQuery);
    // TODO: Implement search logic
  }
  
  /**
   * Toggle bookmark for candidate
   */
  toggleBookmark(candidateId: number): void {
    console.log('Bookmark toggled for candidate ID:', candidateId);
    // TODO: Implement bookmark logic
  }
  
  /**
   * Open profile modal for selected candidate
   */
  viewProfile(candidateId: number): void {
    this.selectedCandidate = this.candidates.find(c => c.id === candidateId) || null;
    this.showProfileModal = true;
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Close profile modal
   */
  closeProfileModal(): void {
    this.showProfileModal = false;
    this.selectedCandidate = null;
    document.body.style.overflow = 'auto';
  }
  
  /**
   * Contact candidate
   */
  contactCandidate(candidateId: number): void {
    console.log('Contact candidate ID:', candidateId);
    // TODO: Implement contact logic
  }
  
  /**
   * Open search history modal
   */
  openSearchHistory(): void {
    this.showSearchHistoryModal = true;
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Close search history modal
   */
  closeSearchHistory(): void {
    this.showSearchHistoryModal = false;
    document.body.style.overflow = 'auto';
  }
  
  /**
   * Load search from history
   */
  loadSearchHistory(search: SearchHistory): void {
    console.log('Loading search:', search.title);
    // TODO: Implement search loading logic
    this.closeSearchHistory();
  }
  
  /**
   * Get human-readable status text
   */
  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'available': 'Available',
      'employed': 'Employed',
      'not-looking': 'Not Looking'
    };
    return statusMap[status] || status;
  }
}
