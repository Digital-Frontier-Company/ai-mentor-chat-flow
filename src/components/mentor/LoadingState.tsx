
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="text-center py-6">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
      <p className="mt-2 text-zinc-400">Loading mentor templates...</p>
    </div>
  );
};

export default LoadingState;
