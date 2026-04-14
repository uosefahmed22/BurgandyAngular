import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderComponent } from '@shared/components/header.component';
import { FooterComponent } from '@shared/components/footer.component';
import { WhatsappFabComponent } from '@shared/components/whatsapp-fab.component';
import { ProductService } from '@core/services';
import { Product } from '@core/models';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    FooterComponent,
    WhatsappFabComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <app-header />
    <main class="flex-1">
      <div class="container mx-auto px-4 py-8">
        <div *ngIf="loading" class="text-center py-16">
          <app-loading-spinner />
        </div>

        <div
          *ngIf="!loading && error"
          class="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-8"
        >
          ❌ {{ error }}
        </div>

        <div *ngIf="!loading && !product" class="text-center py-16">
          <p class="text-gray-500 mb-4">المنتج غير موجود</p>
          <a routerLink="/products" class="text-burgundy-700 hover:underline">العودة للمنتجات</a>
        </div>

        <div *ngIf="!loading && product" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div class="aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-white shadow-md">
              <img [src]="currentImage" [alt]="product.name" class="w-full h-full object-cover" />
            </div>
            <div *ngIf="product.images.length > 1" class="flex gap-2 overflow-x-auto pb-2">
              <button
                *ngFor="let img of product.images; let i = index"
                (click)="selectImage(i)"
                [class]="i === selectedImageIndex ? 'ring-2 ring-burgundy-900' : 'opacity-60'"
                class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
              >
                <img [src]="img.imageUrl" [alt]="product.name" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>
          <div>
            <span
              class="inline-block bg-burgundy-100 text-burgundy-900 text-sm px-3 py-1 rounded-full mb-4"
              >{{ product.categoryName }}</span
            >
            <h1 class="text-3xl font-bold text-burgundy-900 mb-4">{{ product.name }}</h1>
            <p class="text-3xl font-bold text-burgundy-900 mb-6">{{ product.price }} ج.م</p>
            <p *ngIf="product.description" class="text-gray-600 mb-6">{{ product.description }}</p>
            <div class="mb-6">
              <h3 class="font-semibold text-burgundy-900 mb-2">المقاسات المتاحة:</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  *ngFor="let size of sizesArray"
                  class="bg-burgundy-50 text-burgundy-900 px-4 py-2 rounded-lg border border-burgundy-200"
                  >{{ size }}</span
                >
              </div>
            </div>
            <div class="mb-8">
              <h3 class="font-semibold text-burgundy-900 mb-2">الألوان المتاحة:</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  *ngFor="let color of colorsArray"
                  class="bg-burgundy-50 text-burgundy-900 px-4 py-2 rounded-lg border border-burgundy-200"
                  >{{ color }}</span
                >
              </div>
            </div>
            <a
              *ngIf="product.isAvailable"
              [routerLink]="['/reserve', product.id]"
              class="block w-full bg-burgundy-900 hover:bg-burgundy-800 text-white text-center font-semibold py-4 rounded-xl transition text-lg"
              >احجز الآن</a
            >
            <div
              *ngIf="!product.isAvailable"
              class="bg-gray-100 text-gray-500 text-center font-semibold py-4 rounded-xl"
            >
              غير متاح للحجز حالياً
            </div>
          </div>
        </div>
      </div>
    </main>
    <app-footer />
    <app-whatsapp-fab />
  `,
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  product: Product | null = null;
  loading = true;
  error = '';
  selectedImageIndex = 0;

  get sizesArray(): string[] {
    return (
      this.product?.sizes
        ?.split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => !!s) || []
    );
  }

  get colorsArray(): string[] {
    return (
      this.product?.colors
        ?.split(',')
        .map((c: string) => c.trim())
        .filter((c: string) => !!c) || []
    );
  }

  ngOnInit(): void {
    console.log('📄 ProductDetailsComponent initialized');

    const id = +this.route.snapshot.params['id'];
    console.log('🔍 Loading product ID:', id);

    this.productService
      .getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Product): void => {
          console.log('✅ ProductDetails received product:', data);
          this.product = data;
          this.loading = false;
        },
        error: (error: any): void => {
          console.error('❌ ProductDetails failed to load product:', error);
          this.error = error?.message || 'فشل تحميل تفاصيل المنتج';
          this.loading = false;
        },
      });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  get currentImage(): string {
    return (
      this.product?.images?.[this.selectedImageIndex]?.imageUrl ||
      'https://via.placeholder.com/600x800?text=No+Image'
    );
  }

  ngOnDestroy(): void {
    console.log('📄 ProductDetailsComponent destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
