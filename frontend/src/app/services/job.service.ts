import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Job {
  jobID: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  remote: boolean;
  type: string;
  applicants: number;
  skills: string[];
  description: string;
  rating: number;
  posted: string;
  logo: string;
  priority: string;
  // optional fields used by recruiter UI
  status?: string;
  icon?: string;
  workMode?: string;
  tags?: { label: string; color?: string }[];
  requirements?: string[];
  benefits?: string[];
}

@Injectable({ providedIn: 'root' })
export class JobService {
  // Use relative path so proxy (or backend hosting) works
  private baseUrl = '/api/Jobs';
  
  // BehaviorSubjects to store the latest jobs data
  private jobsSubject = new BehaviorSubject<Job[]>([]);
  private recruiterJobsSubject = new BehaviorSubject<Job[]>([]);
  
  // Observable streams that components can subscribe to
  public jobs$ = this.jobsSubject.asObservable();
  public recruiterJobs$ = this.recruiterJobsSubject.asObservable();

  // Refresh interval in milliseconds (e.g., every 30 seconds)
  private readonly refreshInterval = 30000;

  constructor(private http: HttpClient) {
    // Start periodic refresh for jobs
    this.startPeriodicRefresh();
  }

  private startPeriodicRefresh() {
    console.log('Starting periodic refresh');
    // Initial load
    this.refreshAllJobs();
    this.refreshRecruiterJobs();

    // Set up periodic refresh - only refresh all jobs, not recruiter jobs to prevent flicker
    setInterval(() => {
      console.log('Running periodic refresh');
      this.refreshAllJobs();
      // Removed refreshRecruiterJobs() from periodic refresh to prevent clearing jobs list
    }, this.refreshInterval);
  }

  private refreshAllJobs() {
    console.log('Refreshing all jobs');
    this.getAllFromServer().subscribe({
      next: jobs => {
        console.log('Received all jobs:', jobs);
        this.jobsSubject.next(jobs);
      },
      error: error => {
        console.error('Error fetching all jobs:', error);
      }
    });
  }

  private refreshRecruiterJobs() {
    console.log('Refreshing recruiter jobs');
    this.getByRecruiterFromServer().subscribe({
      next: jobs => {
        console.log('Received recruiter jobs:', jobs);
        console.log('Number of recruiter jobs:', jobs?.length || 0);
        this.recruiterJobsSubject.next(jobs || []);
      },
      error: error => {
        console.error('Error fetching recruiter jobs:', error);
        console.error('Error details:', error.error || error.message);
        console.error('Full error object:', error);
        console.error('Error status:', error.status);
        console.error('Error statusText:', error.statusText);

        // Log authentication details for debugging
        const raw = localStorage.getItem('optern_user');
        if (raw) {
          try {
            const user = JSON.parse(raw);
            console.log('User in localStorage:', { email: user.email, hasToken: !!user.token, role: user.role });
          } catch (e) {
            console.error('Error parsing user from localStorage:', e);
          }
        } else {
          console.warn('No user data found in localStorage');
        }

        // Do NOT set empty array on error - keep current jobs to prevent flicker
        // Only log the error and let the UI retain current state
        console.warn('Keeping current jobs due to fetch error - not clearing the list');
      }
    });
  }

  private mapServerToUi(server: any): Job {
    const skillsArray = server.skills
      ? server.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : [];

    const posted = server.PostedDate || server.postedDate || server.Posted || server.posted
      ? new Date(server.PostedDate ?? server.postedDate ?? server.Posted ?? server.posted).toLocaleDateString()
      : new Date().toLocaleDateString();

    // Map workMode based on RemoteAllowed field
    const workMode = server.RemoteAllowed === true ? 'Remote' : 'Onsite';

    const mappedJob = {
      jobID: server.jobID ?? server.JobID ?? 0,
      title: server.title ?? server.Title ?? 'Untitled',
      company: server.company?.name ?? server.Company?.Name ?? server.company ?? 'Unknown Company',
      location: server.location ?? server.Location ?? 'Not specified',
      salary: server.salary ?? server.SalaryRange ?? 'Competitive',
      remote: server.remote ?? server.RemoteAllowed ?? false,
      type: server.type ?? server.EmploymentType ?? 'Full-time',
      applicants: server.applicants ?? 0,
      skills: skillsArray.length ? skillsArray : ['General'],
      description: server.description ?? server.Description ?? 'No description provided.',
      rating: server.rating ?? 4.5,
      posted: posted,
      logo: server.logo ?? 'https://i.imgur.com/2JV8V4A.png',
      priority: server.priority ?? server.category ?? server.Category ?? 'medium priority',
      // populate optional recruiter UI fields
      status: server.status ?? server.Status ?? 'active',
      icon: (server.title ?? server.Title ?? 'U').toString().charAt(0).toUpperCase(),
      workMode: workMode,
      tags: skillsArray.map((s: string) => ({ label: s, color: 'blue' })),
      requirements: server.requirements ?? (server.Requirements ? server.Requirements.split(',') : []) ?? [],
      benefits: server.benefits ?? (server.Benefits ? server.Benefits.split(',') : []) ?? []
    } as Job;

    return mappedJob;
  }

