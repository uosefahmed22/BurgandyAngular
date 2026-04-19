import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css'
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
