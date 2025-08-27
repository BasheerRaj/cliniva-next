import { ContactInfo, SocialMedia, LegalInfo, WorkingDay, Department, BaseFormData, UploadedFile } from './common';

export interface CompanyOverview {
  name: string;
  legalName?: string;
  yearEstablished?: number;
  overview?: string;
  goals?: string;
  vision?: string;
  mission?: string;
  ceoName?: string;
  logoUrl?: string;
  registrationNumber?: string;
}

export interface CompanyContact {
  address?: string;
  googleLocation?: string; // Google Maps coordinates or place ID (matches backend)
  phone?: string;
  email?: string;
  website?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  socialMediaLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    whatsapp?: string;
  };
}

export interface CompanyLegal {
  vatNumber?: string;
  crNumber?: string;
  termsConditionsUrl?: string;
  privacyPolicyUrl?: string;
}

export interface CompanyFormData extends BaseFormData {
  overview: CompanyOverview;
  contact: CompanyContact;
  legal: CompanyLegal;
  complexes?: ComplexFormData[];
  clinics?: ClinicFormData[];
}

// Import these to avoid circular dependency issues
export interface ComplexFormData {
  id?: string;
  overview: {
    logo?: File | UploadedFile | string;
    name: string;
    yearEstablished: number;
    managerName: string;
    description?: string;
    departments: Department[];
  };
  contact: ContactInfo;
  legal?: LegalInfo;
  workingHours: WorkingDay[];
  clinics?: ClinicFormData[];
}

export interface ClinicFormData {
  id?: string;
  overview: {
    logo?: File | UploadedFile | string;
    name: string;
    yearEstablished: number;
    headDoctorName: string;
    specialization: string;
    sessionDuration: number;
    maxStaff: number;
    maxDoctors: number;
    maxPatients: number;
    services: {
      name: string;
      description?: string;
      durationMinutes?: number;
      price?: number;
    }[];
  };
  contact: ContactInfo;
  legal?: LegalInfo;
  workingHours: WorkingDay[];
}

export interface CompanyStepData {
  overview?: Partial<CompanyOverview>;
  contact?: Partial<CompanyContact>;
  legal?: Partial<CompanyLegal>;
}

export interface CompanyValidationSchema {
  overview: any; // Yup schema
  contact: any;
  legal: any;
} 