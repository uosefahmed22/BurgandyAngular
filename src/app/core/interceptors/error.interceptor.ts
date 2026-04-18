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

      if (isDevMode()) {
        console.error(`🔴 HTTP ${statusCode}:`, error.url, error.message);
      }

      let userFriendlyMessage: string;

      if (error.error instanceof ErrorEvent) {
        userFriendlyMessage = errorMessagesService.getNetworkErrorMessage();
      } else {
        userFriendlyMessage = errorMessagesService.getErrorMessage(statusCode);
      }

      // Only show toast for actual HTTP errors (status >= 400 or status 0)
      // This prevents false positives from non-error responses
      const isActualError = statusCode === 0 || statusCode >= 400;

      if (isActualError) {
        toastService.error(userFriendlyMessage);
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
