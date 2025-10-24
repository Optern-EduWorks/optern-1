import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  companyID: number;
  name: string;
  website?: string;
  address?: string;
  phone?: string;
  size?: string;
  createdDate?: Date;
  industryID?: number;
  headquarters?: string;
  founded?: string;
  benefits?: string;
  about?: string;
  culture?: string;
}

export interface CompanyUpdateDto {
  companyID: number;
  name: string;
  website?: string;
  address?: string;
  phone?: string;
  size?: string;
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

  update(id: number, company: CompanyUpdateDto): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/${id}`, company);
  }
}
