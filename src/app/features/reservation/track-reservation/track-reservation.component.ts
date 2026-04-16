import { Component, inject, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderComponent } from '@shared/components/header.component';
import { FooterComponent } from '@shared/components/footer.component';
import { WhatsappFabComponent } from '@shared/components/whatsapp-fab.component';
import { ReservationService } from '@core/services';
import { Reservation } from '@core/models';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner.component';

@Component({
  selector: 'app-track-reservation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    WhatsappFabComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <app-header />
    <main class="flex-1 bg-[#FDF8F6]">
      <div class="container mx-auto px-4 py-6 md:py-10 max-w-2xl">
        <h1 class="text-xl md:text-2xl font-bold text-[#722F37] mb-6 text-center">تتبع الحجز</h1>

        <!-- Search Form -->
        <div class="bg-white rounded-2xl shadow-sm p-5 md:p-6 mb-6">
          <form (ngSubmit)="search()" class="space-y-4">
            <div>
              <label class="block text-gray-700 font-medium text-sm mb-1.5">كود الحجز</label>
              <input
                type="text"
                [(ngModel)]="code"
                name="code"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37] transition text-sm"
                placeholder="أدخل كود الحجز"
                dir="ltr"
              />
            </div>
            <div>
              <label class="block text-gray-700 font-medium text-sm mb-1.5">رقم الهاتف</label>
              <input
                type="tel"
                [(ngModel)]="phone"
                name="phone"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37] transition text-sm"
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              [disabled]="loading"
              class="w-full font-semibold py-3 rounded-xl transition-all duration-200 text-sm"
              [ngClass]="{
                'bg-[#722F37] hover:bg-[#5a252c] text-white cursor-pointer': !loading,
                'bg-gray-200 text-gray-400 cursor-not-allowed': loading,
              }"
            >
              <span *ngIf="!loading">بحث</span>
              <span *ngIf="loading">جاري البحث...</span>
            </button>
          </form>
        </div>

        <!-- Error -->
        <div
          *ngIf="error"
          class="bg-red-50 border border-red-200 text-red-500 text-sm p-4 rounded-xl mb-6 text-center"
        >
          ⚠️ {{ error }}
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="text-center py-8">
          <app-loading-spinner />
        </div>

        <!-- Result -->
        <div
          *ngIf="!loading && searched && reservation"
          class="bg-white rounded-2xl shadow-sm p-5 md:p-6"
        >
          <!-- Header: Code + Status -->
          <div class="flex justify-between items-start mb-5" style="direction: rtl">
            <div>
              <p class="text-gray-500 text-xs">كود الحجز</p>
              <p class="text-xl font-bold text-[#722F37]">{{ reservation.code }}</p>
            </div>
            <span
              [class]="getStatusColor(reservation.status)"
              class="px-3 py-1.5 rounded-full text-xs font-semibold"
              >{{ getStatusText(reservation.status) }}</span
            >
          </div>

          <div class="border-t border-gray-100 pt-5">
            <!-- Product Info -->
            <div class="flex items-center gap-3 mb-5" style="direction: rtl">
              <img
                *ngIf="reservation.productImageUrl"
                [src]="reservation.productImageUrl"
                [alt]="reservation.productName"
                class="w-16 h-16 object-cover rounded-xl"
              />
              <div
                *ngIf="!reservation.productImageUrl"
                class="w-16 h-16 bg-[#F5ECE6] rounded-xl flex items-center justify-center text-2xl"
              >
                👗
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-[#722F37] text-sm">{{ reservation.productName }}</h3>
                <p class="text-gray-500 text-xs">
                  {{ reservation.size }} · {{ reservation.color }}
                </p>
              </div>
              <p class="font-bold text-[#722F37] text-sm">{{ reservation.productPrice }} ج.م</p>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 gap-4" style="direction: rtl">
              <div>
                <p class="text-gray-400 text-xs">اسم العميل</p>
                <p class="font-medium text-gray-800 text-sm">{{ reservation.customerName }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs">رقم الهاتف</p>
                <p class="font-medium text-gray-800 text-sm" dir="ltr">
                  {{ reservation.customerPhone }}
                </p>
              </div>
              <div>
                <p class="text-gray-400 text-xs">تاريخ الحجز</p>
                <p class="font-medium text-gray-800 text-sm">
                  {{ reservation.createdAt | date: 'short' }}
                </p>
              </div>
              <div *ngIf="reservation.expiresAt">
                <p class="text-gray-400 text-xs">ينتهي في</p>
                <p class="font-medium text-gray-800 text-sm">
                  {{ reservation.expiresAt | date: 'short' }}
                </p>
              </div>
            </div>

            <!-- Notes -->
            <div *ngIf="reservation.notes" class="mt-5 p-3 bg-[#FDF8F6] rounded-xl">
              <p class="text-gray-400 text-xs mb-1">الملاحظات</p>
              <p class="text-gray-700 text-sm">{{ reservation.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Not Found -->
        <div *ngIf="!loading && searched && !reservation && !error" class="text-center py-12">
          <span class="text-5xl mb-4 block">🔍</span>
          <p class="text-gray-500">لم يتم العثور على الحجز</p>
          <p class="text-gray-400 text-sm mt-2">تأكدي من كود الحجز ورقم الهاتف</p>
        </div>
      </div>
    </main>
    <app-footer />
    <app-whatsapp-fab />
  `,
})
export class TrackReservationComponent implements OnDestroy {
  private reservationService = inject(ReservationService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private destroy$ = new Subject<void>();

  code = '';
  phone = '';
  loading = false;
  searched = false;
  error = '';
  reservation: Reservation | null = null;

  search(): void {
    if (!this.code || !this.phone) {
      this.error = 'يرجى إدخال كود الحجز ورقم الهاتف';
      return;
    }
    this.loading = true;
    this.error = '';
    this.searched = true;
    this.reservation = null;

    this.reservationService
      .track({ code: this.code.trim(), phone: this.phone.trim() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Reservation | null): void => {
          this.ngZone.run(() => {
            this.reservation = data;
            this.loading = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          });
        },
        error: (error: any): void => {
          this.ngZone.run(() => {
            this.error = error.message || 'لم يتم العثور على الحجز';
            this.reservation = null;
            this.loading = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          });
        },
      });
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Pending: 'قيد الانتظار',
      Confirmed: 'تم التأكيد',
      Delivered: 'تم التسليم',
      Cancelled: 'ملغي',
    };
    return map[status] || status;
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      Confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
      Delivered: 'bg-green-50 text-green-700 border border-green-200',
      Cancelled: 'bg-red-50 text-red-700 border border-red-200',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
