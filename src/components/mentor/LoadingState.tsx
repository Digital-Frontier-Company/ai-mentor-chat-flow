
import React from 'react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  withBackdrop?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  size = "md",
  withBackdrop = false
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  
  const spinnerElement = (
    <div className={`inline-block ${sizeClasses[size]} animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent`}></div>
  );
  
  if (withBackdrop) {
    return (
      <div className="fixed inset-0 bg-zinc-950/70 flex items-center justify-center z-50">
        <div className="text-center p-6 rounded-lg bg-zinc-900/90 shadow-xl">
          {spinnerElement}
          <p className="mt-2 text-zinc-200">{message}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="text-center py-6">
      {spinnerElement}
      <p className="mt-2 text-zinc-400">{message}</p>
    </div>
  );
};

export default LoadingState;
