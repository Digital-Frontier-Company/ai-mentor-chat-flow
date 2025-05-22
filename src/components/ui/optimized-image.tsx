
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
}

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  loadingClassName = 'animate-pulse bg-zinc-800',
  priority = false
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
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
    >
      {error ? (
        <div className="flex items-center justify-center w-full h-full bg-zinc-900 text-zinc-400">
          <span className="text-xs">{alt}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
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
