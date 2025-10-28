import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  companyID: number;
  name: string;
  website?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private baseUrl = '/api/Companies';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.baseUrl);
  }

  get(id: number) {
    return this.http.get<Company>(`${this.baseUrl}/${id}`);
  }
}
