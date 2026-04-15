import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private toastId = 0;

  toasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'error', duration);
  }

  success(message: string, duration = 5000): void {
    this.show(message, 'success', duration);
  }

  info(message: string, duration = 5000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 5000): void {
    this.show(message, 'warning', duration);
  }

  show(message: string, type: ToastType = 'info', duration = 5000): void {
    const id = String(this.toastId++);
    const toast: Toast = { id, message, type, duration };

    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: string): void {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toasts$.next([]);
  }
}
