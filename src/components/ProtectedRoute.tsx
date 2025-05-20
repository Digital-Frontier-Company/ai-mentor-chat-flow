
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Check if authentication is disabled via environment variable
  const isAuthDisabled = true; // Set to true to disable auth checks
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Return a loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-lime-500 border-r-transparent"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !isAuthDisabled) {
    // Redirect to the login page if not authenticated (and auth is not disabled)
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Render children if authenticated or if auth is disabled
  return <>{children}</>;
};

export default ProtectedRoute;
