import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats, ActivityItem, AnnouncementItem } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { CandidateProfile } from '../../models/candidate-profile.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  stats: DashboardStats = {};
  activities: ActivityItem[] = [];
  announcements: AnnouncementItem[] = [];
  userName: string = 'John Student';
  isLoading: boolean = true;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadUserProfile();
  }

  private loadDashboardData() {
    this.isLoading = true;

    // Load stats
    this.dashboardService.getCandidateStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading = false;
      }
    });

    // Load activities
    this.dashboardService.getCandidateActivities().subscribe({
      next: (activities) => {
        this.activities = activities;
      },
      error: (error) => {
        console.error('Error loading activities:', error);
      }
    });

    // Load announcements
    this.dashboardService.getAnnouncements().subscribe({
      next: (announcements) => {
        this.announcements = announcements;
      },
      error: (error) => {
        console.error('Error loading announcements:', error);
      }
    });
  }

  private loadUserProfile() {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (profile && profile.fullName) {
          this.userName = profile.fullName;
        }
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }
}
