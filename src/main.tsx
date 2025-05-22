
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add a loading indicator that displays before React renders
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Failed to find the root element');
} else {
  // Create a loading indicator in the DOM before React hydration
  if (rootElement.innerHTML === '') {
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; background-color: #09090b;">
        <div style="display: inline-block; width: 50px; height: 50px; border: 4px solid #10b981; border-radius: 50%; border-right-color: transparent; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 16px; color: #a1a1aa;">Loading MakeMentors.io...</p>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('App successfully mounted');
  } catch (error) {
    console.error('Error rendering the application:', error);
    
    // Show error UI if app fails to render
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; margin: 30px auto; max-width: 600px; text-align: center; background-color: #18181b; border-radius: 8px; color: #f4f4f5;">
          <h2 style="color: #ef4444; margin-bottom: 16px;">Something went wrong</h2>
          <p>We're having trouble loading the application. Please try refreshing the page.</p>
          <button onclick="window.location.reload()" style="background: #10b981; color: black; border: none; padding: 8px 16px; margin-top: 16px; border-radius: 4px; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      `;
    }
  }
}
