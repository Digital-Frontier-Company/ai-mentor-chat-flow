
import React from 'react';
import { render, screen } from '@testing-library/react';

// Re-export everything from testing library
export * from '@testing-library/react';

// Re-export screen explicitly (it's already imported above)
export { screen };

// Custom render function (if needed for providers)
const customRender = (ui: React.ReactElement, options = {}) => {
  return render(ui, {
    // Add any global providers here if needed
    ...options,
  });
};

// Override the built-in render with our custom one
export { customRender as render };
