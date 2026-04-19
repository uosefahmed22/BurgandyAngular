import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { ErrorMessagesService } from '../services/error-messages.service';

/**
 * Global HTTP Error Interceptor
 *
 * - Shows user-friendly Arabic toast for HTTP errors
 * - Only logs details in development mode
 * - Returns error for component-level handling
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const errorMessagesService = inject(ErrorMessagesService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const statusCode = error.status || 0;

      if (isDevMode() && (statusCode === 0 || statusCode >= 500)) {
        console.error(`🔴 HTTP ${statusCode}:`, error.url, error.message);
      }

      let userFriendlyMessage: string;

      if (error.error instanceof ErrorEvent) {
        userFriendlyMessage = errorMessagesService.getNetworkErrorMessage();
      } else {
        userFriendlyMessage = errorMessagesService.getErrorMessage(statusCode);
      }

      // Show toast for server errors and network errors only
      // 400/401/404 are business responses — components handle them
      const showToast = statusCode === 0 || statusCode >= 500;

      if (showToast) {
        toastService.error(userFriendlyMessage);
      }

      // Return error for component-level handling if needed
      return throwError(() => ({
        status: statusCode,
        message: userFriendlyMessage,
        error: error.error,
        userFriendlyMessage: userFriendlyMessage,
        isActualError: showToast,
      }));
    }),
  );
};
