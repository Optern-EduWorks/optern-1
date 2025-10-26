import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

export interface Application {
  ApplicationID: number;
  JobID: number;
  CandidateID: number;
  Status: string;
  AppliedDate: string;
  CoverLetter: string;
  ResumeUrl: string;
  InterviewStatus: string;
  Job?: {
    JobID: number;
    Title: string;
    Company: string;
    Location: string;
    SalaryRange: string;
    EmploymentType: string;
    Description: string;
    Skills: string;
    ClosingDate: string;
    PostedDate: string;
    RecruiterID: number;
  };
  Candidate?: {
    CandidateID: number;
    FullName: string;
    Email: string;
    PhoneNumber: string;
    Address: string;
    CreatedDate: string;
    UpdatedDate: string;
  };
}

export interface ApplicationUpdateRequest {
  status?: string;
  interviewStatus?: string;
  coverLetter?: string;
  resumeUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private baseUrl = '/api/Applications';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Application[]> {
    return this.http.get<Application[]>(this.baseUrl);
  }

  getByRecruiter(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.baseUrl}/by-recruiter`);
  }

  getByCandidate(): Observable<Application[]> {
    console.log('ApplicationService: Fetching applications for candidate');
    const token = this.getToken();
    console.log('Using token for request:', token);
    return this.http.get<Application[]>(`/api/Applications/by-candidate`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : 'Bearer test-token'
      }
    }).pipe(
      tap(response => {
        console.log('Raw API response:', response);
        console.log('Response type:', typeof response);
        console.log('Is array:', Array.isArray(response));
        if (Array.isArray(response)) {
          console.log('Found array with', response.length, 'applications');
        }
      })
    );
  }

  get(id: number) {
    return this.http.get<Application>(`${this.baseUrl}/${id}`);
  }

  create(payload: any) {
    return this.http.post(this.baseUrl, payload);
  }

  update(id: number, payload: any) {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  private getToken(): string | null {
    const user = localStorage.getItem('optern_user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.token || null;
      } catch {
        return null;
      }
    }
    return null;
  }
}
