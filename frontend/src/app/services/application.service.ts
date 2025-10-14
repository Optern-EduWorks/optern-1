import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Application {
  applicationID: number;
  jobID: number;
  candidateID: number;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private baseUrl = '/api/Applications';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Application[]> {
    return this.http.get<Application[]>(this.baseUrl);
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
