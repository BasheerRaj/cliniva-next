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
      if (!complexId) {
        console.log('🏥 useDepartmentsByComplex: No complexId provided, returning empty array');
        return [];
      }
      
      console.log('🏥 useDepartmentsByComplex: Fetching departments for complexId:', complexId);
      const response = await apiClient.get(`/departments/complexes/${complexId}`);
      console.log('🏥 useDepartmentsByComplex: Response received:', {
        complexId,
        departmentCount: response.data?.length || 0,
        departments: response.data
      });
      
      return response.data;
    },
    enabled: !!complexId,
    staleTime: 5 * 60 * 1000,
  });
};
