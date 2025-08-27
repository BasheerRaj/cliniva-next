import { ContactInfo, LegalInfo, WorkingDay, Department, BaseFormData, UploadedFile, Service } from './common';

export interface ComplexOverview {
  logo?: File | UploadedFile | string;
  name: string;
  legalName: string;
  yearEstablished: number;
  managerName: string;
  ceoName: string;
  description?: string;
  overview: string;
  vision: string;
  goals: string;
  departments: Department[];
  patientCapacity: number;
  staffCount: number;
  doctorsCount: number;
  totalArea?: number;
  parkingSpaces?: number;
  emergencyServices?: boolean;
  laboratoryServices?: boolean;
  pharmacyServices?: boolean;
}

export interface ComplexContact extends ContactInfo {
  receptionPhone?: string;
  emergencyPhone?: string;
  administrativeEmail?: string;
  maintenanceEmail?: string;
  securityPhone?: string;
}

export interface ComplexLegal extends LegalInfo {
  buildingPermits?: string;
  healthDepartmentLicense?: string;
  fireAndSafetyCompliance?: string;
  environmentalClearance?: string;
  accessibilityCompliance?: string;
}

export interface ComplexFormData extends BaseFormData {
  overview: ComplexOverview;
  contact: ComplexContact;
  legal?: ComplexLegal; // Optional for company plan, required for complex plan
  workingHours: WorkingDay[];
  clinics?: ClinicFormData[];
  departments?: Department[];
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
    services: Service[];
    roomNumbers?: string[];
    equipment?: string[];
  };
  contact: ContactInfo;
  legal?: LegalInfo;
  workingHours: WorkingDay[];
}

export interface ComplexStepData {
  overview?: Partial<ComplexOverview>;
  contact?: Partial<ComplexContact>;
  legal?: Partial<ComplexLegal>;
  workingHours?: WorkingDay[];
}

export interface ComplexValidationSchema {
  overview: any; // Yup schema
  contact: any;
  legal?: any;
  workingHours: any;
}

export interface DepartmentWithServices extends Department {
  services?: Service[];
  head?: string;
  staffCount?: number;
  budget?: number;
} 