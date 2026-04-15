import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { ErrorMessagesService } from '../services/error-messages.service';

/**
 * Global HTTP Error Interceptor (Functional Style for Angular 21)
 *
 * Catches all HTTP errors and:
 * 1. Logs details to console for debugging
 * 2. Shows user-friendly Arabic toast notifications
 * 3. Returns error for component-level handling if needed
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const errorMessagesService = inject(ErrorMessagesService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log full error details to console for debugging
      console.error('🔴 HTTP Error Details:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        error: error.error,
        timestamp: new Date().toISOString(),
      });

      let userFriendlyMessage: string;
      let statusCode: number;

      if (error.error instanceof ErrorEvent) {
        // Client-side error (network error, etc.)
        console.error('🌐 Client-side error:', error.error.message);
        userFriendlyMessage = errorMessagesService.getNetworkErrorMessage();
        statusCode = 0;
      } else {
        // Server-side HTTP error
        statusCode = error.status || 0;
        userFriendlyMessage = errorMessagesService.getErrorMessage(statusCode);
      }

      // Show toast notification with user-friendly Arabic message
      toastService.error(userFriendlyMessage);

      // Log which message was shown to user
      console.error('💬 User-friendly message shown in toast:', userFriendlyMessage);

      // Return error for component-level handling if needed
      return throwError(() => ({
        status: statusCode,
        message: userFriendlyMessage,
        error: error.error,
        userFriendlyMessage: userFriendlyMessage,
      }));
    }),
  );
};
