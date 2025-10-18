import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats, ActivityItem, JobPerformanceItem, ChartData } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recruiter-dashboard.html',
  styleUrls: ['./recruiter-dashboard.css'],
})
export class RecruiterDashboardComponent implements OnInit {
  stats: DashboardStats = {};
  activities: ActivityItem[] = [];
  topJobs: JobPerformanceItem[] = [];
  chartData: ChartData = { labels: [], applicationsData: [], interviewsData: [] };
  isLoading: boolean = true;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
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
}
