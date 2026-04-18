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
  providedIn: 'root',
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private toastId = 0;
  private readonly maxToasts = 3; // Maximum toasts visible at once
  private toastTimeouts = new Map<string, NodeJS.Timeout>(); // Track timeouts for clearing

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
    const currentToasts = this.toasts$.value;

    // Prevent duplicate toasts with same message and type
    const existingToast = currentToasts.find((t) => t.message === message && t.type === type);
    if (existingToast) {
      return;
    }

    // Remove oldest toast if at max capacity
    if (currentToasts.length >= this.maxToasts) {
      const oldestToastId = currentToasts[0].id;
      this.remove(oldestToastId);
    }

    const id = String(this.toastId++);
    const toast: Toast = { id, message, type, duration };

    const updatedToasts = [...this.toasts$.value, toast];
    this.toasts$.next(updatedToasts);

    // Auto-remove after duration
    if (duration > 0) {
      // Clear any existing timeout for this id
      if (this.toastTimeouts.has(id)) {
        clearTimeout(this.toastTimeouts.get(id)!);
      }

      const timeout = setTimeout(() => {
        this.remove(id);
      }, duration);

      this.toastTimeouts.set(id, timeout);
    }
  }

  remove(id: string): void {
    // Clear timeout if exists
    if (this.toastTimeouts.has(id)) {
      clearTimeout(this.toastTimeouts.get(id)!);
      this.toastTimeouts.delete(id);
    }

    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter((t) => t.id !== id));
  }

  clear(): void {
    // Clear all timeouts
    this.toastTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.toastTimeouts.clear();

    this.toasts$.next([]);
  }

  /**
   * Clear all toasts and reset service state
   * Useful when navigating away or for testing
   */
  clearAll(): void {
    this.clear();
    this.toastId = 0;
  }
}
