import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { ErrorMessagesService } from '../services/error-messages.service';

/**
 * Global HTTP Error Interceptor (Functional Style for Angular 21)
 *
 * Catches HTTP errors and:
 * 1. Logs full details to console for debugging
 * 2. Only shows toast for actual HTTP errors (status >= 400 or status 0)
 * 3. Prevents false positive error notifications
 * 4. Returns error for component-level handling if needed
 *
 * Error Status Codes:
 * - 0: Network/connection error (no response received)
 * - 400-499: Client errors (bad request, unauthorized, not found, etc.)
 * - 500-599: Server errors (internal server error, service unavailable, etc.)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const errorMessagesService = inject(ErrorMessagesService);

  // Log outgoing request for debugging
  console.log('📤 HTTP Request:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const statusCode = error.status || 0;

      // Log full error details to console for debugging
      console.error('🔴 HTTP Error Details:', {
        status: statusCode,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        timestamp: new Date().toISOString(),
      });

      let userFriendlyMessage: string;

      if (error.error instanceof ErrorEvent) {
        // Client-side error (network error, request failed before reaching server)
        console.error('🌐 Client-side error:', error.error.message);
        userFriendlyMessage = errorMessagesService.getNetworkErrorMessage();
      } else {
        // Server-side HTTP error response
        userFriendlyMessage = errorMessagesService.getErrorMessage(statusCode);
      }

      // Only show toast for actual HTTP errors (status >= 400 or status 0)
      // This prevents false positives from non-error responses
      const isActualError = statusCode === 0 || statusCode >= 400;

      if (isActualError) {
        console.error(`❌ Real HTTP Error (${statusCode}):`, error.url);
        console.error('💬 Showing toast:', userFriendlyMessage);

        // Show toast notification with user-friendly Arabic message
        toastService.error(userFriendlyMessage);
      } else {
        console.warn(`⚠️ Non-error response (${statusCode}) caught, not showing toast:`, error.url);
      }

      // Return error for component-level handling if needed
      return throwError(() => ({
        status: statusCode,
        message: userFriendlyMessage,
        error: error.error,
        userFriendlyMessage: userFriendlyMessage,
        isActualError: isActualError,
      }));
    }),
  );
};
