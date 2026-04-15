import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-state-icon">{{ icon }}</div>
      <h3 class="empty-state-title">{{ title }}</h3>
      <p class="empty-state-message">{{ message }}</p>
      @if (showRetry && onRetry) {
        <button (click)="handleRetry()" class="empty-state-button">
          🔄 أعد المحاولة
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      min-height: 300px;
    }

    .empty-state-icon {
      font-size: 64px;
      margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
    }

    .empty-state-title {
      color: #333;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .empty-state-message {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
      line-height: 1.6;
      max-width: 400px;
    }

    .empty-state-button {
      padding: 10px 24px;
      background-color: #8B4A6D;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .empty-state-button:hover {
      background-color: #6d3a55;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .empty-state-button:active {
      transform: translateY(0);
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    @media (max-width: 640px) {
      .empty-state {
        padding: 40px 16px;
        min-height: 250px;
      }

      .empty-state-icon {
        font-size: 48px;
      }

      .empty-state-title {
        font-size: 18px;
      }

      .empty-state-message {
        font-size: 13px;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() title = 'لا توجد بيانات';
  @Input() message = 'حاول تغيير معايير البحث';
  @Input() showRetry = false;
  @Input() onRetry: (() => void) | null = null;

  handleRetry() {
    if (this.onRetry) {
      this.onRetry();
    }
  }
}
