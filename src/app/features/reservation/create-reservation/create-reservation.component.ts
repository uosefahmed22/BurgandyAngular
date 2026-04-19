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
  templateUrl: './create-reservation.component.html',
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

  getProductImage(): string | null {
    // Try reservation image first, then fall back to loaded product image
    if (this.reservation?.productImageUrl) {
      return this.reservation.productImageUrl;
    }
    if (this.product?.images && this.product.images.length > 0) {
      return this.product.images[0].imageUrl;
    }
    return null;
  }

  getWhatsAppUrl(): string {
    if (!this.reservation) return '';

    const productName = this.reservation.productName || '';
    const size = this.reservation.size || '';
    const color = this.reservation.color || '';
    const code = this.reservation.code || '';
    const customerName = this.reservation.customerName || '';
    const customerPhone = this.reservation.customerPhone || '';
    const price = this.reservation.bookedPrice || this.reservation.productPrice || '';

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
