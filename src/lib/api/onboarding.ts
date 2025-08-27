import axios, { AxiosResponse } from 'axios';
import { 
  PlanType, 
  CompanyFormData, 
  ComplexFormData, 
  ClinicFormData,
  OnboardingSubmissionData,
  ApiResponse,
  WorkingDay,
  Service,
  Department,
  ContactInfo,
  LegalInfo
} from '@/types/onboarding';

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Backend DTO interfaces (matching the NestJS DTOs)
interface UserDataDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

interface SubscriptionDataDto {
  planType: PlanType;
  planId: string;
}

interface OrganizationDto {
  name: string;
  legalName: string;
  phone: string;
  email: string;
  address: string;
  googleLocation: {
    lat: number;
    lng: number;
    shareableLink?: string;
  };
  logoUrl?: string;
  website?: string;
  businessProfile: {
    yearEstablished: number;
    mission: string;
    vision: string;
    ceoName: string;
    employeeCount?: number;
    yearlyRevenue?: number;
    industry?: string;
  };
  legalInfo: LegalInfo;
}

interface ComplexDto {
  name: string;
  address: string;
  googleLocation: {
    lat: number;
    lng: number;
    shareableLink?: string;
  };
  phone: string;
  email: string;
  logoUrl?: string;
  managerName: string;
  businessProfile: {
    yearEstablished: number;
    mission?: string;
    totalArea?: number;
    parkingSpaces?: number;
    emergencyServices?: boolean;
    laboratoryServices?: boolean;
    pharmacyServices?: boolean;
  };
  legalInfo?: LegalInfo;
}

interface ClinicDto {
  name: string;
  phone: string;
  email: string;
  logoUrl?: string;
  headDoctorName: string;
  specialization: string;
  capacity: {
    maxStaff: number;
    maxDoctors: number;
    maxPatients: number;
    sessionDuration: number;
    roomCount?: number;
  };
  businessProfile: {
    yearEstablished: number;
    accreditations?: string[];
    insuranceAccepted?: string[];
    languagesSpoken?: string[];
  };
  legalInfo?: LegalInfo;
}

interface DepartmentDto {
  name: string;
  description?: string;
  head?: string;
  staffCount?: number;
  budget?: number;
}

interface ServiceDto {
  name: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  category?: string;
  prerequisites?: string[];
  followUpRequired?: boolean;
  equipment?: string[];
  staffRequired?: string[];
}

