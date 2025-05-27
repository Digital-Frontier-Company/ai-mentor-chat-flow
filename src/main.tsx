
import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from './components/ErrorBoundary';
import { Skeleton } from './components/ui/skeleton';
import './index.css';

// Use dynamic import for App component to enable code splitting
const App = React.lazy(() => import('./App'));

// Loading component for Suspense fallback
const AppLoading = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="space-y-4 w-full max-w-md">
      <Skeleton className="h-12 w-3/4 mx-auto" />
      <Skeleton className="h-96 w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  </div>
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <React.Suspense fallback={<AppLoading />}>
        <App />
      </React.Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
);

// Add global error handling for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

// Add unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
