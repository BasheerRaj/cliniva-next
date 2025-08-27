'use client';

import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

export interface OrganizationValidationResponse {
  success: boolean;
  message: string;
  data: {
    isAvailable: boolean;
    name: string;
  };
}

/**
 * Validate if an organization name is available
 */
export const useOrganizationNameValidation = () => {
  return useMutation({
    mutationFn: async (name: string): Promise<OrganizationValidationResponse> => {
      const response = await apiClient.post('/onboarding/validate-organization-name', { name });
      return response.data;
    },
  });
};

/**
 * Hook for form validation - returns a function that can be used with form libraries
 */
export const useOrganizationNameValidator = () => {
  const mutation = useOrganizationNameValidation();
  
  const validateName = async (name: string): Promise<boolean> => {
    try {
      const result = await mutation.mutateAsync(name);
      return result.data.isAvailable;
    } catch (error) {
      console.error('Organization name validation error:', error);
      return false;
    }
  };
  
  return {
    validateName,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}; 