'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

export interface Service {
  _id: string;
  name: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  complexDepartmentId?: string;
}

/**
 * Fetch services by complex department
 */
export const useServicesByDepartment = (complexDepartmentId?: string) => {
  return useQuery({
    queryKey: ['services', 'department', complexDepartmentId],
    queryFn: async (): Promise<Service[]> => {
      if (!complexDepartmentId) return [];
      const response = await apiClient.get(`/services/complex-departments/${complexDepartmentId}`);
      return response.data;
    },
    enabled: !!complexDepartmentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch services by clinic
 */
export const useServicesByClinic = (clinicId?: string) => {
  return useQuery({
    queryKey: ['services', 'clinic', clinicId],
    queryFn: async (): Promise<Service[]> => {
      if (!clinicId) return [];
      const response = await apiClient.get(`/services/clinics/${clinicId}`);
      return response.data;
    },
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000,
  });
};