interface WorkingHoursDto {
  entityType: 'organization' | 'complex' | 'clinic';
  entityName: string;
  dayOfWeek: string;
  isWorkingDay: boolean;
  openingTime?: string;
  closingTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

interface ContactDto {
  contactType: string;
  contactValue: string;
  entityType?: 'organization' | 'complex' | 'clinic';
  entityName?: string;
}

export interface CompleteOnboardingPayload {
  userData: UserDataDto;
  subscriptionData: SubscriptionDataDto;
  organization?: OrganizationDto;
  complexes?: ComplexDto[];
  departments?: DepartmentDto[];
  clinics?: ClinicDto[];
  services?: ServiceDto[];
  workingHours?: WorkingHoursDto[];
  contacts?: ContactDto[];
  legalInfo?: LegalInfo;
}

export interface OnboardingResult {
  success: boolean;
  userId: string;
  subscriptionId: string;
  entities: {
    organization?: any;
    complexes?: any[];
    clinics?: any[];
    departments?: any[];
    services?: any[];
  };
  workingHours?: any[];
  contacts?: any[];
  message: string;
}

export interface PlanInfo {
  id: string;
  name: string;
  type: PlanType;
  description: string;
  features: string[];
  pricing?: {
    monthly: number;
    yearly: number;
  };
  limitations?: {
    maxComplexes?: number;
    maxClinics?: number;
    maxUsers?: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface OnboardingProgressResult {
  userId: string;
  planType: PlanType;
  currentStep: number;
  completedSteps: string[];
  lastUpdated: string;
  data?: any;
}

// API Client Class
export class OnboardingApiClient {
  // Complete the entire onboarding process
  async completeOnboarding(payload: CompleteOnboardingPayload): Promise<ApiResponse<OnboardingResult>> {
    try {
      const response: AxiosResponse<ApiResponse<OnboardingResult>> = await apiClient.post('/onboarding/complete', payload);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to complete onboarding',
        errors: error.response?.data?.errors || [{ field: 'general', message: error.message }]
      };
    }
  }

  // Validate step data
  async validateStep(stepData: any, planType: PlanType, step: string): Promise<ApiResponse<ValidationResult>> {
    try {
      const response: AxiosResponse<ApiResponse<ValidationResult>> = await apiClient.post('/onboarding/validate', {
        stepData,
        planType,
        step
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Validation failed',
        errors: error.response?.data?.errors || [{ field: 'general', message: error.message }]
      };
    }
  }

  // Get onboarding progress
  async getProgress(userId: string): Promise<ApiResponse<OnboardingProgressResult>> {
    try {
      const response: AxiosResponse<ApiResponse<OnboardingProgressResult>> = await apiClient.get(`/onboarding/progress/${userId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get progress',
        errors: error.response?.data?.errors || [{ field: 'general', message: error.message }]
      };
    }
  }

  // Get available plans
  async getAvailablePlans(): Promise<ApiResponse<PlanInfo[]>> {
    try {
      const response: AxiosResponse<ApiResponse<PlanInfo[]>> = await apiClient.get('/onboarding/plans');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get plans',
        errors: error.response?.data?.errors || [{ field: 'general', message: error.message }]
      };
    }
  }

  // Transform form data to API payload
  transformToApiPayload(
    planType: PlanType,
    userData: UserDataDto,
    companyData?: Partial<CompanyFormData>,
    complexData?: Partial<ComplexFormData>,
    clinicData?: Partial<ClinicFormData>
  ): CompleteOnboardingPayload {
    const payload: CompleteOnboardingPayload = {
      userData,
      subscriptionData: {
        planType,
        planId: 'default-plan-id' // This should come from plan selection
      }
    };

    // Transform company data
    if (planType === 'company' && companyData?.overview && companyData?.contact && companyData?.legal) {
      payload.organization = {
        name: companyData.overview.tradeName,
        legalName: companyData.overview.legalName,
        phone: companyData.contact.phoneNumbers?.[0] || '',
        email: companyData.contact.email,
        address: companyData.contact.address || '',
        googleLocation: companyData.contact.googleLocation || { lat: 0, lng: 0 },
        logoUrl: typeof companyData.overview.logo === 'string' ? companyData.overview.logo : undefined,
        website: companyData.contact.website,
        businessProfile: {
          yearEstablished: companyData.overview.yearEstablished,
          mission: companyData.overview.overview,
          vision: companyData.overview.vision,
          ceoName: companyData.overview.ceoName,
          employeeCount: companyData.overview.employeeCount,
          yearlyRevenue: companyData.overview.yearlyRevenue,
          industry: companyData.overview.industry
        },
        legalInfo: companyData.legal
      };

      // Add social media contacts
      payload.contacts = [];
      if (companyData.contact.facebook) {
        payload.contacts.push({ contactType: 'facebook', contactValue: companyData.contact.facebook });
      }
      if (companyData.contact.twitter) {
        payload.contacts.push({ contactType: 'twitter', contactValue: companyData.contact.twitter });
      }
      if (companyData.contact.instagram) {
        payload.contacts.push({ contactType: 'instagram', contactValue: companyData.contact.instagram });
      }
      if (companyData.contact.linkedin) {
        payload.contacts.push({ contactType: 'linkedin', contactValue: companyData.contact.linkedin });
      }
    }

    // Transform complex data
    if ((planType === 'complex' || planType === 'company') && complexData?.overview && complexData?.contact) {
      const complexDto: ComplexDto = {
        name: complexData.overview.name,
        address: complexData.contact.address || '',
        googleLocation: complexData.contact.googleLocation || { lat: 0, lng: 0 },
        phone: complexData.contact.phoneNumbers?.[0] || '',
        email: complexData.contact.email,
        logoUrl: typeof complexData.overview.logo === 'string' ? complexData.overview.logo : undefined,
        managerName: complexData.overview.managerName,
        businessProfile: {
          yearEstablished: complexData.overview.yearEstablished,
          mission: complexData.overview.description,
          totalArea: complexData.overview.totalArea,
          parkingSpaces: complexData.overview.parkingSpaces,
          emergencyServices: complexData.overview.emergencyServices,
          laboratoryServices: complexData.overview.laboratoryServices,
          pharmacyServices: complexData.overview.pharmacyServices
        },
        legalInfo: complexData.legal
      };

      payload.complexes = [complexDto];

      // Add departments
      if (complexData.overview.departments) {
        payload.departments = complexData.overview.departments.map(dept => ({
          name: dept.name,
          description: dept.description
        }));
      }

      // Add working hours
      if (complexData.workingHours) {
        if (!payload.workingHours) payload.workingHours = [];
        payload.workingHours.push(...complexData.workingHours.map(wh => ({
          entityType: 'complex' as const,
          entityName: complexData.overview?.name || '',
          dayOfWeek: wh.dayOfWeek,
          isWorkingDay: wh.isWorkingDay,
          openingTime: wh.openingTime,
          closingTime: wh.closingTime,
          breakStartTime: wh.breakStartTime,
          breakEndTime: wh.breakEndTime
        })));
      }
    }

    // Transform clinic data
    if (clinicData?.overview && clinicData?.contact) {
      const clinicDto: ClinicDto = {
        name: clinicData.overview.name,
        phone: clinicData.contact.phoneNumbers?.[0] || '',
        email: clinicData.contact.email,
        logoUrl: typeof clinicData.overview.logo === 'string' ? clinicData.overview.logo : undefined,
        headDoctorName: clinicData.overview.headDoctorName,
        specialization: clinicData.overview.specialization,
        capacity: {
          maxStaff: clinicData.overview.maxStaff,
          maxDoctors: clinicData.overview.maxDoctors,
          maxPatients: clinicData.overview.maxPatients,
          sessionDuration: clinicData.overview.sessionDuration,
          roomCount: clinicData.overview.roomCount
        },
        businessProfile: {
          yearEstablished: clinicData.overview.yearEstablished,
          accreditations: clinicData.overview.accreditations,
          insuranceAccepted: clinicData.overview.insuranceAccepted,
          languagesSpoken: clinicData.overview.languagesSpoken
        },
        legalInfo: planType === 'clinic' ? clinicData.legal : undefined
      };

      if (!payload.clinics) payload.clinics = [];
      payload.clinics.push(clinicDto);

      // Add services
      if (clinicData.overview.services) {
        if (!payload.services) payload.services = [];
        payload.services.push(...clinicData.overview.services.map(service => ({
          name: service.name,
          description: service.description,
          durationMinutes: service.durationMinutes,
          price: service.price
        })));
      }

      // Add clinic working hours
      if (clinicData.workingHours) {
        if (!payload.workingHours) payload.workingHours = [];
        payload.workingHours.push(...clinicData.workingHours.map(wh => ({
          entityType: 'clinic' as const,
          entityName: clinicData.overview?.name || '',
          dayOfWeek: wh.dayOfWeek,
          isWorkingDay: wh.isWorkingDay,
          openingTime: wh.openingTime,
          closingTime: wh.closingTime,
          breakStartTime: wh.breakStartTime,
          breakEndTime: wh.breakEndTime
        })));
      }
    }

    return payload;
  }

  // Upload file helper
  async uploadFile(file: File): Promise<ApiResponse<{ url: string; id: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'File upload failed',
        errors: [{ field: 'file', message: error.message }]
      };
    }
  }
}

// Create singleton instance
export const onboardingApi = new OnboardingApiClient();

// Export default for easier imports
export default onboardingApi; 