import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface DashboardStats {
  TotalOpportunities?: number;
  AppliedJobs?: number;
  ApprovedApplications?: number;
  InReviewApplications?: number;
  ActiveJobs?: number;
  TotalApplications?: number;
  HiresThisMonth?: number;
  ScheduledInterviews?: number;
}

export interface ActivityItem {
  id: number;
  title: string;
  description: string;
  timeAgo: string;
  status: string;
  icon: string;
  createdAt: Date;
}

export interface AnnouncementItem {
  id: number;
  title: string;
  subtitle: string;
  timeAgo: string;
  type: string;
  createdAt: Date;
}

export interface JobPerformanceItem {
  id: number;
  title: string;
  location: string;
  type: string;
  postedDate: string;
  applicationCount: number;
}

export interface ChartData {
  labels: string[];
  applicationsData: number[];
  interviewsData: number[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = '/api/Dashboard';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Candidate dashboard methods
  getCandidateStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/candidate-stats`, { headers: this.getHeaders() });
  }

  getCandidateActivities(): Observable<ActivityItem[]> {
    return this.http.get<ActivityItem[]>(`${this.baseUrl}/candidate-activities`, { headers: this.getHeaders() });
  }

  getAnnouncements(): Observable<AnnouncementItem[]> {
    return this.http.get<AnnouncementItem[]>(`${this.baseUrl}/announcements`, { headers: this.getHeaders() });
  }

  // Recruiter dashboard methods
  getRecruiterStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/recruiter-stats`, { headers: this.getHeaders() });
  }

  getRecruiterActivities(): Observable<ActivityItem[]> {
    return this.http.get<ActivityItem[]>(`${this.baseUrl}/recruiter-activities`, { headers: this.getHeaders() });
  }

  getTopPerformingJobs(): Observable<JobPerformanceItem[]> {
    return this.http.get<JobPerformanceItem[]>(`${this.baseUrl}/top-jobs`, { headers: this.getHeaders() });
  }

  getChartData(): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.baseUrl}/chart-data`, { headers: this.getHeaders() });
  }
}
