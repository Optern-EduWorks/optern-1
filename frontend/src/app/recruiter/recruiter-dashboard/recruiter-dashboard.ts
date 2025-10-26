import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats, ActivityItem, JobPerformanceItem, ChartData } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { SignalRService, DashboardUpdate } from '../../services/signalr.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recruiter-dashboard.html',
  styleUrls: ['./recruiter-dashboard.css'],
})
export class RecruiterDashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {};
  activities: ActivityItem[] = [];
  topJobs: JobPerformanceItem[] = [];
  chartData: ChartData = { labels: [], applicationsData: [], interviewsData: [] };
  isLoading: boolean = true;
  private signalRSubscription: Subscription = new Subscription();

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private signalRService: SignalRService
  ) {}

  async ngOnInit() {
    this.loadDashboardData();
    await this.setupSignalR();
  }

  ngOnDestroy() {
    this.signalRSubscription.unsubscribe();
  }

  private loadDashboardData() {
    this.isLoading = true;

    // Load stats
    this.dashboardService.getRecruiterStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recruiter stats:', error);
        this.isLoading = false;
      }
    });

    // Load activities
    this.dashboardService.getRecruiterActivities().subscribe({
      next: (activities) => {
        this.activities = activities;
      },
      error: (error) => {
        console.error('Error loading recruiter activities:', error);
      }
    });

    // Load top performing jobs
    this.dashboardService.getTopPerformingJobs().subscribe({
      next: (jobs) => {
        this.topJobs = jobs;
      },
      error: (error) => {
        console.error('Error loading top jobs:', error);
      }
    });

    // Load chart data
    this.dashboardService.getChartData().subscribe({
      next: (chartData) => {
        this.chartData = chartData;
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
      }
    });
  }

  private async setupSignalR() {
    try {
      await this.signalRService.startConnection();
      console.log('SignalR connection established for recruiter dashboard');

      // Subscribe to real-time dashboard updates
      this.signalRSubscription.add(
        this.signalRService.dashboardUpdates.subscribe((update: DashboardUpdate | null) => {
          if (update && update.updateType === 'stats-update') {
            console.log('Received real-time update:', update);
            // Handle specific update types
            if (update.data.type === 'recruiter-stats' || update.data.type === 'application-created' ||
                update.data.type === 'application-status-updated' || update.data.type === 'application-deleted' ||
                update.data.type === 'job-created' || update.data.type === 'job-updated' || update.data.type === 'job-deleted') {
              this.loadDashboardData(); // Reload stats and activities
            }
          }
        })
      );
    } catch (error) {
      console.error('Error setting up SignalR connection:', error);
    }
  }
}
