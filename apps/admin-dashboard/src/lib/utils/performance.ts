import { logger } from './logger';
import { FEATURES } from '@/config/features';

class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;

  initialize() {
    if (typeof window === 'undefined') return;

    // Web Vitals
    this.measureWebVitals();

    // API Performance
    this.measureApiPerformance();
  }

  private measureWebVitals() {
    if ('web-vital' in window) {
      // Measure Core Web Vitals
      ['CLS', 'FID', 'LCP', 'FCP', 'TTFB'].forEach(metric => {
        (window as any).webVitals.on(metric, (data: any) => {
          logger.info(`Web Vital: ${metric}`, {
            value: data.value,
            rating: data.rating,
          });

          // Send to analytics
          if (FEATURES.ENABLE_ANALYTICS) {
            this.sendToAnalytics(metric, data);
          }
        });
      });
    }
  }

  private measureApiPerformance() {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource' && 
            entry.name.includes('/api/')) {
          
          const duration = entry.duration;
          const isSlowRequest = duration > 1000;

          if (isSlowRequest) {
            logger.warn('Slow API request detected', {
              url: entry.name,
              duration: Math.round(duration),
              size: (entry as any).transferSize,
            });
          }
        }
      }
    });

    this.observer.observe({ entryTypes: ['resource'] });
  }

  private sendToAnalytics(metric: string, data: any) {
    // Integration with your analytics provider
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Web Vital', {
        metric,
        value: data.value,
        rating: data.rating,
      });
    }
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();