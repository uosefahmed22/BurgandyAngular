import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderComponent } from '../../../shared/components/header.component';
import { FooterComponent } from '../../../shared/components/footer.component';
import { WhatsappFabComponent } from '../../../shared/components/whatsapp-fab.component';
import { ProductService, CategoryService } from '@core/services';
import { Product, PaginatedResponse } from '@core/models';
import { ProductCardComponent } from '../../../shared/components/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

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
    FormsModule,
    HeaderComponent,
    FooterComponent,
    WhatsappFabComponent,
    ProductCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <app-header />
    <main class="flex-1">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-burgundy-900 mb-8">المنتجات</h1>

        <!-- Search Bar -->
        <div class="flex justify-center mb-8">
          <div class="w-full max-w-2xl">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="ابحث عن منتج..."
                class="w-full px-5 py-3.5 pr-12 border-2 border-burgundy-200 rounded-lg focus:outline-none focus:border-burgundy-900 transition text-base"
              />
              <svg
                class="absolute left-4 top-4 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Categories Loading Skeleton -->
        <div *ngIf="loadingCategories" class="mb-8">
          <div class="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <!-- Categories Filter Buttons -->
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

        <!-- Products Loading Spinner -->
        <div *ngIf="loadingProducts" class="my-8 text-center">
          <app-loading-spinner />
        </div>

        <!-- Products Error State with Empty State Component -->
        <app-empty-state
          *ngIf="!loadingProducts && hasProductsError"
          icon="⚠️"
          title="عذراً، حدث خطأ"
          message="لم نتمكن من تحميل المنتجات. يرجى المحاولة لاحقاً"
          [showRetry]="true"
          [onRetry]="loadProducts.bind(this)"
        ></app-empty-state>

        <!-- No Search Results State -->
        <app-empty-state
          *ngIf="!loadingProducts && !hasProductsError && filteredProducts.length === 0 && searchTerm"
          icon="🔍"
          title="لا توجد نتائج"
          message="لم نجد منتجات مطابقة لبحثك"
        ></app-empty-state>

        <!-- No Products Available State -->
        <app-empty-state
          *ngIf="!loadingProducts && !hasProductsError && products.length === 0 && !searchTerm"
          icon="📦"
          title="لا توجد منتجات"
          message="لا توجد منتجات متاحة حالياً"
        ></app-empty-state>

        <!-- Products Grid -->
        <div
          *ngIf="!loadingProducts && !hasProductsError && filteredProducts.length > 0"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <app-product-card *ngFor="let product of filteredProducts" [product]="product" />
        </div>

        <!-- Pagination -->
        <div *ngIf="!loadingProducts && !hasProductsError && totalPages > 1" class="flex justify-center gap-2 mt-8">
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
  searchTerm = '';
  loadingProducts = true;
  loadingCategories = true;
  selectedCategoryId: number | null = null;
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;
  hasProductsError = false;

  get filteredProducts(): Product[] {
    if (!this.searchTerm.trim()) {
      return this.products;
    }
    return this.products.filter((product) =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }

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
            this.loadingCategories = false;
            this.cdr.detectChanges();
            // Toast is shown by the interceptor, no need to display error here
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
    this.hasProductsError = false;

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
            this.products = [...response.data];
            this.totalPages = response.totalPages;
            this.loadingProducts = false;
            this.hasProductsError = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
            console.log('✅ Products rendered on page:', this.products);
          });
        },
        error: (error: any) => {
          console.error('❌ ProductList failed to load products:', error);
          this.ngZone.run(() => {
            this.hasProductsError = true;
            this.loadingProducts = false;
            this.cdr.detectChanges();
            // Toast is shown by the interceptor, no need to display error here
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
