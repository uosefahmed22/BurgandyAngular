import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse, CreateReservationDto, Reservation, TrackReservationParams } from '../models';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private api = inject(ApiService);

  create(dto: CreateReservationDto): Observable<Reservation | null> {
    return this.api.post<ApiResponse<Reservation>>('/reservations', dto).pipe(
      map((response: ApiResponse<Reservation>) => response.data),
      catchError((error: any) => {
        console.error('Failed to create reservation:', error);
        return throwError(() => ({
          message: error.message || 'Failed to create reservation',
          status: error.status || 500,
        }));
      }),
    );
  }

  track(params: TrackReservationParams): Observable<Reservation | null> {
    return this.api.get<ApiResponse<Reservation>>('/reservations/track', params).pipe(
      map((response: ApiResponse<Reservation>) => response.data),
      catchError((error: any) => {
        console.error('Failed to track reservation:', error);
        return throwError(() => ({
          message: error.message || 'Failed to track reservation',
          status: error.status || 500,
        }));
      }),
    );
  }
}
