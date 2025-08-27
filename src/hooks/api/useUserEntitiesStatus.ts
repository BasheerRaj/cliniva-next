'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

export interface UserEntitiesStatus {
  hasOrganization: boolean;
  hasComplex: boolean;
  hasClinic: boolean;
  planType: string;
  hasPrimaryEntity: boolean;
  needsSetup: boolean;
  nextStep: string;
}

/**
 * Check if user has required entities based on their plan
 */
export const useUserEntitiesStatus = (userId?: string) => {
  return useQuery({
    queryKey: ['user-entities-status', userId],
    queryFn: async (): Promise<UserEntitiesStatus> => {
      if (!userId) throw new Error('User ID is required');
      const response = await apiClient.get(`/users/${userId}/entities-status`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Check current user's entities status
 */
export const useCurrentUserEntitiesStatus = () => {
  return useQuery({
    queryKey: ['current-user-entities-status'],
    queryFn: async (): Promise<UserEntitiesStatus> => {
      const response = await apiClient.post('/users/check-entities');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
