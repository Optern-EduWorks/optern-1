import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  constructor(private http: HttpClient) {}

  private mapServerToUi(server: any): Job {
    const skillsArray = server.skills
      ? server.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : [];

    const posted = server.PostedDate || server.postedDate || server.Posted || server.posted
      ? new Date(server.PostedDate ?? server.postedDate ?? server.Posted ?? server.posted).toLocaleDateString()
      : null;

    return {
      jobID: server.jobID ?? server.JobID ?? 0,
      title: server.title ?? server.Title ?? 'Untitled',
      company: server.company?.name ?? server.Company?.Name ?? server.company ?? 'Unknown Company',
      location: server.location ?? server.Location ?? 'Remote',
      salary: server.salary ?? server.SalaryRange ?? 'N/A',
      remote: server.remote ?? server.RemoteAllowed ?? false,
      type: server.type ?? server.EmploymentType ?? 'Full-time',
      applicants: server.applicants ?? Math.floor(Math.random() * 120),
      skills: skillsArray.length ? skillsArray : ['General'],
      description: server.description ?? server.Description ?? 'No description provided.',
      rating: server.rating ?? Math.round((4 + Math.random()) * 10) / 10,
      posted: posted ?? new Date().toLocaleDateString(),
      logo: server.logo ?? 'https://i.imgur.com/2JV8V4A.png',
      priority: server.priority ?? server.category ?? server.Category ?? 'medium priority'
      ,
      // populate optional recruiter UI fields
      status: server.status ?? server.Status ?? 'active',
      icon: (server.title ?? server.Title ?? 'U').toString().charAt(0).toUpperCase(),
      workMode: server.workMode ?? server.WorkMode ?? server.workType ?? 'Remote',
  tags: skillsArray.map((s: string) => ({ label: s, color: 'blue' })),
      requirements: server.requirements ?? (server.Requirements ? server.Requirements.split(',') : []) ?? [],
      benefits: server.benefits ?? (server.Benefits ? server.Benefits.split(',') : []) ?? []
    } as Job;
  }

  getAll(): Observable<Job[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map(list => list
        .filter(job => new Date(job.closingDate || job.ClosingDate) >= new Date()) // Filter active jobs
        .map(item => this.mapServerToUi(item))
      )
    );
  }

  getByRecruiter(): Observable<Job[]> {
    return this.http.get<any[]>(`${this.baseUrl}/by-recruiter`).pipe(
      map(list => list.map(item => this.mapServerToUi(item)))
    );
  }

  get(id: number) {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map(item => this.mapServerToUi(item)));
  }

  create(payload: any) {
    return this.http.post<any>(this.baseUrl, payload).pipe(map(item => this.mapServerToUi(item)));
  }

  update(id: number, payload: any) {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
