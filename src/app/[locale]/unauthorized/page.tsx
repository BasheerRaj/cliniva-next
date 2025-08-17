'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
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
          Please contact your administrator if you believe this is an error.
        </p>
        
        {user && (
          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <p className="text-sm text-gray-600">
              Logged in as: <span className="font-medium">{user.email}</span>
            </p>
            <p className="text-sm text-gray-600">
              Role: <span className="font-medium capitalize">{user.role}</span>
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          {user ? (
            <>
              <Link
                href={`/dashboard/${user.role}`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Go to My Dashboard
              </Link>
              <button
                onClick={logout}
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Login
            </Link>
          )}
          
          <button
            onClick={() => window.history.back()}
            className="block w-full text-gray-600 hover:text-gray-800 font-medium py-2 px-4 transition duration-200"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
} 