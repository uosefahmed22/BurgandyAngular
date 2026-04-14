import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse, StoreSettings } from '../models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private api = inject(ApiService);

  get(): Observable<StoreSettings | null> {
    return this.api.get<ApiResponse<StoreSettings>>('/settings').pipe(
      map((response: ApiResponse<StoreSettings>) => response.data),
      catchError((error: any) => {
        console.error('Failed to fetch settings:', error);
        return of(null);
      }),
    );
  }
}
