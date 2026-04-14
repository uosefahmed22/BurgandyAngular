import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `<div class="flex items-center justify-center p-8"><div class="w-12 h-12 border-4 border-burgundy-200 border-t-burgundy-900 rounded-full animate-spin"></div></div>`
})
export class LoadingSpinnerComponent {}
