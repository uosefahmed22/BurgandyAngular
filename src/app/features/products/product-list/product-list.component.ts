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
  templateUrl: './product-list.component.html',
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
