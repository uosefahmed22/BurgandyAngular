import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

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
    return this.http.get<T>(url, { params: httpParams }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, url)),
    );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.post<T>(url, body).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, url)),
    );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.put<T>(url, body).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, url)),
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.delete<T>(url).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error, url)),
    );
  }

  private handleError(error: HttpErrorResponse, url: string) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || error.message || errorMessage;
    }

    if (isDevMode()) {
      console.error(`❌ API Error (${error.status}):`, url, errorMessage);
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error,
    }));
  }
}
