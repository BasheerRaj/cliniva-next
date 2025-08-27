'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

export interface Specialty {
  _id: string;
  name: string;
  description?: string;
}

/**
 * Fetch all medical specialties from the API
 */
export const useSpecialties = () => {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: async (): Promise<Specialty[]> => {
      const response = await apiClient.get('/specialties');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Search specialties by term
 */
export const useSpecialtySearch = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['specialties', 'search', searchTerm],
    queryFn: async (): Promise<Specialty[]> => {
      if (!searchTerm) return [];
      const response = await apiClient.get(`/specialties?search=${encodeURIComponent(searchTerm)}`);
      return response.data;
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
