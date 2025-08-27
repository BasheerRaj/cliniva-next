'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/axios';

export interface OnboardingStatus {
  userId: string;
  hasSubscription: boolean;
  subscriptionId?: string;
  planType?: string;
  onboardingProgress: string[];
  setupComplete: boolean;
  onboardingComplete: boolean;
  currentStep: string;
  nextAction: string;
}

/**
 * Fetch the current user's onboarding status
 * NOTE: This hook is disabled - we now use session data directly to prevent infinite loops
 */
export const useOnboardingStatus = () => {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  return useQuery({
    queryKey: ['onboarding-status', userId],
    queryFn: async (): Promise<OnboardingStatus> => {
      // DISABLED: This API call was causing infinite loops
      // We now use session data directly in OnboardingRouter
      throw new Error('useOnboardingStatus is disabled - use session data directly');
    },
    enabled: false, // Completely disabled
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: false,
  });
};

/**
 * Hook to check if user should see plan selection
 * Uses session data directly instead of API calls
 */
export const useShouldShowPlanSelection = () => {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const isLoading = status === 'loading';
  
  // Use session data directly to determine state
  const hasSubscription = !!(user?.subscriptionId || user?.organizationId);
  const setupComplete = user?.setupComplete || false;
  
  const shouldShowPlanSelection = !isLoading && user && !hasSubscription;
  const shouldRedirectToSetup = !isLoading && user && hasSubscription && !setupComplete;
  const shouldRedirectToDashboard = !isLoading && user && setupComplete;
  
  // Enhanced planType determination
  let planType = user?.planType;
  
  if (!planType && user) {
    // Try to determine from onboarding progress
    if (user.onboardingProgress?.includes('company')) planType = 'company';
    else if (user.onboardingProgress?.includes('complex')) planType = 'complex';
    else if (hasSubscription) planType = 'clinic'; // Default fallback for subscribed users
    
    // Check sessionStorage for onboarding data as additional fallback
    if (!planType && typeof window !== 'undefined') {
      try {
        const onboardingData = sessionStorage.getItem('onboardingData');
        if (onboardingData) {
          const parsed = JSON.parse(onboardingData);
          if (parsed.organizationType) {
            planType = parsed.organizationType;
          }
        }
      } catch (error) {
        // Silently handle sessionStorage errors
      }
    }
  }
  
  return {
    status: user ? {
      userId: user.id,
      hasSubscription,
      subscriptionId: user.subscriptionId,
      planType: planType, // Now properly determined
      onboardingProgress: user.onboardingProgress || [],
      setupComplete,
      onboardingComplete: user.onboardingComplete || false,
      currentStep: hasSubscription ? (setupComplete ? 'completed' : 'organization_setup') : 'plan_selection',
      nextAction: hasSubscription ? (setupComplete ? 'Access dashboard' : 'Complete organization setup') : 'Select a subscription plan'
    } : null,
    isLoading,
    error: null,
    shouldShowPlanSelection,
    shouldRedirectToSetup,
    shouldRedirectToDashboard,
    planType
  };
}; 