
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle, measureRenderTime, preloadAssets, isSlowConnection } from './performance';

describe('Performance utilities', () => {
  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    
    afterEach(() => {
      vi.useRealTimers();
    });
    
    it('should debounce function calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn();
      expect(mockFn).not.toBeCalled();
      
      debouncedFn();
      debouncedFn();
      expect(mockFn).not.toBeCalled();
      
      vi.advanceTimersByTime(110);
      expect(mockFn).toBeCalledTimes(1);
    });
    
    it('should clear previous timeout when called again', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn();
      vi.advanceTimersByTime(50);
      debouncedFn(); // This should reset the timer
      vi.advanceTimersByTime(60);
      expect(mockFn).not.toBeCalled();
      
      vi.advanceTimersByTime(50);
      expect(mockFn).toBeCalledTimes(1);
    });
  });
  
  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    
    afterEach(() => {
      vi.useRealTimers();
    });
    
    it('should throttle function calls', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);
      
      throttledFn();
      expect(mockFn).toBeCalledTimes(1);
      
      throttledFn();
      throttledFn();
      expect(mockFn).toBeCalledTimes(1);
      
      vi.advanceTimersByTime(110);
      throttledFn();
      expect(mockFn).toBeCalledTimes(2);
    });
  });
  
  describe('measureRenderTime', () => {
    it('should log render time when called', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const performanceSpy = vi.spyOn(performance, 'now');
      
      performanceSpy.mockReturnValueOnce(100).mockReturnValueOnce(150);
      
      const endMeasure = measureRenderTime('TestComponent');
      endMeasure();
      
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('TestComponent rendered in 50ms'));
      
      spy.mockRestore();
      performanceSpy.mockRestore();
    });
  });
  
  describe('preloadAssets', () => {
    it('should create link elements for each asset', () => {
      const appendChildSpy = vi.spyOn(document.head, 'appendChild').mockImplementation(() => document.createElement('div'));
      const createElementSpy = vi.spyOn(document, 'createElement');
      
      preloadAssets([
        'test.js', 
        'test.css', 
        'test.jpg', 
        'test.png'
      ]);
      
      expect(createElementSpy).toHaveBeenCalledTimes(4);
      expect(appendChildSpy).toHaveBeenCalledTimes(4);
      
      appendChildSpy.mockRestore();
      createElementSpy.mockRestore();
    });
    
    it('should set correct "as" attribute based on file type', () => {
      const links: HTMLLinkElement[] = [];
      vi.spyOn(document, 'createElement').mockImplementation(() => {
        const link = document.createElement('link') as HTMLLinkElement;
        links.push(link);
        return link;
      });
      vi.spyOn(document.head, 'appendChild').mockImplementation(() => document.createElement('div'));
      
      preloadAssets(['script.js', 'style.css', 'image.jpg']);
      
      expect(links[0].as).toBe('script');
      expect(links[1].as).toBe('style');
      expect(links[2].as).toBe('image');
      
      vi.restoreAllMocks();
    });
  });
  
  describe('isSlowConnection', () => {
    it('should detect slow connections', () => {
      // Test with connection property present and slow
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: 'slow-2g',
          saveData: false
        },
        configurable: true
      });
      
      expect(isSlowConnection()).toBe(true);
      
      // Test with connection saveData
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '4g',
          saveData: true
        },
        configurable: true
      });
      
      expect(isSlowConnection()).toBe(true);
      
      // Test with fast connection
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '4g',
          saveData: false
        },
        configurable: true
      });
      
      expect(isSlowConnection()).toBe(false);
      
      // Restore original navigator
      Object.defineProperty(navigator, 'connection', {
        value: undefined,
        configurable: true
      });
    });
    
    it('should return false when connection API is not available', () => {
      // Ensure connection is undefined
      Object.defineProperty(navigator, 'connection', {
        value: undefined,
        configurable: true
      });
      
      expect(isSlowConnection()).toBe(false);
    });
  });
});
