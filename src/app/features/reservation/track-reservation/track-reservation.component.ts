import { Component, inject, OnDestroy } from '@angular/core';
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
    <main class="flex-1">
      <div class="container mx-auto px-4 py-8 max-w-2xl">
        <h1 class="text-3xl font-bold text-burgundy-900 mb-8 text-center">تتبع الحجز</h1>
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form (ngSubmit)="search()" class="space-y-4">
            <div>
              <label class="block text-burgundy-900 font-semibold mb-2">كود الحجز</label>
              <input
                type="text"
                [(ngModel)]="code"
                name="code"
                class="w-full border border-burgundy-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                placeholder="أدخل كود الحجز"
              />
            </div>
            <div>
              <label class="block text-burgundy-900 font-semibold mb-2">رقم الهاتف</label>
              <input
                type="tel"
                [(ngModel)]="phone"
                name="phone"
                class="w-full border border-burgundy-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-burgundy-500"
                placeholder="01xxxxxxxxx"
              />
            </div>
            <button
              type="submit"
              [disabled]="loading"
              class="w-full bg-burgundy-900 hover:bg-burgundy-800 disabled:bg-burgundy-400 text-white font-semibold py-3 rounded-lg transition"
            >
              <span *ngIf="!loading">بحث</span>
              <span *ngIf="loading">جاري البحث...</span>
            </button>
          </form>
        </div>
        <div *ngIf="error" class="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-center">
          {{ error }}
        </div>
        <app-loading-spinner *ngIf="loading" />
        <div *ngIf="!loading && searched && reservation" class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <p class="text-gray-600 text-sm">كود الحجز</p>
              <p class="text-2xl font-bold text-burgundy-900">{{ reservation.code }}</p>
            </div>
            <span
              [class]="getStatusColor(reservation.status)"
              class="px-4 py-2 rounded-full font-semibold"
              >{{ getStatusText(reservation.status) }}</span
            >
          </div>
          <div class="border-t border-burgundy-100 pt-6">
            <div class="flex gap-4 mb-6">
              <img
                [src]="reservation.productImageUrl || 'https://via.placeholder.com/100'"
                [alt]="reservation.productName"
                class="w-20 h-20 object-cover rounded-lg"
              />
              <div>
                <h3 class="font-semibold text-burgundy-900">{{ reservation.productName }}</h3>
                <p class="text-burgundy-700 font-bold">{{ reservation.productPrice }} ج.م</p>
                <p class="text-gray-600 text-sm">
                  {{ reservation.size }} - {{ reservation.color }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p class="text-gray-600 text-sm">اسم العميل</p>
                <p class="font-semibold text-burgundy-900">{{ reservation.customerName }}</p>
              </div>
              <div>
                <p class="text-gray-600 text-sm">رقم الهاتف</p>
                <p class="font-semibold text-burgundy-900">{{ reservation.customerPhone }}</p>
              </div>
              <div>
                <p class="text-gray-600 text-sm">تاريخ الحجز</p>
                <p class="font-semibold text-burgundy-900">
                  {{ reservation.createdAt | date: 'short' }}
                </p>
              </div>
              <div *ngIf="reservation.expiresAt">
                <p class="text-gray-600 text-sm">ينتهي في</p>
                <p class="font-semibold text-burgundy-900">
                  {{ reservation.expiresAt | date: 'short' }}
                </p>
              </div>
            </div>
            <div *ngIf="reservation.notes" class="mt-6 p-4 bg-burgundy-50 rounded-lg">
              <p class="text-gray-600 text-sm">الملاحظات</p>
              <p class="text-burgundy-900">{{ reservation.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <app-footer />
    <app-whatsapp-fab />
  `,
})
export class TrackReservationComponent implements OnDestroy {
  private reservationService = inject(ReservationService);
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
    this.reservationService.track({ code: this.code, phone: this.phone }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: Reservation | null): void => {
        this.reservation = data;
        this.loading = false;
      },
      error: (error: any): void => {
        this.error = error.message || 'لم يتم العثور على الحجز';
        this.reservation = null;
        this.loading = false;
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
      Pending: 'bg-yellow-100 text-yellow-800',
      Confirmed: 'bg-blue-100 text-blue-800',
      Delivered: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
