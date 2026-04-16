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
        <div class="flex justify-center mb-6">
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
        <div *ngIf="loadingCategories" class="mb-6">
          <div class="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <!-- Categories Filter Buttons -->
        <div *ngIf="!loadingCategories && categories.length > 0" class="flex flex-wrap gap-2 mb-6">
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

        <!-- Filters Row -->
        <div
          class="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
          style="direction: rtl;"
        >
          <!-- Sort Dropdown -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-500 font-medium whitespace-nowrap">ترتيب:</label>
            <select
              [(ngModel)]="selectedSort"
              (ngModelChange)="onFilterChange()"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-burgundy-900 cursor-pointer"
            >
              <option value="">الأحدث</option>
              <option value="oldest">الأقدم</option>
              <option value="priceAsc">السعر: الأقل</option>
              <option value="priceDesc">السعر: الأعلى</option>
            </select>
          </div>

          <!-- Separator -->
          <div class="hidden md:block w-px h-8 bg-gray-200"></div>

          <!-- Price Range -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-500 font-medium whitespace-nowrap">السعر:</label>
            <input
              type="number"
              [(ngModel)]="minPrice"
              (ngModelChange)="onPriceFilterChange()"
              placeholder="من"
              class="w-20 border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-burgundy-900"
              min="0"
            />
            <span class="text-gray-400 text-sm">—</span>
            <input
              type="number"
              [(ngModel)]="maxPrice"
              (ngModelChange)="onPriceFilterChange()"
              placeholder="إلى"
              class="w-20 border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-burgundy-900"
              min="0"
            />
            <span class="text-gray-400 text-xs">ج.م</span>
          </div>

          <!-- Separator -->
          <div class="hidden md:block w-px h-8 bg-gray-200"></div>

          <!-- Discounted Only Toggle -->
          <button
            (click)="toggleDiscountedOnly()"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            [ngClass]="{
              'bg-red-500 text-white shadow-sm': discountedOnly,
              'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600': !discountedOnly,
            }"
          >
            🔥
            <span>العروض فقط</span>
          </button>

          <!-- Clear Filters -->
          <button
            *ngIf="hasActiveFilters"
            (click)="clearFilters()"
            class="text-xs text-gray-400 hover:text-red-500 transition mr-auto"
          >
            ✕ مسح الفلاتر
          </button>
        </div>

        <!-- Products Loading Spinner -->
        <div *ngIf="loadingProducts" class="my-8 text-center">
          <app-loading-spinner />
        </div>

        <!-- Products Error State -->
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
          *ngIf="
            !loadingProducts &&
            !hasProductsError &&
            filteredProducts.length === 0 &&
            (searchTerm || minPrice || maxPrice)
          "
          icon="🔍"
          title="لا توجد نتائج"
          message="لم نجد منتجات مطابقة — جربي تغيير الفلاتر"
        ></app-empty-state>

        <!-- No Products Available State -->
        <app-empty-state
          *ngIf="!loadingProducts && !hasProductsError && products.length === 0 && !searchTerm"
          icon="📦"
          title="لا توجد منتجات"
          message="لا توجد منتجات متاحة حالياً"
        ></app-empty-state>

        <!-- Results Count -->
        <div
          *ngIf="!loadingProducts && !hasProductsError && filteredProducts.length > 0"
          class="mb-4"
        >
          <p class="text-sm text-gray-400">{{ filteredProducts.length }} منتج</p>
        </div>

        <!-- Products Grid -->
        <div
          *ngIf="!loadingProducts && !hasProductsError && filteredProducts.length > 0"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <app-product-card *ngFor="let product of filteredProducts" [product]="product" />
        </div>

        <!-- Pagination -->
        <div
          *ngIf="!loadingProducts && !hasProductsError && totalPages > 1"
          class="flex justify-center gap-2 mt-8"
        >
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

  // Filter state
  selectedSort = '';
  discountedOnly = false;
  minPrice: number | null = null;
  maxPrice: number | null = null;

  get hasActiveFilters(): boolean {
    return (
      !!this.selectedSort || this.discountedOnly || this.minPrice !== null || this.maxPrice !== null
    );
  }

  get filteredProducts(): Product[] {
    let result = this.products;

    // Client-side search filter
    if (this.searchTerm.trim()) {
      result = result.filter((p) => p.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    // Client-side price range filter
    if (this.minPrice !== null && this.minPrice > 0) {
      result = result.filter((p) => {
        const price = p.hasActiveDiscount ? p.salePrice : p.price;
        return price >= this.minPrice!;
      });
    }
    if (this.maxPrice !== null && this.maxPrice > 0) {
      result = result.filter((p) => {
        const price = p.hasActiveDiscount ? p.salePrice : p.price;
        return price <= this.maxPrice!;
      });
    }

    return result;
  }

  ngOnInit() {
    console.log('📦 ProductListComponent initialized');

    // Load categories
    this.categoryService
      .getCategories(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Category[]) => {
          this.ngZone.run(() => {
            this.categories = [...data];
            this.loadingCategories = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.loadingCategories = false;
            this.cdr.detectChanges();
          });
        },
      });

    // Subscribe to query parameters
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: any) => {
      this.selectedCategoryId = params['categoryId'] ? +params['categoryId'] : null;
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.selectedSort = params['sort'] || '';
      this.discountedOnly = params['discountedOnly'] === 'true';
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loadingProducts = true;
    this.hasProductsError = false;

    this.productService
      .getProducts(
        this.currentPage,
        this.pageSize,
        this.selectedCategoryId || undefined,
        this.selectedSort || undefined,
        this.discountedOnly || undefined,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Product>) => {
          this.ngZone.run(() => {
            this.products = [...response.data];
            this.totalPages = response.totalPages;
            this.loadingProducts = false;
            this.hasProductsError = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.hasProductsError = true;
            this.loadingProducts = false;
            this.cdr.detectChanges();
          });
        },
      });
  }

  onFilterChange() {
    this.router.navigate(['/products'], {
      queryParams: {
        categoryId: this.selectedCategoryId,
        page: 1,
        sort: this.selectedSort || null,
        discountedOnly: this.discountedOnly || null,
      },
    });
  }

  onPriceFilterChange() {
    // Price range is client-side — no navigation needed
  }

  toggleDiscountedOnly() {
    this.discountedOnly = !this.discountedOnly;
    this.onFilterChange();
  }

  clearFilters() {
    this.selectedSort = '';
    this.discountedOnly = false;
    this.minPrice = null;
    this.maxPrice = null;
    this.searchTerm = '';
    this.onFilterChange();
  }

  filterByCategory(categoryId: number | null) {
    this.router.navigate(['/products'], {
      queryParams: {
        categoryId,
        page: 1,
        sort: this.selectedSort || null,
        discountedOnly: this.discountedOnly || null,
      },
    });
  }

  goToPage(page: number) {
    this.router.navigate(['/products'], {
      queryParams: {
        categoryId: this.selectedCategoryId,
        page,
        sort: this.selectedSort || null,
        discountedOnly: this.discountedOnly || null,
      },
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
