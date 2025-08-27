'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

export interface SubscriptionPlan {
  _id: string;
  name: string;
  type: 'clinic' | 'complex' | 'company';
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  limitations?: string[];
  maxClinics?: number;
  maxComplexes?: number;
  maxDoctors?: number;
  maxPatients?: number;
  maxStaff?: number;
  isActive: boolean;
  isPopular?: boolean;
  description?: string;
}

/**
 * Fetch all subscription plans from the API
 */
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const response = await apiClient.get('/subscriptions/plans');
      // Backend now returns the plans directly without wrapper
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - plans don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Fetch plans by type
 */
export const useSubscriptionPlansByType = (planType?: 'clinic' | 'complex' | 'company') => {
  return useQuery({
    queryKey: ['subscription-plans', planType],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const response = await apiClient.get('/subscriptions/plans');
      const plans: SubscriptionPlan[] = response.data;
      return planType ? plans.filter(plan => plan.type === planType) : plans;
    },
    enabled: !!planType,
    staleTime: 10 * 60 * 1000,
  });
};
