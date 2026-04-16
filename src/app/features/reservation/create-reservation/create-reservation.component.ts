import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
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
    <main class="flex-1 bg-[#FDF8F6]">
      <div class="container mx-auto px-4 py-6 md:py-10 max-w-2xl">
        <app-loading-spinner *ngIf="loading" />

        <!-- ============ SUCCESS STATE ============ -->
        <div *ngIf="!loading && success && reservation" class="space-y-6">
          <!-- Success Card -->
          <div class="bg-white rounded-2xl shadow-sm p-6 md:p-8 text-center">
            <!-- Check Icon -->
            <div
              class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5"
            >
              <svg
                class="w-10 h-10 text-green-500"
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

            <h1 class="text-xl md:text-2xl font-bold text-[#722F37] mb-2">تم الحجز بنجاح! 🎉</h1>
            <p class="text-gray-500 text-sm mb-6">احتفظي بكود الحجز للمتابعة والتأكيد</p>

            <!-- Code Box + Copy Button -->
            <div
              class="bg-[#FDF8F6] border-2 border-dashed border-[#722F37]/30 rounded-xl p-5 mb-6"
            >
              <p class="text-gray-500 text-xs mb-1">كود الحجز</p>
              <p class="text-3xl md:text-4xl font-bold text-[#722F37] tracking-wider mb-3">
                {{ reservation.code }}
              </p>
              <button
                (click)="copyCode()"
                class="inline-flex items-center gap-2 bg-white border border-[#722F37]/20 text-[#722F37] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#722F37] hover:text-white transition-all duration-200 cursor-pointer"
              >
                <svg
                  *ngIf="!codeCopied"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <svg
                  *ngIf="codeCopied"
                  class="w-4 h-4 text-green-600"
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
                <span>{{ codeCopied ? 'تم النسخ ✅' : 'نسخ الكود' }}</span>
              </button>
            </div>

            <!-- Order Summary -->
            <div class="bg-[#FDF8F6] rounded-xl p-4 mb-6 text-right" style="direction: rtl">
              <div class="flex items-center gap-3 mb-3">
                <img
                  *ngIf="reservation.productImageUrl"
                  [src]="reservation.productImageUrl"
                  [alt]="reservation.productName"
                  class="w-14 h-14 object-cover rounded-lg"
                />
                <div
                  *ngIf="!reservation.productImageUrl"
                  class="w-14 h-14 bg-[#F5ECE6] rounded-lg flex items-center justify-center text-2xl"
                >
                  👗
                </div>
                <div>
                  <p class="font-semibold text-[#722F37] text-sm">{{ reservation.productName }}</p>
                  <p class="text-gray-500 text-xs">
                    {{ reservation.size }} · {{ reservation.color }}
                  </p>
                </div>
                <p class="mr-auto font-bold text-[#722F37] text-sm">
                  {{ reservation.productPrice }} ج.م
                </p>
              </div>
            </div>

            <!-- WhatsApp CTA -->
            <a
              [href]="getWhatsAppUrl()"
              target="_blank"
              class="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl mb-4 text-base"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                />
              </svg>
              تواصلي عبر الواتساب لتأكيد الحجز
            </a>

            <p class="text-gray-400 text-xs mb-6">سيتم إرسال رسالة جاهزة بتفاصيل حجزك</p>

            <!-- Secondary Actions -->
            <div class="flex flex-col sm:flex-row gap-3">
              <a
                routerLink="/track"
                class="flex-1 bg-[#722F37] hover:bg-[#5a252c] text-white text-center font-medium py-3 rounded-xl transition text-sm"
                >تتبع الحجز</a
              >
              <a
                routerLink="/products"
                class="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-center font-medium py-3 rounded-xl transition text-sm"
                >تصفح المنتجات</a
              >
            </div>
          </div>
        </div>

        <!-- ============ FORM STATE ============ -->
        <div *ngIf="!loading && !success && product" class="space-y-5">
          <!-- Back Link -->
          <a
            [routerLink]="['/products', product.id]"
            class="inline-flex items-center gap-2 text-[#722F37] hover:text-[#5a252c] text-sm font-medium transition"
          >
            <svg class="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            العودة للمنتج
          </a>

          <h1 class="text-xl md:text-2xl font-bold text-[#722F37]">إتمام الحجز</h1>

          <!-- Product Summary -->
          <div class="bg-white rounded-2xl shadow-sm p-4">
            <div class="flex items-center gap-4" style="direction: rtl">
              <img
                [src]="
                  product.images && product.images[0]
                    ? product.images[0].imageUrl
                    : 'https://via.placeholder.com/80'
                "
                [alt]="product.name"
                class="w-16 h-16 object-cover rounded-xl"
              />
              <div class="flex-1">
                <h2 class="font-semibold text-[#722F37] text-sm">{{ product.name }}</h2>
                <p class="text-[#722F37] font-bold text-lg">{{ product.price }} ج.م</p>
              </div>
            </div>
            <!-- Selected Size & Color -->
            <div
              *ngIf="form.size || form.color"
              class="mt-3 pt-3 border-t border-gray-100 flex gap-3 justify-end text-xs"
            >
              <span
                *ngIf="form.size"
                class="bg-[#FDF8F6] text-[#722F37] px-3 py-1 rounded-full font-medium"
                >المقاس: {{ form.size }}</span
              >
              <span
                *ngIf="form.color"
                class="bg-[#FDF8F6] text-[#722F37] px-3 py-1 rounded-full font-medium"
                >اللون: {{ form.color }}</span
              >
            </div>
          </div>

          <!-- Reservation Form -->
          <form (ngSubmit)="submit()" class="bg-white rounded-2xl shadow-sm p-5 md:p-6 space-y-5">
            <!-- Error -->
            <div
              *ngIf="error"
              class="bg-red-50 border border-red-200 text-red-500 text-sm p-3 rounded-xl text-center"
            >
              ⚠️ {{ error }}
            </div>

            <!-- Name -->
            <div>
              <label class="block text-gray-700 font-medium text-sm mb-1.5"
                >الاسم <span class="text-red-400">*</span></label
              >
              <input
                type="text"
                [(ngModel)]="form.customerName"
                name="customerName"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37] transition text-sm"
                placeholder="أدخلي اسمك"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-gray-700 font-medium text-sm mb-1.5"
                >رقم الهاتف <span class="text-red-400">*</span></label
              >
              <input
                type="tel"
                [(ngModel)]="form.customerPhone"
                name="customerPhone"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37] transition text-sm"
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
            </div>

            <!-- Size (if not pre-selected) -->
            <div *ngIf="!hasPreselectedSize">
              <label class="block text-gray-700 font-medium text-sm mb-1.5"
                >المقاس <span class="text-red-400">*</span></label
              >
              <div class="flex flex-wrap gap-2">
                <button
                  *ngFor="let size of sizes"
                  type="button"
                  (click)="form.size = size"
                  class="min-w-[40px] h-10 px-3 rounded-lg border text-sm transition-all duration-200 cursor-pointer font-medium"
                  [ngClass]="{
                    'bg-[#722F37] text-white border-[#722F37] shadow-sm': form.size === size,
                    'bg-white text-gray-700 border-gray-200 hover:border-[#722F37] hover:text-[#722F37]':
                      form.size !== size,
                  }"
                >
                  {{ size }}
                </button>
              </div>
            </div>

            <!-- Color (if not pre-selected) -->
            <div *ngIf="!hasPreselectedColor">
              <label class="block text-gray-700 font-medium text-sm mb-1.5"
                >اللون <span class="text-red-400">*</span></label
              >
              <div class="flex flex-wrap gap-2">
                <button
                  *ngFor="let color of colors"
                  type="button"
                  (click)="form.color = color"
                  class="h-10 px-4 rounded-lg border text-sm transition-all duration-200 cursor-pointer font-medium"
                  [ngClass]="{
                    'bg-[#722F37] text-white border-[#722F37] shadow-sm': form.color === color,
                    'bg-white text-gray-700 border-gray-200 hover:border-[#722F37] hover:text-[#722F37]':
                      form.color !== color,
                  }"
                >
                  {{ color }}
                </button>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-gray-700 font-medium text-sm mb-1.5"
                >ملاحظات <span class="text-gray-400 font-normal">(اختياري)</span></label
              >
              <textarea
                [(ngModel)]="form.notes"
                name="notes"
                rows="3"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37] transition text-sm resize-none"
                placeholder="أي ملاحظات إضافية..."
              ></textarea>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="submitting"
              class="w-full font-semibold py-3.5 rounded-xl transition-all duration-200 text-base"
              [ngClass]="{
                'bg-[#722F37] hover:bg-[#5a252c] text-white shadow-lg hover:shadow-xl cursor-pointer':
                  !submitting,
                'bg-gray-200 text-gray-400 cursor-not-allowed': submitting,
              }"
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

  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  product: Product | null = null;
  loading = true;
  submitting = false;
  success = false;
  error = '';
  reservation: Reservation | null = null;

  sizes: string[] = [];
  colors: string[] = [];

  hasPreselectedSize = false;
  hasPreselectedColor = false;

  codeCopied = false;

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

    // Read pre-selected size & color from query params
    const querySize = this.route.snapshot.queryParams['size'];
    const queryColor = this.route.snapshot.queryParams['color'];

    if (querySize) {
      this.form.size = querySize;
      this.hasPreselectedSize = true;
    }
    if (queryColor) {
      this.form.color = queryColor;
      this.hasPreselectedColor = true;
    }

    this.productService
      .getById(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Product | null): void => {
          this.ngZone.run(() => {
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
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          });
        },
        error: (error: any): void => {
          this.ngZone.run(() => {
            console.error('Failed to load product:', error);
            this.error = error?.message || 'فشل تحميل تفاصيل المنتج';
            this.loading = false;
            this.cdr.detectChanges();
            setTimeout(() => this.router.navigate(['/products']), 2000);
          });
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
          this.ngZone.run(() => {
            this.reservation = data;
            this.success = true;
            this.submitting = false;
            this.cdr.detectChanges();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        },
        error: (error: any): void => {
          this.ngZone.run(() => {
            this.error = error.message || 'حدث خطأ أثناء إنشاء الحجز';
            this.submitting = false;
            this.cdr.detectChanges();
          });
        },
      });
  }

  copyCode(): void {
    if (!this.reservation?.code) return;
    navigator.clipboard.writeText(this.reservation.code).then(() => {
      this.codeCopied = true;
      setTimeout(() => {
        this.codeCopied = false;
        this.cdr.detectChanges();
      }, 2000);
      this.cdr.detectChanges();
    });
  }

  getWhatsAppUrl(): string {
    if (!this.reservation) return '';

    const productName = this.reservation.productName || '';
    const size = this.reservation.size || '';
    const color = this.reservation.color || '';
    const code = this.reservation.code || '';
    const customerName = this.reservation.customerName || '';
    const customerPhone = this.reservation.customerPhone || '';
    const price = this.reservation.productPrice || '';

    const message = `مرحباً 👋
أنا *${customerName}*
حجزت من الموقع وعايزة أأكد الحجز ✅

📦 المنتج: *${productName}*
📏 المقاس: *${size}*
🎨 اللون: *${color}*
💰 السعر: *${price} ج.م*

🔖 كود الحجز: *${code}*
📱 رقمي: *${customerPhone}*`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/2001141841861?text=${encoded}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