  // Server fetch methods
  private getAllFromServer(): Observable<Job[]> {
    console.log('Fetching all jobs from server');
    return this.http.get<any[]>(this.baseUrl).pipe(
      map(list => {
        console.log('Raw server response (all jobs):', list);
        return list
          .filter(job => {
            const closingDate = new Date(job.closingDate || job.ClosingDate);
            const isActive = closingDate >= new Date();
            if (!isActive) {
              console.log('Filtering out expired job:', job);
            }
            return isActive;
          })
          .map(item => {
            const mappedJob = this.mapServerToUi(item);
            return mappedJob;
          });
      })
    );
  }

  private getByRecruiterFromServer(): Observable<Job[]> {
    console.log('Fetching recruiter jobs from server');
    return this.http.get<any>(`${this.baseUrl}/by-recruiter`).pipe(
      map(response => {
        console.log('Raw server response (recruiter jobs):', response);
        console.log('Response type:', typeof response, 'isArray:', Array.isArray(response));
        let jobsArray: any[] = [];
        if (Array.isArray(response)) {
          jobsArray = response;
        } else if (response && typeof response === 'object') {
          // Try different possible properties for the jobs array
          jobsArray = response.data || response.jobs || response.result || [];
          if (!Array.isArray(jobsArray)) {
            console.warn('Jobs property is not an array:', jobsArray);
            jobsArray = [];
          }
        } else {
          console.warn('Unexpected response type for recruiter jobs:', typeof response, response);
        }
        return jobsArray.map((item: any) => {
          try {
            const mappedJob = this.mapServerToUi(item);
            return mappedJob;
          } catch (e) {
            console.error('Error mapping job:', item, e);
            return null;
          }
        }).filter(job => job != null);
      })
    );
  }

  // Public methods that components should use
  getAll(): Observable<Job[]> {
    // Trigger a refresh
    this.refreshAllJobs();
    // Return the observable stream
    return this.jobs$;
  }

  getByRecruiter(): Observable<Job[]> {
    // Trigger a refresh
    this.refreshRecruiterJobs();
    // Return the observable stream
    return this.recruiterJobs$;
  }

  loadRecruiterJobs(): Observable<Job[]> {
    return this.getByRecruiterFromServer().pipe(
      tap(jobs => {
        this.recruiterJobsSubject.next(jobs || []);
      })
    );
  }

  get(id: number) {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map(item => this.mapServerToUi(item)));
  }

  create(payload: any) {
    return this.http.post<any>(this.baseUrl, payload).pipe(
      map(response => {
        // Handle the backend response structure: { success: true, message: "...", job: jobDto, jobId: number }
        const jobData = response.job || response;
        return this.mapServerToUi(jobData);
      }),
      tap((createdJob) => {
        // Immediately add to recruiter jobs to prevent flicker
        const currentJobs = this.recruiterJobsSubject.value || [];
        this.recruiterJobsSubject.next([createdJob, ...currentJobs]);

        // Refresh all jobs immediately for other components
        this.refreshAllJobs();
      })
    );
  }

  update(id: number, payload: any) {
    return this.http.put(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => {
        // Refresh both job lists after update
        this.refreshAllJobs();
        // Removed refreshRecruiterJobs() to prevent clearing jobs list
      })
    );
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        // Refresh both job lists after deletion
        this.refreshAllJobs();
        // Removed refreshRecruiterJobs() to prevent clearing jobs list
      })
    );
  }
}
