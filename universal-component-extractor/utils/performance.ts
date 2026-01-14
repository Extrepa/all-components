/**
 * Performance Utilities
 * Helpers for optimizing app performance
 */

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Measure performance of a function
 */
export async function measurePerformance<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (label) {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }
  
  return { result, duration };
}

/**
 * Lazy load a component
 */
export function lazyLoad<T>(
  importFn: () => Promise<{ default: T }>
): Promise<T> {
  return importFn().then(module => module.default);
}

/**
 * Check if code should be split
 */
export function shouldCodeSplit(bundleSize: number, threshold: number = 500000): boolean {
  return bundleSize > threshold;
}

/**
 * Create a performance budget
 */
export interface PerformanceBudget {
  maxInitialLoad: number; // in KB
  maxBundleSize: number; // in KB
  maxLoadTime: number; // in ms
}

export function checkPerformanceBudget(
  metrics: { bundleSize: number; loadTime: number },
  budget: PerformanceBudget
): { passed: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  if (metrics.bundleSize > budget.maxBundleSize) {
    warnings.push(`Bundle size (${(metrics.bundleSize / 1024).toFixed(2)}KB) exceeds budget (${budget.maxBundleSize}KB)`);
  }
  
  if (metrics.loadTime > budget.maxLoadTime) {
    warnings.push(`Load time (${metrics.loadTime}ms) exceeds budget (${budget.maxLoadTime}ms)`);
  }
  
  return {
    passed: warnings.length === 0,
    warnings,
  };
}

