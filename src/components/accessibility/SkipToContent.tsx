
import React from 'react';

const SkipToContent: React.FC = () => {
  return (
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-zinc-900 focus:text-white focus:p-4 focus:border focus:border-lime-400"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;
