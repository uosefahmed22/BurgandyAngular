import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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

  constructor() {
    console.log('CategoryService initialized with API URL:', this.apiUrl);
  }

  getCategories(activeOnly: boolean = true): Observable<Category[]> {
    const url = `${this.apiUrl}/categories?activeOnly=${activeOnly}`;
    console.log('🔍 Fetching categories from:', url);
    return this.http.get<ApiResponse<Category[]>>(url).pipe(
      tap((response: ApiResponse<Category[]>) =>
        console.log('✅ Raw categories response:', response),
      ),
      map((response: ApiResponse<Category[]>) => response.data),
      tap((categories: Category[]) => console.log('✅ Extracted categories:', categories)),
    );
  }

  getCategoryById(id: number): Observable<Category> {
    const url = `${this.apiUrl}/categories/${id}`;
    console.log('🔍 Fetching category:', url);
    return this.http.get<ApiResponse<Category>>(url).pipe(
      tap((response: ApiResponse<Category>) => console.log('✅ Category response:', response)),
      map((response: ApiResponse<Category>) => response.data),
    );
  }
}
