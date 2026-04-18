  import { Injectable } from '@angular/core';

  export interface ErrorMessageConfig {
    [key: number]: string;
  }

  @Injectable({
    providedIn: 'root'
  })
  export class ErrorMessagesService {
    private readonly errorMessages: ErrorMessageConfig = {
      0: 'لا يمكن الاتصال بالخادم. تأكد من اتصالك بالإنترنت',
      400: 'حدث خطأ في البيانات المرسلة',
      401: 'يرجى تسجيل الدخول',
      403: 'ليس لديك صلاحية للوصول',
      404: 'البيانات المطلوبة غير موجودة',
      409: 'تعارض في البيانات. تحقق من المدخلات',
      422: 'لا يمكن معالجة البيانات المرسلة',
      429: 'عدد طلبات كثير. يرجى المحاولة لاحقاً',
      500: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً',
      502: 'خادم البوابة غير متاح. يرجى المحاولة لاحقاً',
      503: 'الخادم غير متاح حالياً. يرجى المحاولة لاحقاً',
      504: 'انتهت مهلة الخادم. يرجى المحاولة لاحقاً'
    };

    getErrorMessage(statusCode: number | string): string {
      const code = typeof statusCode === 'string' ? parseInt(statusCode, 10) : statusCode;
      return this.errorMessages[code] || 'حدث خطأ غير متوقع';
    }

    getTimeoutMessage(): string {
      return 'انتهت مهلة الاتصال. يرجى التحقق من اتصالك بالإنترنت';
    }

    getNetworkErrorMessage(): string {
      return 'خطأ في الشبكة. تأكد من اتصالك بالإنترنت';
    }

    getUnknownErrorMessage(): string {
      return 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً';
    }
  }
