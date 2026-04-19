import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse, CreateReservationDto, Reservation, TrackReservationParams } from '../models';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private api = inject(ApiService);

  create(dto: CreateReservationDto): Observable<Reservation | null> {
    return this.api.post<ApiResponse<Reservation>>('/reservations', dto).pipe(
      map((response: ApiResponse<Reservation>) => response.data),
    );
  }

  track(params: TrackReservationParams): Observable<Reservation | null> {
    return this.api.get<ApiResponse<Reservation>>('/reservations/track', params).pipe(
      map((response: ApiResponse<Reservation>) => response.data),
    );
  }
}
