// Cache management for API responses
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>();

  set(key: string, data: any, ttl: number): void {
    this.cache.set(key, { data, timestamp: Date.now() + ttl });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const cacheManager = new CacheManager();

// Image optimization utility
export class ImageOptimizer {
  static getOptimizedUrl(originalUrl: string, width: number, height: number): string {
    if (!originalUrl) return '/placeholder.svg';
    
    // Add query parameters for image optimization
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}w=${width}&h=${height}&q=80&fit=cover`;
  }

  static getSrcSet(originalUrl: string, sizes: Array<number>): string {
    if (!originalUrl) return '';
    
    return sizes
      .map(size => `${this.getOptimizedUrl(originalUrl, size, size)} ${size}w`)
      .join(', ');
  }

  static getResponsiveImageUrl(originalUrl: string, maxWidth: number = 1200): string {
    if (!originalUrl) return '/placeholder.svg';
    
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}w=${maxWidth}&q=85&auto=format`;
  }
}

// SEO utilities
export class SEOUtils {
  static generateMetaTags(page: {
    title: string;
    description: string;
    image?: string;
    url: string;
    type?: string;
  }): {
    title: string;
    description: string;
    ogTags: Record<string, string>;
    twitterTags: Record<string, string>;
    structuredData: Record<string, any>;
  } {
    const ogTags: Record<string, string> = {
      'og:title': page.title,
      'og:description': page.description,
      'og:url': page.url,
      'og:type': page.type || 'website',
      ...(page.image && { 'og:image': page.image }),
    };

    const twitterTags: Record<string, string> = {
      'twitter:card': 'summary_large_image',
      'twitter:title': page.title,
      'twitter:description': page.description,
      ...(page.image && { 'twitter:image': page.image }),
    };

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
      description: page.description,
      url: page.url,
      ...(page.image && { image: page.image }),
    };

    return { title: page.title, description: page.description, ogTags, twitterTags, structuredData };
  }

  static generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  static generateOrganizationSchema(): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Kenya National Sub County League',
      url: process.env.REACT_APP_SITE_URL || 'https://knscl.co.ke',
      logo: `${process.env.REACT_APP_SITE_URL}/logo.svg`,
      sameAs: [
        'https://facebook.com/knscl',
        'https://twitter.com/knscl',
        'https://instagram.com/knscl',
      ],
    };
  }
}

// Performance monitoring
export class PerformanceMonitor {
  static recordMetric(name: string, value: number): void {
    if ('performance' in window && 'measure' in window.performance) {
      try {
        window.performance.measure(name, { detail: { value } });
      } catch (e) {
        console.warn(`Failed to record metric ${name}`);
      }
    }
  }

  static getMetrics(): { name: string; value: number }[] {
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      try {
        const entries = window.performance.getEntriesByType('measure');
        return entries.map(entry => ({ name: entry.name, value: entry.duration }));
      } catch (e) {
        return [];
      }
    }
    return [];
  }
}

// Error handling
export class ErrorHandler {
  static handleFetchError(error: Error, context: string): { message: string; code: string } {
    console.error(`[${context}]`, error);

    if (error instanceof TypeError) {
      return { message: 'Network error. Please check your connection.', code: 'NETWORK_ERROR' };
    }

    return { message: error.message || 'An error occurred. Please try again.', code: 'UNKNOWN_ERROR' };
  }

  static formatErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
  }
}

// Validation utilities
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static isValidPhoneNumber(phone: string): boolean {
    return /^[\d\s\-\+\(\)]{10,}$/.test(phone);
  }

  static sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

// Date utilities
export class DateUtils {
  static formatDate(date: Date | string, format: 'short' | 'long' = 'long'): string {
    const d = new Date(date);
    if (format === 'short') {
      return d.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  static formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  }

  static isUpcoming(date: Date | string): boolean {
    return new Date(date) > new Date();
  }

  static isToday(date: Date | string): boolean {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }

  static daysUntil(date: Date | string): number {
    const d = new Date(date);
    const today = new Date();
    const diffTime = d.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
