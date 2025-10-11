import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class RecruiterCandidatesComponent {
  
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
  
  // Search history data
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
  
  // Candidates data
  candidates: Candidate[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Frontend Developer',
      email: 'sarah.johnson@university.edu',
      avatarLetter: 'S',
      avatarColor: 'orange',
      location: 'San Francisco, CA',
      experience: '4 years',
      degree: 'B.S. Computer Science',
      skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'GraphQL'],
      extraSkillsCount: 1,
      education: 'University of Technology',
      views: 45,
      status: 'available',
      lastActive: '1/20/2024',
      workExperience: [
        { position: 'Frontend Developer at StartupXYZ', company: 'StartupXYZ', duration: '2 years' },
        { position: 'Junior Developer at WebCorp', company: 'WebCorp', duration: '2 years' }
      ]
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Data Scientist',
      email: 'mike.chen@university.edu',
      avatarLetter: 'M',
      avatarColor: 'purple',
      location: 'New York, NY',
      experience: '2 years',
      degree: 'M.S. Data Science',
      skills: ['Python', 'Machine Learning', 'Pandas', 'TensorFlow', 'SQL'],
      extraSkillsCount: 1,
      education: 'Tech Institute',
      views: 32,
      status: 'employed',
      lastActive: '1/19/2024',
      workExperience: [
        { position: 'Data Analyst at DataCorp', company: 'DataCorp', duration: '1.5 years' },
        { position: 'ML Intern at AITech', company: 'AITech', duration: '6 months' }
      ]
    },
    {
      id: 3,
      name: 'Emily Davis',
      role: 'Backend Engineer',
      email: 'emily.davis@university.edu',
      avatarLetter: 'E',
      avatarColor: 'blue',
      location: 'Austin, TX',
      experience: '3 years',
      degree: 'B.S. Software Engineering',
      skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
      extraSkillsCount: 1,
      education: 'Engineering College',
      views: 28,
      status: 'available',
      lastActive: '1/21/2024',
      workExperience: [
        { position: 'Backend Engineer at TechStack', company: 'TechStack', duration: '3 years' }
      ]
    },
    {
      id: 4,
      name: 'Alex Rodriguez',
      role: 'UX Designer',
      email: 'alex.rodriguez@university.edu',
      avatarLetter: 'A',
      avatarColor: 'green',
      location: 'Remote',
      experience: '5 years',
      degree: 'B.A. Design',
      skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems'],
      extraSkillsCount: 1,
      education: 'Design Institute',
      views: 67,
      status: 'not-looking',
      lastActive: '1/18/2024',
      workExperience: [
        { position: 'Senior UX Designer at CreativeLab', company: 'CreativeLab', duration: '3 years' },
        { position: 'UX Designer at StartupX', company: 'StartupX', duration: '2 years' }
      ]
    }
  ];
  
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
