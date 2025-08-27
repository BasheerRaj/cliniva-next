'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

export interface Department {
  _id: string;
  name: string;
  description?: string;
}

/**
 * Fetch all departments from the API
 */
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async (): Promise<Department[]> => {
      const response = await apiClient.get('/departments');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch departments for a specific complex
 */
export const useDepartmentsByComplex = (complexId?: string) => {
  return useQuery({
    queryKey: ['departments', 'complex', complexId],
    queryFn: async (): Promise<Department[]> => {
      if (!complexId) return [];
      const response = await apiClient.get(`/departments/complexes/${complexId}`);
      return response.data;
    },
    enabled: !!complexId,
    staleTime: 5 * 60 * 1000,
  });
};
