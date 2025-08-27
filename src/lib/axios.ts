import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token and language header
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get the current session
    const session = await getSession();
    
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }

    // Add language header based on current locale
    if (typeof window !== 'undefined') {
      // Get locale from pathname or default to 'en'
      const pathname = window.location.pathname;
      const locale = pathname.startsWith('/ar') ? 'ar' : 'en';
      config.headers['Accept-Language'] = locale;
      config.headers['X-Locale'] = locale;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Only handle authentication errors, not all 401s
    // Check if it's actually an authentication/authorization issue
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Check if the error indicates an expired/invalid token
      const errorMessage = error.response?.data?.message?.toLowerCase() || '';
      const isAuthError = errorMessage.includes('token') || 
                         errorMessage.includes('unauthorized') || 
                         errorMessage.includes('expired') ||
                         errorMessage.includes('invalid') ||
                         error.response?.data?.code === 'TOKEN_EXPIRED' ||
                         error.response?.data?.code === 'UNAUTHORIZED';
      
      // Only sign out if it's actually an authentication issue
      if (isAuthError) {
        try {
          console.log('🔐 Authentication token expired, signing out...');
          await signOut({ callbackUrl: '/auth/login' });
          return Promise.reject(error);
        } catch (refreshError) {
          console.log('🔐 Failed to refresh token, signing out...');
          await signOut({ callbackUrl: '/auth/login' });
          return Promise.reject(refreshError);
        }
      }
    }
    
    // For all other errors (including non-auth 401s), just pass them through
    // This allows the application to handle them appropriately
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper functions for common API calls
export const apiHelpers = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/login`, {
      email,
      password,
    });
    return {
      success: true,
      ...response.data
    };
  },

  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
    nationality?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
  }) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/register`, userData);
    return {
      success: true,
      ...response.data
    };
  },

  // User management
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // Onboarding
  getSubscriptionPlans: async () => {
    const response = await apiClient.get('/subscriptions/plans');
    return response.data;
  },

  createOrganization: async (organizationData: any) => {
    const response = await apiClient.post('/organization', organizationData);
    return response.data;
  },

  // Get current user's organization
  getCurrentOrganization: async () => {
    const response = await apiClient.get('/auth/profile');
    const user = response.data.user;
    
    if (user.organizationId) {
      const orgResponse = await apiClient.get(`/organization/${user.organizationId}`);
      return {
        success: true,
        data: orgResponse.data
      };
    }
    
    return {
      success: false,
      message: 'No organization found for user'
    };
  },

  // Generic CRUD operations
  get: async (endpoint: string) => {
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  post: async (endpoint: string, data: any) => {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  },

  put: async (endpoint: string, data: any) => {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  },

  patch: async (endpoint: string, data: any) => {
    const response = await apiClient.patch(endpoint, data);
    return response.data;
  },

  delete: async (endpoint: string) => {
    const response = await apiClient.delete(endpoint);
    return response.data;
  },
}; 