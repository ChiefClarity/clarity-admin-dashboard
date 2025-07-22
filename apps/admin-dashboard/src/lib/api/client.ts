import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { errorHandler } from '@/lib/utils/errorHandler';
import { authService } from './auth';

class ApiClient {
  private instance: AxiosInstance;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // For cookies
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        // Add timestamp
        config.headers['X-Request-Timestamp'] = Date.now().toString();

        // Get fresh token if needed
        const token = await authService.getValidToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        // Log response time in development
        if (process.env.NODE_ENV === 'development') {
          const requestTime = response.config.headers['X-Request-Timestamp'];
          if (requestTime) {
            const duration = Date.now() - parseInt(requestTime);
            console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
          }
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Ensure only one refresh request at a time
            if (!this.refreshPromise) {
              this.refreshPromise = authService.refreshTokens();
            }
            
            await this.refreshPromise;
            this.refreshPromise = null;

            // Retry original request
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            authService.logout();
            return Promise.reject(refreshError);
          }
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          if (retryAfter && !originalRequest._retryCount) {
            originalRequest._retryCount = 1;
            await this.delay(parseInt(retryAfter) * 1000);
            return this.instance(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Type-safe request methods
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();