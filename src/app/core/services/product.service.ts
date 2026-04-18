import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Product, ApiResponse, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getProducts(
    pageIndex: number = 1,
    pageSize: number = 10,
    categoryId?: number,
    sort?: string,
    discountedOnly?: boolean,
  ): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());

    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }
    if (sort) {
      params = params.set('sort', sort);
    }
    if (discountedOnly) {
      params = params.set('discountedOnly', 'true');
    }

    return this.http
      .get<ApiResponse<PaginatedResponse<Product>>>(`${this.apiUrl}/products`, { params })
      .pipe(map((response: ApiResponse<PaginatedResponse<Product>>) => response.data));
  }

  getProductById(id: number): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`)
      .pipe(map((response: ApiResponse<Product>) => response.data));
  }

  getById(id: number): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`)
      .pipe(map((response: ApiResponse<Product>) => response.data));
  }

  getDiscountedProducts(): Observable<Product[]> {
    return this.http
      .get<ApiResponse<Product[]>>(`${this.apiUrl}/products/discounted`)
      .pipe(map((response: ApiResponse<Product[]>) => response.data));
  }
}
