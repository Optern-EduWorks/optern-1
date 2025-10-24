import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    return this.http.get<Application[]>(`${this.baseUrl}/by-candidate`);
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
}
