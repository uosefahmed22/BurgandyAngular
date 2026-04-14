import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderComponent } from '@shared/components/header.component';
import { FooterComponent } from '@shared/components/footer.component';
import { WhatsappFabComponent } from '@shared/components/whatsapp-fab.component';
import { ProductService, ReservationService } from '@core/services';
import { Product, CreateReservationDto, Reservation } from '@core/models';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner.component';

@Component({
  selector: 'app-create-reservation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HeaderComponent,
    FooterComponent,
    WhatsappFabComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <app-header />
    <main class="flex-1">
      <div class="container mx-auto px-4 py-8 max-w-2xl">
        <app-loading-spinner *ngIf="loading" />

        <div
          *ngIf="!loading && success && reservation"
          class="bg-white rounded-xl shadow-lg p-8 text-center"
        >
          <div
            class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg
              class="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-burgundy-900 mb-4">تم الحجز بنجاح!</h1>
          <div class="bg-burgundy-50 rounded-xl p-6 mb-6">
            <p class="text-gray-600 mb-2">كود الحجز الخاص بك:</p>
            <p class="text-3xl font-bold text-burgundy-900">{{ reservation.code }}</p>
          </div>
          <p class="text-gray-600 mb-6">احتفظ بهذا الكود لتتبع حجزك. سيتم التواصل معك قريباً.</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              routerLink="/track"
              class="bg-burgundy-900 hover:bg-burgundy-800 text-white px-6 py-3 rounded-lg transition"
              >تتبع الحجز</a
            >
            <a
              routerLink="/products"
              class="bg-burgundy-100 hover:bg-burgundy-200 text-burgundy-900 px-6 py-3 rounded-lg transition"
              >تصفح المنتجات</a
            >
          </div>
        </div>

        <div *ngIf="!loading && !success && product">
          <h1 class="text-3xl font-bold text-burgundy-900 mb-8">حجز المنتج</h1>
          <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div class="flex gap-4">
              <img
                [src]="
                  product.images && product.images[0]
                    ? product.images[0].imageUrl
                    : 'https://via.placeholder.com/100'
                "
                [alt]="product.name"
                class="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <h2 class="font-semibold text-burgundy-900">{{ product.name }}</h2>
                <p class="text-burgundy-700 font-bold">{{ product.price }} ج.م</p>
              </div>
            </div>
          </div>
          <form (ngSubmit)="submit()" class="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div *ngIf="error" class="bg-red-50 text-red-600 p-4 rounded-lg">{{ error }}</div>
            <div>
              <label class="block text-burgundy-900 font-semibold mb-2">الاسم *</label>
              <input
                type="text"
                [(ngModel)]="form.customerName"
                name="customerName"
                class="w-full border border-burgundy-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                placeholder="أدخل اسمك"
              />
            </div>
            <div>
              <label class="block text-burgundy-900 font-semibold mb-2">رقم الهاتف *</label>
              <input
                type="tel"
                [(ngModel)]="form.customerPhone"
                name="customerPhone"
                class="w-full border border-burgundy-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                placeholder="01xxxxxxxxx"
              />
            </div>
            <div>
              <label class="block text-burgundy-900 font-semibold mb-2">المقاس *</label>
              <div class="flex flex-wrap gap-2">
                <button
                  *ngFor="let size of sizes"
                  type="button"
                  (click)="form.size = size"
                  [class]="
                    form.size === size
                      ? 'bg-burgundy-900 text-white'
                      : 'bg-burgundy-50 text-burgundy-900 border border-burgundy-200'
                  "
                  class="px-4 py-2 rounded-lg transition"
                >
                  {{ size }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-burgundy-900 font-semibold mb-2">اللون *</label>
              <div class="flex flex-wrap gap-2">
                <button
                  *ngFor="let color of colors"
                  type="button"
                  (click)="form.color = color"
                  [class]="
                    form.color === color
                      ? 'bg-burgundy-900 text-white'
                      : 'bg-burgundy-50 text-burgundy-900 border border-burgundy-200'
                  "
                  class="px-4 py-2 rounded-lg transition"
                >
                  {{ color }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-burgundy-900 font-semibold mb-2">ملاحظات (اختياري)</label>
              <textarea
                [(ngModel)]="form.notes"
                name="notes"
                rows="3"
                class="w-full border border-burgundy-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                placeholder="أي ملاحظات إضافية..."
              ></textarea>
            </div>
            <button
              type="submit"
              [disabled]="submitting"
              class="w-full bg-burgundy-900 hover:bg-burgundy-800 disabled:bg-burgundy-400 text-white font-semibold py-4 rounded-xl transition text-lg"
            >
              <span *ngIf="!submitting">تأكيد الحجز</span>
              <span *ngIf="submitting">جاري الحجز...</span>
            </button>
          </form>
        </div>
      </div>
    </main>
    <app-footer />
    <app-whatsapp-fab />
  `,
})
export class CreateReservationComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private reservationService = inject(ReservationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  product: Product | null = null;
  loading = true;
  submitting = false;
  success = false;
  error = '';
  reservation: Reservation | null = null;

  sizes: string[] = [];
  colors: string[] = [];

  form: CreateReservationDto = {
    productId: 0,
    customerName: '',
    customerPhone: '',
    size: '',
    color: '',
    notes: '',
  };

  ngOnInit(): void {
    const productId = +this.route.snapshot.params['productId'];
    this.form.productId = productId;
    this.productService
      .getById(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Product | null): void => {
          this.product = data;
          if (data) {
            this.sizes = data.sizes
              .split(',')
              .map((s: string): string => s.trim())
              .filter((s: string): boolean => !!s);
            this.colors = data.colors
              .split(',')
              .map((c: string): string => c.trim())
              .filter((c: string): boolean => !!c);
          }
          this.loading = false;
        },
        error: (error: any): void => {
          console.error('Failed to load product:', error);
          this.error = error?.message || 'فشل تحميل تفاصيل المنتج';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/products']), 2000);
        },
      });
  }

  submit(): void {
    if (
      !this.form.customerName ||
      !this.form.customerPhone ||
      !this.form.size ||
      !this.form.color
    ) {
      this.error = 'يرجى ملء جميع الحقول المطلوبة';
      return;
    }
    this.submitting = true;
    this.error = '';
    this.reservationService
      .create(this.form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Reservation | null): void => {
          this.reservation = data;
          this.success = true;
          this.submitting = false;
        },
        error: (error: any): void => {
          this.error = error.message || 'حدث خطأ أثناء إنشاء الحجز';
          this.submitting = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
