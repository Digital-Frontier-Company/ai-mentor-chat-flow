
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loadingClassName?: string;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  role?: string;
}

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  loadingClassName = 'animate-pulse bg-zinc-800',
  priority = false,
  objectFit = 'cover',
  role
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);
    
    // Preload image if priority is true
    if (priority && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setError(true);
    }
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
    console.error(`Failed to load image: ${src}`);
  };

  // Build inline styles for width and height if provided
  const dimensionStyles: React.CSSProperties = {};
  if (width) dimensionStyles.width = width;
  if (height) dimensionStyles.height = height;

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        !isLoaded && loadingClassName,
        className
      )}
      style={dimensionStyles}
      role={role || "img"}
      aria-label={!isLoaded && !error ? `Loading image: ${alt}` : undefined}
    >
      {error ? (
        <div className="flex items-center justify-center w-full h-full bg-zinc-900 text-zinc-400" aria-label={alt}>
          <span className="text-xs">{alt}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            {
              'object-cover': objectFit === 'cover',
              'object-contain': objectFit === 'contain',
              'object-fill': objectFit === 'fill',
              'object-none': objectFit === 'none',
              'object-scale-down': objectFit === 'scale-down',
            }
          )}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
