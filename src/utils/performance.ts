
/**
 * Performance utility functions for production optimization
 */

// Extending Navigator interface to include connection property
interface NetworkInformation {
  effectiveType: string;
  saveData: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

// Debounce function to limit how often a function can be called
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Throttle function to ensure function is called at most once per specified period
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Measure component render time (use in development only)
export function measureRenderTime(componentName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    console.log(`[Performance] ${componentName} rendered in ${endTime - startTime}ms`);
  };
}

// Preload critical assets
export function preloadAssets(urls: string[]): void {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || 
               url.endsWith('.gif') || url.endsWith('.webp')) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
}

// Detect slow network connections
export function isSlowConnection(): boolean {
  const nav = navigator as NavigatorWithConnection;
  if (nav.connection) {
    return nav.connection.saveData || 
           nav.connection.effectiveType === 'slow-2g' || 
           nav.connection.effectiveType === '2g';
  }
  return false;
}
