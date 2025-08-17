'use client';

import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function StaffDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['staff']}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">
                  Staff Dashboard
                </h1>
                <div className="text-sm text-gray-500">
                  Welcome back, {user?.firstName} {user?.lastName}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Staff Dashboard
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Welcome to your staff dashboard. 
              Here you'll be able to manage appointments, assist patients, 
              handle administrative tasks, and support daily operations.
            </p>
            <div className="mt-8 text-sm text-gray-400">
              Content coming soon...
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 