
import React from 'react';

const SkipToContent: React.FC = () => {
  return (
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-zinc-900 focus:text-white focus:p-4 focus:border focus:border-lime-400 focus:rounded"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;
