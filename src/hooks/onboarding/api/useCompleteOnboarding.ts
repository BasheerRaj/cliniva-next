'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { onboardingApi, CompleteOnboardingPayload, OnboardingResult } from '@/lib/api/onboarding';
import { useOnboardingStore } from '../useOnboardingStore';

interface UseCompleteOnboardingOptions {
  onSuccess?: (data: OnboardingResult) => void;
  onError?: (error: any) => void;
  redirectTo?: string;
}

export const useCompleteOnboarding = (options: UseCompleteOnboardingOptions = {}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { resetOnboarding, setLoading } = useOnboardingStore();

  const {
    onSuccess,
    onError,
    redirectTo = '/dashboard'
  } = options;

  return useMutation({
    mutationFn: async (payload: CompleteOnboardingPayload) => {
      setLoading(true);
      const response = await onboardingApi.completeOnboarding(payload);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to complete onboarding');
      }
      
      return response.data!;
    },
    
    onSuccess: (data) => {
      setLoading(false);
      
      // Show success message
      toast.success('🎉 Onboarding completed successfully!', {
        description: 'Welcome to Cliniva! Your account has been set up.',
        duration: 5000,
      });

      // Store user data and authentication tokens
      if (data.userId) {
        // Note: In a real app, you'd get the token from the response
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('subscriptionId', data.subscriptionId);
      }

      // Clear onboarding data
      resetOnboarding();

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });

      // Call custom success handler
      if (onSuccess) {
        onSuccess(data);
      }

      // Redirect to dashboard or specified route
      setTimeout(() => {
        router.push(redirectTo);
      }, 1500); // Small delay to let user see success message
    },
    
    onError: (error: any) => {
      setLoading(false);
      
      console.error('Onboarding completion failed:', error);
      
      // Enhanced error parsing with specific cases
      let errorTitle = '❌ Onboarding Failed';
      let errorMessage = 'Failed to complete onboarding. Please try again.';
      let duration = 6000;
      
      // Check for network errors (backend not available)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorTitle = '🔌 Connection Failed';
        errorMessage = 'Cannot connect to the server. Please ensure the backend is running and try again.';
        duration = 8000;
      }
      // Check for authentication issues (but don't redirect - let user stay logged in)
      else if (error.response?.status === 401) {
        errorTitle = '🔐 Authentication Issue';
        errorMessage = 'Your session may have expired. Please refresh the page and try again.';
        duration = 7000;
      }
      // Check for validation errors
      else if (error.response?.status === 400) {
        errorTitle = '⚠️ Validation Error';
        errorMessage = error.response?.data?.message || 'Please check your information and try again.';
        duration = 7000;
      }
      // Check for server errors
      else if (error.response?.status >= 500) {
        errorTitle = '🔧 Server Error';
        errorMessage = 'The server encountered an issue. Please try again in a moment.';
        duration = 7000;
      }
      // Use provided error message if available
      else if (error.response?.data?.message || error.message) {
        errorMessage = error.response?.data?.message || error.message;
      }

      // Show enhanced error toast
      toast.error(errorTitle, {
        description: errorMessage,
        duration: duration,
        action: {
          label: 'Retry',
          onClick: () => {
            toast.info('💡 Tip: Make sure all required fields are filled and the backend server is running.');
          }
        }
      });

      // Call custom error handler
      if (onError) {
        onError(error);
      }
    },

    onSettled: () => {
      setLoading(false);
    },

    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on validation errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },

    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

// Hook for preparing payload from store data
export const usePrepareOnboardingPayload = () => {
  const { planType, companyData, complexData, clinicData } = useOnboardingStore();

  const preparePayload = (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }, selectedPlanId?: string): CompleteOnboardingPayload => {
    if (!planType) {
      throw new Error('Plan type not selected');
    }

    return onboardingApi.transformToApiPayload(
      planType,
      userData,
      companyData,
      complexData,
      clinicData
    );
  };

  return { preparePayload, planType };
};

// Combined hook for easy onboarding completion
export const useCompleteOnboardingFlow = (options: UseCompleteOnboardingOptions = {}) => {
  const completeMutation = useCompleteOnboarding(options);
  const { preparePayload } = usePrepareOnboardingPayload();

  const completeOnboarding = (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }, selectedPlanId?: string) => {
    try {
      const payload = preparePayload(userData, selectedPlanId);
      return completeMutation.mutate(payload);
    } catch (error) {
      toast.error('Failed to prepare onboarding data', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  return {
    completeOnboarding,
    isLoading: completeMutation.isPending,
    error: completeMutation.error,
    isSuccess: completeMutation.isSuccess,
    isError: completeMutation.isError,
    reset: completeMutation.reset,
    data: completeMutation.data
  };
}; 