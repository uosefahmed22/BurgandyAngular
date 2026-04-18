import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
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
    <main class="flex-1 bg-[#FDF8F6]">
      <div class="container mx-auto px-4 py-6 md:py-10">
        <!-- Back Link -->
        <a
          routerLink="/products"
          class="inline-flex items-center gap-2 text-[#722F37] hover:text-[#5a252c] mb-6 text-sm font-medium transition"
        >
          <svg class="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          العودة للمنتجات
        </a>

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
          <a routerLink="/products" class="text-[#722F37] hover:underline">العودة للمنتجات</a>
        </div>

        <!-- Product Details Card -->
        <div *ngIf="!loading && product" class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-2">
            <!-- Left: Image Gallery -->
            <div class="p-4 md:p-6 bg-white">
              <div class="aspect-[3/4] max-h-[500px] rounded-xl overflow-hidden mb-3 bg-gray-50">
                <img [src]="currentImage" [alt]="product.name" class="w-full h-full object-cover" />
              </div>
              <div *ngIf="product.images.length > 1" class="flex gap-2 overflow-x-auto pb-1">
                <button
                  *ngFor="let img of product.images; let i = index"
                  (click)="selectImage(i)"
                  class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200"
                  [ngClass]="{
                    'border-[#722F37] shadow-md': i === selectedImageIndex,
                    'border-transparent opacity-60 hover:opacity-100': i !== selectedImageIndex,
                  }"
                >
                  <img
                    [src]="img.imageUrl"
                    [alt]="product.name"
                    class="w-full h-full object-cover"
                  />
                </button>
              </div>
            </div>

            <!-- Right: Product Info -->
            <div class="p-5 md:p-8 flex flex-col justify-center" style="direction: rtl">
              <!-- Category Badge -->
              <div class="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  class="inline-block bg-[#F5ECE6] text-[#722F37] text-xs px-3 py-1 rounded-full w-fit font-medium"
                >
                  {{ product.categoryName }}
                </span>
                @if (product.hasActiveDiscount) {
                  <span
                    class="inline-block bg-red-50 text-red-600 text-xs px-3 py-1 rounded-full w-fit font-bold animate-pulse"
                  >
                    🔥 عرض خاص
                  </span>
                }
              </div>

              <!-- Product Name -->
              <h1 class="text-xl md:text-2xl font-bold text-[#722F37] mb-2">{{ product.name }}</h1>

              <!-- Price -->
              <div class="mb-4">
                @if (product.hasActiveDiscount) {
                  <div class="flex items-center gap-3 flex-wrap">
                    <p class="text-2xl md:text-3xl font-bold text-green-600">
                      {{ product.salePrice }} <span class="text-base font-medium">ج.م</span>
                    </p>
                    <p class="text-lg text-gray-400 line-through">{{ product.price }} ج.م</p>
                    <span class="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      -{{ product.discountPercentage }}% 🔥
                    </span>
                  </div>
                  <div class="mt-1.5 flex items-center gap-1.5">
                    <span class="text-orange-500 text-xs font-medium">
                      ⏰
                      @if (product.discountRemainingDays === 0) {
                        العرض ينتهي اليوم!
                      } @else if (product.discountRemainingDays === 1) {
                        باقي يوم واحد على العرض
                      } @else {
                        باقي {{ product.discountRemainingDays }} أيام على العرض
                      }
                    </span>
                  </div>
                } @else {
                  <p class="text-2xl md:text-3xl font-bold text-[#722F37]">
                    {{ product.price }} <span class="text-base font-medium">ج.م</span>
                  </p>
                }
              </div>

              <!-- Description -->
              <p *ngIf="product.description" class="text-gray-500 text-sm mb-5 leading-relaxed">
                {{ product.description }}
              </p>

              <!-- Divider -->
              <div class="border-t border-gray-100 mb-5"></div>

              <!-- Sizes -->
              <div class="mb-4">
                <h3 class="text-sm font-semibold text-gray-700 mb-2">المقاس:</h3>
                <div class="flex flex-wrap gap-2">
                  <button
                    *ngFor="let size of sizesArray"
                    (click)="selectSize(size)"
                    class="min-w-[40px] h-10 px-3 rounded-lg border text-sm transition-all duration-200 cursor-pointer font-medium"
                    [ngClass]="{
                      'bg-[#722F37] text-white border-[#722F37] shadow-sm': selectedSize === size,
                      'bg-white text-gray-700 border-gray-200 hover:border-[#722F37] hover:text-[#722F37]':
                        selectedSize !== size,
                    }"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>

              <!-- Colors -->
              <div class="mb-5">
                <h3 class="text-sm font-semibold text-gray-700 mb-2">اللون:</h3>
                <div class="flex flex-wrap gap-2">
                  <button
                    *ngFor="let color of colorsArray"
                    (click)="selectColor(color)"
                    class="h-10 px-4 rounded-lg border text-sm transition-all duration-200 cursor-pointer font-medium"
                    [ngClass]="{
                      'bg-[#722F37] text-white border-[#722F37] shadow-sm': selectedColor === color,
                      'bg-white text-gray-700 border-gray-200 hover:border-[#722F37] hover:text-[#722F37]':
                        selectedColor !== color,
                    }"
                  >
                    {{ color }}
                  </button>
                </div>
              </div>

              <!-- Validation Message -->
              <div
                *ngIf="showValidation && (!selectedSize || !selectedColor)"
                class="bg-red-50 border border-red-200 text-red-500 text-xs px-3 py-2 rounded-lg mb-3 text-center"
              >
                ⚠️ يرجى اختيار المقاس واللون قبل الحجز
              </div>

              <!-- Selected Summary -->
              <div
                *ngIf="selectedSize || selectedColor"
                class="bg-[#FDF8F6] border border-[#EDE4DD] px-3 py-2 rounded-lg mb-4 text-xs text-[#722F37]"
              >
                <span *ngIf="selectedSize"
                  >المقاس: <strong>{{ selectedSize }}</strong></span
                >
                <span *ngIf="selectedSize && selectedColor"> · </span>
                <span *ngIf="selectedColor"
                  >اللون: <strong>{{ selectedColor }}</strong></span
                >
              </div>

              <!-- Book Button -->
              <button
                *ngIf="product.isAvailable"
                (click)="goToReserve()"
                class="w-full text-center font-semibold py-3.5 rounded-xl transition-all duration-200 text-base"
                [ngClass]="{
                  'bg-[#722F37] hover:bg-[#5a252c] text-white cursor-pointer shadow-lg hover:shadow-xl':
                    canReserve,
                  'bg-gray-200 text-gray-400 cursor-not-allowed': !canReserve,
                }"
              >
                احجز الآن
              </button>

              <div
                *ngIf="!product.isAvailable"
                class="bg-gray-100 text-gray-400 text-center font-semibold py-3.5 rounded-xl text-base"
              >
                غير متاح للحجز حالياً
              </div>
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
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private destroy$ = new Subject<void>();

  product: Product | null = null;
  loading = true;
  error = '';
  selectedImageIndex = 0;

  // Selection state
  selectedSize: string = '';
  selectedColor: string = '';
  showValidation = false;

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

  get canReserve(): boolean {
    return !!this.selectedSize && !!this.selectedColor;
  }

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];

    if (!id || isNaN(id)) {
      this.error = 'معرف المنتج غير صحيح';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.productService
      .getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product: Product): void => {
          this.ngZone.run(() => {
            this.product = product;
            this.loading = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          });
        },
        error: (error: any): void => {
          this.ngZone.run(() => {
            this.error = error?.message || 'فشل تحميل تفاصيل المنتج';
            this.loading = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          });
        },
      });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    this.showValidation = false;
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.showValidation = false;
  }

  goToReserve(): void {
    if (!this.canReserve) {
      this.showValidation = true;
      return;
    }
    this.router.navigate(['/reserve', this.product!.id], {
      queryParams: {
        size: this.selectedSize,
        color: this.selectedColor,
      },
    });
  }

  get currentImage(): string {
    return (
      this.product?.images?.[this.selectedImageIndex]?.imageUrl ||
      'https://via.placeholder.com/600x800?text=No+Image'
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
