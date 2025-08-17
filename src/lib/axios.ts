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
    
    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Sign out the user if token is invalid
        await signOut({ callbackUrl: '/auth/login' });
        return Promise.reject(error);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        await signOut({ callbackUrl: '/auth/login' });
        return Promise.reject(refreshError);
      }
    }
    
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
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
  }) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/register`, userData);
    return response.data;
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