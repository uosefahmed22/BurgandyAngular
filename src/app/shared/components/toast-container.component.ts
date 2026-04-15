import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../core/services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div [class]="'toast toast-' + toast.type">
          <span class="toast-icon">
            @switch (toast.type) {
              @case ('error') {
                <span>❌</span>
              }
              @case ('success') {
                <span>✅</span>
              }
              @case ('warning') {
                <span>⚠️</span>
              }
              @case ('info') {
                <span>ℹ️</span>
              }
            }
          </span>
          <div class="toast-content">
            <span class="toast-message">{{ toast.message }}</span>
          </div>
          <button
            class="toast-close"
            (click)="removeToast(toast.id)"
            aria-label="Close notification"
            type="button"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        direction: rtl;
        pointer-events: none;
      }

      .toast {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 16px 20px;
        border-radius: 12px;
        background: white;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        animation: slideDown 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        pointer-events: auto;
        min-width: 320px;
        max-width: 450px;
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
        backdrop-filter: blur(10px);
      }

      .toast-error {
        border-right: 4px solid #ef4444;
        background: linear-gradient(135deg, #fef2f2 0%, white 100%);
      }

      .toast-success {
        border-right: 4px solid #22c55e;
        background: linear-gradient(135deg, #f0fdf4 0%, white 100%);
      }

      .toast-warning {
        border-right: 4px solid #f59e0b;
        background: linear-gradient(135deg, #fffbeb 0%, white 100%);
      }

      .toast-info {
        border-right: 4px solid #3b82f6;
        background: linear-gradient(135deg, #eff6ff 0%, white 100%);
      }

      .toast-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        line-height: 1.5;
      }

      .toast-icon {
        font-size: 24px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        margin-top: 2px;
      }

      .toast-message {
        font-size: 14px;
        font-weight: 500;
        color: #1f2937;
        line-height: 1.5;
        text-align: right;
        word-break: break-word;
        overflow-wrap: break-word;
      }

      .toast-close {
        background: none;
        border: none;
        font-size: 18px;
        color: #d1d5db;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        flex-shrink: 0;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        line-height: 1;
      }

      .toast-close:hover {
        background: #f3f4f6;
        color: #6b7280;
        transform: scale(1.1);
      }

      .toast-close:active {
        transform: scale(0.95);
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-20px);
        }
      }

      /* Mobile responsive */
      @media (max-width: 640px) {
        .toast {
          min-width: 280px;
          max-width: 90vw;
          padding: 14px 16px;
        }

        .toast-message {
          font-size: 13px;
        }

        .toast-icon {
          font-size: 20px;
        }

        .toast-close {
          width: 28px;
          height: 28px;
          font-size: 16px;
        }
      }

      /* Tablet optimization */
      @media (max-width: 1024px) {
        .toast {
          max-width: calc(100vw - 40px);
        }
      }
    `,
  ],
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();

  toasts: Toast[] = [];

  ngOnInit() {
    this.toastService
      .toasts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((toasts) => {
        this.toasts = toasts;
      });
  }

  removeToast(id: string) {
    this.toastService.remove(id);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
