'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
  showUnauthorized?: boolean;
}

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
      <div className="mb-4">
        <svg
          className="mx-auto h-16 w-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-6">
        You don't have permission to access this page.
      </p>
      <button
        onClick={() => window.history.back()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
      >
        Go Back
      </button>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  redirectTo = '/auth/login',
  showUnauthorized = false,
}) => {
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    hasRole, 
    hasPermission 
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check role permissions
      if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
        if (showUnauthorized) {
          return; // Show unauthorized page instead of redirecting
        }
        router.push('/unauthorized');
        return;
      }

      // Check required permissions
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission => 
          hasPermission(permission)
        );
        
        if (!hasAllPermissions) {
          if (showUnauthorized) {
            return; // Show unauthorized page instead of redirecting
          }
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [
    isLoading, 
    isAuthenticated, 
    user, 
    allowedRoles, 
    requiredPermissions, 
    hasRole, 
    hasPermission, 
    router, 
    redirectTo, 
    showUnauthorized
  ]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Check role permissions
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return showUnauthorized ? <UnauthorizedPage /> : null;
  }

  // Check required permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasAllPermissions) {
      return showUnauthorized ? <UnauthorizedPage /> : null;
    }
  }

  // User is authenticated and authorized
  return <>{children}</>;
}; 