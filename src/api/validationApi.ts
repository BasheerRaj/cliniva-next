import axios from 'axios';
import { getSession } from 'next-auth/react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types for validation responses
export interface RealTimeValidationResponse {
  isValid: boolean;
  isAvailable: boolean;
  message: string;
  suggestion?: string;
}

export interface StepValidationResponse {
  success: boolean;
  message: string;
  data: {
    isValid: boolean;
    errors: string[];
  };
}

export interface StepSaveResponse {
  success: boolean;
  message: string;
  data: any;
  entityId?: string;
  nextStep?: string;
  canProceed: boolean;
}

// Create axios instance with default config
const validationApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor - consistent with main API client
validationApiClient.interceptors.request.use(
  async (config) => {
    // Get the current session using NextAuth
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
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
validationApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Validation API Error:', error);
    // Handle 401 errors consistently
    if (error.response?.status === 401) {
      console.log('🔐 Authentication required for validation API');
      // Don't auto-redirect here, let the component handle it
    }
    return Promise.reject(error);
  }
);

// Real-time validation functions
export const validationApi = {
  // Validate organization name uniqueness
  async validateOrganizationName(name: string): Promise<RealTimeValidationResponse> {
    try {
      if (!name || name.trim().length === 0) {
        return {
          isValid: false,
          isAvailable: false,
          message: 'Organization name is required'
        };
      }

      const response = await validationApiClient.get('/validation/organization-name', {
        params: { name: name.trim() }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Organization name validation error:', error);
      return {
        isValid: false,
        isAvailable: false,
        message: error.response?.data?.message || 'Unable to validate organization name'
      };
    }
  },

  // Validate complex name uniqueness
  async validateComplexName(name: string, organizationId?: string): Promise<RealTimeValidationResponse> {
    try {
      if (!name || name.trim().length === 0) {
        return {
          isValid: false,
          isAvailable: false,
          message: 'Complex name is required'
        };
      }

      const params: any = { name: name.trim() };
      if (organizationId) {
        params.organizationId = organizationId;
      }

      const response = await validationApiClient.get('/validation/complex-name', { params });
      return response.data;
    } catch (error: any) {
      console.error('Complex name validation error:', error);
      return {
        isValid: false,
        isAvailable: false,
        message: error.response?.data?.message || 'Unable to validate complex name'
      };
    }
  },

  // Validate clinic name uniqueness
  async validateClinicName(name: string, complexId?: string, organizationId?: string): Promise<RealTimeValidationResponse> {
    try {
      if (!name || name.trim().length === 0) {
        return {
          isValid: false,
          isAvailable: false,
          message: 'Clinic name is required'
        };
      }

      const params: any = { name: name.trim() };
      if (complexId) params.complexId = complexId;
      if (organizationId) params.organizationId = organizationId;

      const response = await validationApiClient.get('/validation/clinic-name', { params });
      return response.data;
    } catch (error: any) {
      console.error('Clinic name validation error:', error);
      return {
        isValid: false,
        isAvailable: false,
        message: error.response?.data?.message || 'Unable to validate clinic name'
      };
    }
  },

  // Validate email uniqueness
  async validateEmail(email: string): Promise<RealTimeValidationResponse> {
    try {
      if (!email || email.trim().length === 0) {
        return {
          isValid: false,
          isAvailable: false,
          message: 'Email is required'
        };
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return {
          isValid: false,
          isAvailable: false,
          message: 'Please enter a valid email address'
        };
      }

      const response = await validationApiClient.get('/validation/email', {
        params: { email: email.trim() }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Email validation error:', error);
      return {
        isValid: false,
        isAvailable: false,
        message: error.response?.data?.message || 'Unable to validate email'
      };
    }
  },

  // Validate VAT number uniqueness
  async validateVatNumber(vatNumber: string): Promise<RealTimeValidationResponse> {
    try {
      if (!vatNumber || vatNumber.trim().length === 0) {
        return {
          isValid: false,
          isAvailable: false,
          message: 'VAT number is required'
        };
      }

      // Basic VAT format validation (10-15 digits)
      const vatRegex = /^[0-9]{10,15}$/;
      if (!vatRegex.test(vatNumber.trim())) {
        return {
          isValid: false,
          isAvailable: false,
          message: 'VAT number must be 10-15 digits'
        };
      }

      const response = await validationApiClient.get('/validation/vat-number', {
        params: { vatNumber: vatNumber.trim() }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('VAT number validation error:', error);
      return {
        isValid: false,
        isAvailable: false,
        message: error.response?.data?.message || 'Unable to validate VAT number'
      };
    }
  },

  // Validate CR number uniqueness  
  async validateCrNumber(crNumber: string): Promise<RealTimeValidationResponse> {
    try {
      if (!crNumber || crNumber.trim().length === 0) {
        return {
          isValid: false,
          isAvailable: false,
          message: 'CR number is required'
        };
      }

      // Basic CR format validation (7-12 digits)
      const crRegex = /^[0-9]{7,12}$/;
      if (!crRegex.test(crNumber.trim())) {
        return {
          isValid: false,
          isAvailable: false,
          message: 'CR number must be 7-12 digits'
        };
      }

      const response = await validationApiClient.get('/validation/cr-number', {
        params: { crNumber: crNumber.trim() }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('CR number validation error:', error);
      return {
        isValid: false,
        isAvailable: false,
        message: error.response?.data?.message || 'Unable to validate CR number'
      };
    }
  },

  // Validate medical license uniqueness
  async validateMedicalLicense(licenseNumber: string): Promise<RealTimeValidationResponse> {
    try {
      if (!licenseNumber || licenseNumber.trim().length === 0) {
        return {
          isValid: false,
          isAvailable: false,
          message: 'Medical license number is required'
        };
      }

      const response = await validationApiClient.get('/validation/license-number', {
        params: { licenseNumber: licenseNumber.trim() }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Medical license validation error:', error);
      return {
        isValid: false,
        isAvailable: false,
        message: error.response?.data?.message || 'Unable to validate medical license'
      };
    }
  },

  // General onboarding validation
  async validateOnboardingData(data: any): Promise<StepValidationResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/validate', data);
      return response.data;
    } catch (error: any) {
      console.error('Onboarding validation error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Validation failed',
        data: {
          isValid: false,
          errors: [error.response?.data?.message || 'Unknown validation error']
        }
      };
    }
  }
};

// Step-specific save and validation functions
export const stepApi = {
  // Save and validate organization overview
  async saveOrganizationOverview(data: any): Promise<StepSaveResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/organization/overview', data);
      return response.data;
    } catch (error: any) {
      console.error('Organization overview save error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save organization overview',
        data: null,
        canProceed: false
      };
    }
  },

  // Save and validate organization contact
  async saveOrganizationContact(data: any): Promise<StepSaveResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/organization/contact', data);
      return response.data;
    } catch (error: any) {
      console.error('Organization contact save error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save organization contact',
        data: null,
        canProceed: false
      };
    }
  },

  // Save and validate organization legal
  async saveOrganizationLegal(data: any): Promise<StepSaveResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/organization/legal', data);
      return response.data;
    } catch (error: any) {
      console.error('Organization legal save error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save organization legal information',
        data: null,
        canProceed: false
      };
    }
  },

  // Save and validate complex overview
  async saveComplexOverview(data: any): Promise<StepSaveResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/complex/overview', data);
      return response.data;
    } catch (error: any) {
      console.error('Complex overview save error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save complex overview',
        data: null,
        canProceed: false
      };
    }
  },

  // Save and validate complex contact
  async saveComplexContact(data: any): Promise<StepSaveResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/complex/contact', data);
      return response.data;
    } catch (error: any) {
      console.error('Complex contact save error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save complex contact',
        data: null,
        canProceed: false
      };
    }
  },

  // Save and validate complex schedule
  async saveComplexSchedule(data: any): Promise<StepSaveResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/complex/schedule', data);
      return response.data;
    } catch (error: any) {
      console.error('Complex schedule save error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save complex schedule',
        data: null,
        canProceed: false
      };
    }
  },

  // Complete complex setup
  async completeComplexSetup(): Promise<StepSaveResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/complex/complete');
      return response.data;
    } catch (error: any) {
      console.error('Complex completion error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to complete complex setup',
        data: null,
        canProceed: false
      };
    }
  },

  // Save and validate clinic overview
  async saveClinicOverview(data: any): Promise<StepSaveResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/clinic/overview', data);
      return response.data;
    } catch (error: any) {
      console.error('Clinic overview save error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save clinic overview',
        data: null,
        canProceed: false
      };
    }
  },

  // Save and validate clinic contact
  async saveClinicContact(data: any): Promise<StepSaveResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/clinic/contact', data);
      return response.data;
    } catch (error: any) {
      console.error('Clinic contact save error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save clinic contact',
        data: null,
        canProceed: false
      };
    }
  },

  // Save and validate clinic services & capacity
  async saveClinicServicesCapacity(data: any): Promise<StepSaveResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/clinic/services-capacity', data);
      return response.data;
    } catch (error: any) {
      console.error('Clinic services & capacity save error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save clinic services & capacity',
        data: null,
        canProceed: false
      };
    }
  },

  // Save and validate clinic legal information
  async saveClinicLegal(data: any): Promise<StepSaveResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/clinic/legal', data);
      return response.data;
    } catch (error: any) {
      console.error('Clinic legal save error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save clinic legal information',
        data: null,
        canProceed: false
      };
    }
  },

  // Save and validate clinic schedule
  async saveClinicSchedule(data: any): Promise<StepSaveResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/clinic/schedule', data);
      return response.data;
    } catch (error: any) {
      console.error('Clinic schedule save error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save clinic schedule',
        data: null,
        canProceed: false
      };
    }
  },

  // Complete clinic setup
  async completeClinicSetup(): Promise<StepSaveResponse> {
    try {
      const response = await validationApiClient.post('/onboarding/clinic/complete');
      return response.data;
    } catch (error: any) {
      console.error('Clinic completion error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to complete clinic setup',
        data: null,
        canProceed: false
      };
    }
  }
};

// Utility function for debounced validation
export const createDebouncedValidator = (
  validationFn: (value: string, ...args: any[]) => Promise<RealTimeValidationResponse>,
  delay: number = 500
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<typeof validationFn>): Promise<RealTimeValidationResponse> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        validationFn(...args).then(resolve);
      }, delay);
    });
  };
};

// Pre-configured debounced validators
export const debouncedValidators = {
  organizationName: createDebouncedValidator(validationApi.validateOrganizationName, 500),
  complexName: createDebouncedValidator(validationApi.validateComplexName, 500),
  clinicName: createDebouncedValidator(validationApi.validateClinicName, 500)
}; 