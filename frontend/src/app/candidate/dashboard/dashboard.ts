import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats, ActivityItem, AnnouncementItem } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { SignalRService, DashboardUpdate } from '../../services/signalr.service';
import { CandidateProfile } from '../../models/candidate-profile.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  stats: DashboardStats = {};
  activities: ActivityItem[] = [];
  announcements: AnnouncementItem[] = [];
  userName: string = 'John Student';
  isLoading: boolean = true;
  private signalRSubscription: Subscription = new Subscription();

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private profileService: ProfileService,
    private signalRService: SignalRService
  ) {}

  async ngOnInit() {
    this.loadDashboardData();
    this.loadUserProfile();
    await this.setupSignalR();
  }

  ngOnDestroy() {
    this.signalRSubscription.unsubscribe();
  }

  private loadDashboardData() {
    this.isLoading = true;

    // Load stats
    this.dashboardService.getCandidateStats().subscribe({
      next: (stats) => {
        console.log('Received stats from API:', stats);
        console.log('Stats type:', typeof stats);
        console.log('Stats keys:', Object.keys(stats || {}));
        this.stats = stats || {};
        this.isLoading = false;
        console.log('Updated this.stats:', this.stats);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        console.error('Error response:', error.error);
        console.error('Error status:', error.status);
        this.isLoading = false;
      }
    });

    // Load activities
    this.dashboardService.getCandidateActivities().subscribe({
      next: (activities) => {
        this.activities = Array.isArray(activities) ? activities : [];
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        this.activities = []; // Ensure activities is always an array
      }
    });

    // Load announcements
    this.dashboardService.getAnnouncements().subscribe({
      next: (announcements) => {
        this.announcements = Array.isArray(announcements) ? announcements : [];
      },
      error: (error) => {
        console.error('Error loading announcements:', error);
        this.announcements = []; // Ensure announcements is always an array
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

  private async setupSignalR() {
    try {
      await this.signalRService.startConnection();
      console.log('SignalR connection established for candidate dashboard');

      // Subscribe to real-time dashboard updates
      this.signalRSubscription.add(
        this.signalRService.dashboardUpdates.subscribe((update: DashboardUpdate | null) => {
          if (update && update.updateType === 'stats-update') {
            console.log('Received real-time update:', update);
            // Handle specific update types
            if (update.data.type === 'candidate-stats' || update.data.type === 'application-created' ||
                update.data.type === 'application-status-updated' || update.data.type === 'application-deleted') {
              this.loadDashboardData(); // Reload stats and activities
            } else if (update.data.type === 'job-created' || update.data.type === 'job-updated' || update.data.type === 'job-deleted') {
              // For job updates, only reload activities and stats, not opportunities
              this.loadDashboardData();
            }
          }
        })
      );
    } catch (error) {
      console.error('Error setting up SignalR connection:', error);
    }
  }
}
