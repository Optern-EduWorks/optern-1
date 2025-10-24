import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RecruiterProfile, RecruiterProfileDto, Company } from '../models/recruiter-profile.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RecruiterProfileService {
  private apiUrl = '/api/Recruiters';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Get current recruiter's profile
  getProfile(): Observable<RecruiterProfile | null> {
    const currentUser = this.authService.getCurrentUser();
    console.log('Getting recruiter profile for current user:', currentUser);

    if (!currentUser || !currentUser.userId) {
      console.log('No user logged in, returning null');
      return of(null);
    }

    console.log('Fetching recruiter profile from:', `${this.apiUrl}/me`);
    return this.http.get<RecruiterProfileDto>(`${this.apiUrl}/me`).pipe(
      map(dto => {
        console.log('Recruiter profile DTO received:', dto);
        return this.convertDtoToProfile(dto);
      }),
      catchError(error => {
        console.error('Error fetching recruiter profile:', error);
        return this.handleError(error);
      })
    );
  }

  // Update recruiter profile
  updateProfile(profile: RecruiterProfile): Observable<RecruiterProfile> {
    console.log('Updating recruiter profile:', profile);

    if (!profile || !profile.recruiterID) {
      console.error('Update profile failed: Profile or ID is missing');
      return throwError(() => new Error('Profile data is missing'));
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      console.error('Update profile failed: No user logged in');
      return throwError(() => new Error('Please log in to save your profile'));
    }

    // Convert to DTO format for backend
    const profileDto = this.convertProfileToDto(profile);
    profileDto.UpdatedDate = new Date().toISOString();

    console.log('Profile DTO before updating backend:', profileDto);
    return this.http.put<RecruiterProfileDto>(`${this.apiUrl}/${profile.recruiterID}`, profileDto).pipe(
      map(response => {
        console.log('Profile updated successfully:', response);
        return this.convertDtoToProfile(response);
      }),
      catchError(error => {
        console.error('Error updating profile:', error);
        return this.handleError(error);
      })
    );
  }

  // Convert DTO to frontend model
  private convertDtoToProfile(dto: RecruiterProfileDto): RecruiterProfile {
    return {
      recruiterID: dto.RecruiterID,
      companyID: dto.CompanyID,
      fullName: dto.FullName,
      email: dto.Email,
      jobTitle: dto.JobTitle,
      phoneNumber: dto.PhoneNumber,
      bio: dto.Bio,
      createdDate: new Date(dto.CreatedDate),
      updatedDate: new Date(dto.UpdatedDate),
      company: dto.Company ? {
        companyID: dto.Company.CompanyID,
        name: dto.Company.Name,
        website: dto.Company.Website,
        size: dto.Company.Size,
        address: dto.Company.Address,
        phone: dto.Company.Phone,
        createdDate: dto.Company.CreatedDate,
        industryID: dto.Company.IndustryID,
        industry: dto.Company.Industry ? {
          industryID: dto.Company.Industry.IndustryID,
          name: dto.Company.Industry.IndustryName
        } : undefined
      } : undefined
    };
  }

  // Convert frontend model to DTO
  private convertProfileToDto(profile: RecruiterProfile): RecruiterProfileDto {
    return {
      RecruiterID: profile.recruiterID,
      CompanyID: profile.companyID,
      FullName: profile.fullName,
      Email: profile.email,
      JobTitle: profile.jobTitle,
      PhoneNumber: profile.phoneNumber,
      Bio: profile.bio,
      CreatedDate: profile.createdDate.toISOString(),
      UpdatedDate: profile.updatedDate.toISOString()
    };
  }

  // Update company information
  updateCompany(company: Company): Observable<Company> {
    console.log('Updating company:', company);

    if (!company || !company.companyID) {
      console.error('Update company failed: Company or ID is missing');
      return throwError(() => new Error('Company data is missing'));
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.userId) {
      console.error('Update company failed: No user logged in');
      return throwError(() => new Error('Please log in to save company information'));
    }

    console.log('Company data before updating backend:', company);
    return this.http.put<Company>(`${this.apiUrl}/company/${company.companyID}`, company).pipe(
      map(response => {
        console.log('Company updated successfully:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error updating company:', error);
        return this.handleError(error);
      })
    );
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Recruiter profile service error:', error);

    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        switch (error.status) {
          case 401:
            errorMessage = 'Unauthorized. Please log in again.';
            break;
          case 403:
            errorMessage = 'Access denied. You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'Profile not found';
            break;
          case 400:
            errorMessage = 'Invalid profile data';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Server returned code: ${error.status}`;
        }
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
