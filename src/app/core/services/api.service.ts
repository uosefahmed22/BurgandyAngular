import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  constructor() {
    console.log('🚀 ApiService initialized');
    console.log('📍 API Base URL:', this.baseUrl);
  }

  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    const url = `${this.baseUrl}${endpoint}`;
    console.log('📤 GET Request:', url, params ? `with params: ${JSON.stringify(params)}` : '');
    return this.http.get<T>(url, { params: httpParams }).pipe(
      tap((data: T) => console.log('✅ GET Response:', endpoint, data)),
      catchError((error: HttpErrorResponse) => this.handleError(error, url)),
    );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('📤 POST Request:', url, body);
    return this.http.post<T>(url, body).pipe(
      tap((data: T) => console.log('✅ POST Response:', endpoint, data)),
      catchError((error: HttpErrorResponse) => this.handleError(error, url)),
    );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('📤 PUT Request:', url, body);
    return this.http.put<T>(url, body).pipe(
      tap((data: T) => console.log('✅ PUT Response:', endpoint, data)),
      catchError((error: HttpErrorResponse) => this.handleError(error, url)),
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('📤 DELETE Request:', url);
    return this.http.delete<T>(url).pipe(
      tap((data: T) => console.log('✅ DELETE Response:', endpoint, data)),
      catchError((error: HttpErrorResponse) => this.handleError(error, url)),
    );
  }

  private handleError(error: HttpErrorResponse, url: string) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
      console.error('❌ Client-side error:', errorMessage);
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || errorMessage;
      console.error(`❌ Server error (${error.status}):`, errorMessage);
      console.error('Full error response:', error.error);
    }

    console.error('API Error Details:', {
      url,
      status: error.status,
      statusText: error.statusText,
      message: errorMessage,
    });

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error,
    }));
  }
}
