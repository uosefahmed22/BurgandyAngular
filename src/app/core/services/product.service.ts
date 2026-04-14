import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Product, ApiResponse, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor() {
    console.log('ProductService initialized with API URL:', this.apiUrl);
  }

  getProducts(
    pageIndex: number = 1,
    pageSize: number = 10,
    categoryId?: number,
  ): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());

    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }

    const url = `${this.apiUrl}/products`;
    console.log('🔍 Fetching products:', url, { pageIndex, pageSize, categoryId });
    return this.http.get<ApiResponse<PaginatedResponse<Product>>>(url, { params }).pipe(
      tap((response: ApiResponse<PaginatedResponse<Product>>) =>
        console.log('✅ Raw API Response:', response),
      ),
      // The API returns: response.data.data (products array inside nested data)
      map((response: ApiResponse<PaginatedResponse<Product>>) => response.data),
      tap((paginatedData: PaginatedResponse<Product>) =>
        console.log('✅ Paginated Data (after first unwrap):', paginatedData),
      ),
    );
  }

  getProductById(id: number): Observable<Product> {
    const url = `${this.apiUrl}/products/${id}`;
    console.log('🔍 Fetching product:', url);
    return this.http.get<ApiResponse<Product>>(url).pipe(
      tap((response: ApiResponse<Product>) => console.log('✅ Product Response:', response)),
      map((response: ApiResponse<Product>) => response.data),
    );
  }

  getById(id: number): Observable<Product> {
    const url = `${this.apiUrl}/products/${id}`;
    console.log('Fetching product by ID:', url);
    return this.http.get<ApiResponse<Product>>(url).pipe(
      tap((response: ApiResponse<Product>) => console.log('✅ Product by ID:', response)),
      map((response: ApiResponse<Product>) => response.data),
    );
  }
}
