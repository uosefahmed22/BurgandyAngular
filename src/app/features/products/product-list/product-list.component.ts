import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderComponent } from '../../../shared/components/header.component';
import { FooterComponent } from '../../../shared/components/footer.component';
import { WhatsappFabComponent } from '../../../shared/components/whatsapp-fab.component';
import { ProductService, CategoryService } from '@core/services';
import { Product, PaginatedResponse } from '@core/models';
import { ProductCardComponent } from '../../../shared/components/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';

interface Category {
  id: number;
  name: string;
  imageUrl: string | null;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    WhatsappFabComponent,
    ProductCardComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <app-header />
    <main class="flex-1">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-burgundy-900 mb-8">المنتجات</h1>

        <div *ngIf="loadingCategories" class="mb-8">
          <div class="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <div
          *ngIf="!loadingCategories && categoriesError"
          class="bg-red-50 text-red-600 p-4 rounded-lg mb-8"
        >
          ❌ {{ categoriesError }}
        </div>

        <div *ngIf="!loadingCategories && categories.length > 0" class="flex flex-wrap gap-2 mb-8">
          <button
            (click)="filterByCategory(null)"
            [class]="
              !selectedCategoryId
                ? 'bg-burgundy-900 text-white'
                : 'bg-burgundy-100 text-burgundy-900'
            "
            class="px-4 py-2 rounded-lg transition hover:bg-burgundy-800 hover:text-white"
          >
            الكل
          </button>
          <button
            *ngFor="let cat of categories"
            (click)="filterByCategory(cat.id)"
            [class]="
              selectedCategoryId === cat.id
                ? 'bg-burgundy-900 text-white'
                : 'bg-burgundy-100 text-burgundy-900'
            "
            class="px-4 py-2 rounded-lg transition hover:bg-burgundy-800 hover:text-white"
          >
            {{ cat.name }}
          </button>
        </div>

        <div *ngIf="loadingProducts" class="my-8 text-center">
          <app-loading-spinner />
        </div>

        <div
          *ngIf="!loadingProducts && productsError"
          class="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-8"
        >
          ❌ {{ productsError }}
        </div>

        <div
          *ngIf="!loadingProducts && products.length === 0 && !productsError"
          class="text-center text-gray-500 py-16"
        >
          لا توجد منتجات متاحة
        </div>

        <div
          *ngIf="!loadingProducts && products.length > 0"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <app-product-card *ngFor="let product of products" [product]="product" />
        </div>

        <div *ngIf="!loadingProducts && totalPages > 1" class="flex justify-center gap-2 mt-8">
          <button
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage === 1"
            class="px-4 py-2 rounded-lg bg-burgundy-100 text-burgundy-900 disabled:opacity-50"
          >
            السابق
          </button>
          <span class="px-4 py-2">{{ currentPage }} / {{ totalPages }}</span>
          <button
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage === totalPages"
            class="px-4 py-2 rounded-lg bg-burgundy-100 text-burgundy-900 disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      </div>
    </main>
    <app-footer />
    <app-whatsapp-fab />
  `,
})
export class ProductListComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private destroy$ = new Subject<void>();

  products: Product[] = [];
  categories: Category[] = [];
  loadingProducts = true;
  loadingCategories = true;
  selectedCategoryId: number | null = null;
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;
  productsError = '';
  categoriesError = '';

  ngOnInit() {
    console.log('📦 ProductListComponent initialized');

    // Load categories
    this.categoryService
      .getCategories(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Category[]) => {
          console.log('✅ ProductList received categories:', data);
          this.ngZone.run(() => {
            this.categories = [...data];
            this.loadingCategories = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          });
        },
        error: (error: any) => {
          console.error('❌ ProductList failed to load categories:', error);
          this.ngZone.run(() => {
            this.categoriesError = error?.message || 'فشل تحميل التصنيفات';
            this.loadingCategories = false;
            this.cdr.detectChanges();
          });
        },
      });
    // Subscribe to query parameters
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: any) => {
      this.selectedCategoryId = params['categoryId'] ? +params['categoryId'] : null;
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loadingProducts = true;
    this.productsError = '';

    console.log('🔍 Loading products:', {
      page: this.currentPage,
      category: this.selectedCategoryId,
    });

    this.productService
      .getProducts(this.currentPage, this.pageSize, this.selectedCategoryId || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Product>) => {
          console.log('✅ ProductList received products:', response);
          this.ngZone.run(() => {
            this.products = [...response.data]; // Create new array reference
            this.totalPages = response.totalPages;
            this.loadingProducts = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
            console.log('✅ Products rendered on page:', this.products);
          });
        },
        error: (error: any) => {
          console.error('❌ ProductList failed to load products:', error);
          this.ngZone.run(() => {
            this.productsError = error?.message || 'فشل تحميل المنتجات';
            this.loadingProducts = false;
            this.cdr.detectChanges();
          });
        },
      });
  }

  filterByCategory(categoryId: number | null) {
    console.log('🔍 Filtering by category:', categoryId);
    this.router.navigate(['/products'], { queryParams: { categoryId, page: 1 } });
  }

  goToPage(page: number) {
    console.log('📄 Going to page:', page);
    this.router.navigate(['/products'], {
      queryParams: { categoryId: this.selectedCategoryId, page },
    });
  }

  ngOnDestroy() {
    console.log('📦 ProductListComponent destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
