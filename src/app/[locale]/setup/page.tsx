'use client';

import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OnboardingData {
  organizationType: 'clinic' | 'complex' | 'company';
  organizationName: string;
  organizationDescription: string;
  subscriptionId: string;
  planId: string;
}

export default function SetupPage() {
  const { user, logout } = useAuth();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  useEffect(() => {
    // Load onboarding data from sessionStorage
    const storedData = sessionStorage.getItem('onboardingData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setOnboardingData(data);
      } catch (error) {
        console.error('Failed to parse onboarding data:', error);
      }
    }
  }, []);

  return (
    <ProtectedRoute allowedRoles={['owner']}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">
                  Organization Setup
                </h1>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
                          <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Cliniva!
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Your account has been created successfully. Let's complete the setup of your organization.
              </p>
              {onboardingData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <h3 className="font-semibold text-blue-800">
                    {onboardingData.organizationName}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {onboardingData.organizationType.charAt(0).toUpperCase() + onboardingData.organizationType.slice(1)} Plan
                    {onboardingData.organizationDescription && ` • ${onboardingData.organizationDescription}`}
                  </p>
                </div>
              )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                Organization Setup
              </h3>
              <p className="text-gray-500 max-w-2xl mx-auto mb-8">
                Here you'll be able to complete your organization setup including:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left mb-12">
                <div className="flex items-start space-x-3">
                  <svg className="flex-shrink-0 h-6 w-6 text-blue-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900">Organization Details</h4>
                    <p className="text-gray-500 text-sm">Complete your facility information</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="flex-shrink-0 h-6 w-6 text-blue-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900">Department Setup</h4>
                    <p className="text-gray-500 text-sm">Configure your departments and services</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="flex-shrink-0 h-6 w-6 text-blue-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900">Working Hours</h4>
                    <p className="text-gray-500 text-sm">Set up your operating schedule</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="flex-shrink-0 h-6 w-6 text-blue-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900">Staff Management</h4>
                    <p className="text-gray-500 text-sm">Add doctors and staff members</p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-400 mb-8">
                Setup wizard coming soon...
              </div>
              
              <div className="flex justify-center space-x-4">
                <Link
                  href="/dashboard/owner"
                  className="bg-gray-600 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700 transition-colors"
                >
                  Skip Setup for Now
                </Link>
                <button
                  disabled
                  className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium opacity-50 cursor-not-allowed"
                >
                  Start Setup Wizard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 