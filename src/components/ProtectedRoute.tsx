
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Add console logs to track authentication state for debugging
    console.log("ProtectedRoute - Auth state:", { user: user ? "logged in" : "not logged in", loading, path: location.pathname });
  }, [user, loading, location]);

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

  // If user is not authenticated, redirect to auth page
  if (!user) {
    console.log("ProtectedRoute - Redirecting to auth page from:", location.pathname);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  console.log("ProtectedRoute - User authenticated, rendering content");
  return <>{children}</>;
};

export default ProtectedRoute;
