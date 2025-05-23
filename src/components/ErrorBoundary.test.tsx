
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/utils';
import ErrorBoundary from './ErrorBoundary';
import React from 'react';

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="no-error">All is well</div>;
};

describe('ErrorBoundary component', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('no-error')).toBeInTheDocument();
  });
  
  it('renders fallback UI when an error occurs', () => {
    // Suppress React's error boundary warning in test
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Refresh page/i)).toBeInTheDocument();
    
    spy.mockRestore();
  });
  
  it('renders custom fallback when provided', () => {
    // Suppress React's error boundary warning in test
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom error message</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    
    spy.mockRestore();
  });
});
