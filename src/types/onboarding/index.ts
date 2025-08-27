// Common types
export * from './common';

// Company types
export * from './company';

// Complex types
export * from './complex';

// Clinic types
export * from './clinic';

// Re-export main types for convenience
export type {
  PlanType,
  OnboardingProgress,
  LocationCoords,
  ContactInfo,
  SocialMedia,
  LegalInfo,
  WorkingDay,
  Department,
  Service,
  BaseFormData,
  ValidationError,
  ApiResponse,
  UploadedFile,
  StepConfig,
  PlanConfig
} from './common';

export type {
  CompanyOverview,
  CompanyContact,
  CompanyLegal,
  CompanyFormData,
  CompanyStepData,
  CompanyValidationSchema
} from './company';

export type {
  ComplexOverview,
  ComplexContact,
  ComplexLegal,
  ComplexFormData,
  ComplexStepData,
  ComplexValidationSchema,
  DepartmentWithServices
} from './complex';

export type {
  ClinicOverview,
  ClinicContact,
  ClinicLegal,
  ClinicFormData,
  ClinicStepData,
  ClinicValidationSchema,
  ClinicService,
  ClinicSpecialization
} from './clinic';

// Import types for use in interfaces
import type { PlanType, OnboardingProgress } from './common';
import type { CompanyFormData } from './company';
import type { ComplexFormData } from './complex';
import type { ClinicFormData } from './clinic';

// Main onboarding data interface
export interface OnboardingData {
  planType: PlanType;
  progress: OnboardingProgress;
  companyData?: Partial<CompanyFormData>;
  complexData?: Partial<ComplexFormData>;
  clinicData?: Partial<ClinicFormData>;
}

// Form submission interfaces
export interface OnboardingSubmissionData {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  };
  subscriptionData: {
    planType: PlanType;
    planId: string;
  };
  organization?: any;
  complexes?: any[];
  departments?: any[];
  clinics?: any[];
  services?: any[];
  workingHours?: any[];
  contacts?: any[];
  legalInfo?: any;
} 