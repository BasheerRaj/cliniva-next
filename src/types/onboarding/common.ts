export interface LocationCoords {
  lat: number;
  lng: number;
  shareableLink?: string;
}

export interface ContactInfo {
  phoneNumbers: string[];
  email: string;
  website?: string;
  address?: string;
  googleLocation?: LocationCoords;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface SocialMedia {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

export interface LegalInfo {
  vatNumber?: string;
  crNumber?: string;
  termsConditions?: string;
  privacyPolicy?: string;
}

export interface WorkingDay {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isWorkingDay: boolean;
  openingTime?: string;
  closingTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

export interface Department {
  name: string;
  description?: string;
}

export interface Service {
  name: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
}

export type PlanType = 'company' | 'complex' | 'clinic';

export interface OnboardingProgress {
  currentStep: number;
  currentSubStep: string;
  completedSteps: string[];
  planType: PlanType;
}

export interface BaseFormData {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface UploadedFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface StepConfig {
  id: string;
  title: string;
  description?: string;
  isRequired: boolean;
  canSkip: boolean;
}

export interface PlanConfig {
  type: PlanType;
  title: string;
  description: string;
  steps: StepConfig[];
  features: string[];
  recommended?: boolean;
} 