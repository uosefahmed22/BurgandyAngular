import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCategories(activeOnly: boolean = true): Observable<Category[]> {
    return this.http
      .get<ApiResponse<Category[]>>(`${this.apiUrl}/categories?activeOnly=${activeOnly}`)
      .pipe(map((response: ApiResponse<Category[]>) => response.data));
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http
      .get<ApiResponse<Category>>(`${this.apiUrl}/categories/${id}`)
      .pipe(map((response: ApiResponse<Category>) => response.data));
  }
}
