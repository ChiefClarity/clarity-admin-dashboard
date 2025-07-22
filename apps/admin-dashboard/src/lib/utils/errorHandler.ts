import { AxiosError } from 'axios';
import * as Sentry from '@sentry/nextjs';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AppError {
  type: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
  timestamp: number;
  requestId?: string;
  stack?: string;
  severity: ErrorSeverity;
}

class ErrorHandler {
  private errorListeners: Array<(error: AppError) => void> = [];

  handleError(error: unknown, context?: string): AppError {
    const timestamp = Date.now();
    let appError: AppError;

    if (this.isAxiosError(error)) {
      appError = this.handleAxiosError(error, timestamp);
    } else if (error instanceof Error) {
      appError = this.handleStandardError(error, timestamp);
    } else {
      appError = this.handleUnknownError(error, timestamp);
    }

    // Add context
    if (context) {
      appError.details = { ...appError.details, context };
    }

    // Log to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        level: this.getSentryLevel(appError.severity),
        extra: appError.details,
      });
    }

    this.notifyListeners(appError);
    return appError;
  }

  private handleAxiosError(error: AxiosError, timestamp: number): AppError {
    const status = error.response?.status || 0;
    const data = error.response?.data as any;

    return {
      type: this.getErrorTypeFromStatus(status),
      message: data?.message || error.message || 'Network error occurred',
      statusCode: status,
      timestamp,
      requestId: error.response?.headers['x-request-id'],
      details: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
      },
      severity: this.getSeverityFromStatus(status),
    };
  }

  private handleStandardError(error: Error, timestamp: number): AppError {
    return {
      type: 'APPLICATION_ERROR',
      message: error.message,
      timestamp,
      stack: error.stack,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  private handleUnknownError(error: unknown, timestamp: number): AppError {
    return {
      type: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      timestamp,
      details: { error },
      severity: ErrorSeverity.HIGH,
    };
  }

  private getSeverityFromStatus(status: number): ErrorSeverity {
    if (status >= 500) return ErrorSeverity.HIGH;
    if (status === 401 || status === 403) return ErrorSeverity.HIGH;
    if (status >= 400) return ErrorSeverity.MEDIUM;
    return ErrorSeverity.LOW;
  }

  private getSentryLevel(severity: ErrorSeverity): Sentry.SeverityLevel {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'fatal';
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      default:
        return 'info';
    }
  }

  shouldRetry(error: AppError): boolean {
    if (error.statusCode) {
      return error.statusCode >= 500 || error.statusCode === 429;
    }
    return error.type === 'NETWORK_ERROR';
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return error != null && 
           typeof error === 'object' && 
           'isAxiosError' in error;
  }

  private getErrorTypeFromStatus(status: number): string {
    if (status === 401) return 'AUTHENTICATION_ERROR';
    if (status === 403) return 'AUTHORIZATION_ERROR';
    if (status === 422) return 'VALIDATION_ERROR';
    if (status >= 500) return 'SERVER_ERROR';
    if (status === 0) return 'NETWORK_ERROR';
    return 'UNKNOWN_ERROR';
  }

  addErrorListener(listener: (error: AppError) => void): void {
    this.errorListeners.push(listener);
  }

  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }
}

export const errorHandler = new ErrorHandler();