import { ContactInfo, LegalInfo, WorkingDay, Service, BaseFormData, UploadedFile } from './common';

export interface ClinicOverview {
  logo?: File | UploadedFile | string;
  name: string;
  yearEstablished: number;
  headDoctorName: string;
  specialization: string;
  otherSpecialization?: string;
  sessionDuration: number;
  maxStaff: number;
  maxDoctors: number;
  maxPatients: number;
  overview?: string;
  vision?: string;
  goals?: string;
  services: Service[];
  roomCount?: number;
  equipmentList?: string[];
  accreditations?: string[];
  insuranceAccepted?: string[];
  languagesSpoken?: string[];
  // Additional service flags
  emergencyServices?: boolean;
  onlineBooking?: boolean;
  telemedicine?: boolean;
}

export interface ClinicContact extends ContactInfo {
  appointmentPhone?: string;
  faxNumber?: string;
  afterHoursPhone?: string;
  billingEmail?: string;
  medicalRecordsEmail?: string;
  patientPortalUrl?: string;
}

export interface ClinicLegal extends LegalInfo {
  medicalLicense?: string;
  practicePermit?: string;
  insurancePolicy?: string;
  hipaCompliance?: string;
  accreditationCertificates?: string[];
  staffCredentials?: string[];
  malpracticeInsurance?: string;
}

export interface ClinicFormData extends BaseFormData {
  overview: ClinicOverview;
  contact: ClinicContact;
  legal?: ClinicLegal; // Required for clinic plan, optional for company/complex plans
  workingHours: WorkingDay[];
  services?: Service[];
}

export interface ClinicStepData {
  overview?: Partial<ClinicOverview>;
  contact?: Partial<ClinicContact>;
  legal?: Partial<ClinicLegal>;
  workingHours?: WorkingDay[];
}

export interface ClinicValidationSchema {
  overview: any; // Yup schema
  contact: any;
  legal?: any;
  workingHours: any;
}

export interface ClinicService extends Service {
  category?: string;
  prerequisites?: string[];
  followUpRequired?: boolean;
  equipment?: string[];
  staffRequired?: string[];
}

export interface ClinicSpecialization {
  name: string;
  description: string;
  commonServices: string[];
  requiredEquipment: string[];
  typicalSessionDuration: number;
}

export const CLINIC_SPECIALIZATIONS: ClinicSpecialization[] = [
  {
    name: 'General Practice',
    description: 'Primary healthcare services for all ages',
    commonServices: ['Consultation', 'Health Checkup', 'Vaccination', 'Basic Treatment'],
    requiredEquipment: ['Stethoscope', 'Blood Pressure Monitor', 'Thermometer'],
    typicalSessionDuration: 15
  },
  {
    name: 'Pediatrics',
    description: 'Medical care for infants, children, and adolescents',
    commonServices: ['Child Consultation', 'Growth Monitoring', 'Immunization', 'Developmental Assessment'],
    requiredEquipment: ['Pediatric Scale', 'Growth Charts', 'Otoscope', 'Pediatric Stethoscope'],
    typicalSessionDuration: 20
  },
  {
    name: 'Dermatology',
    description: 'Diagnosis and treatment of skin conditions',
    commonServices: ['Skin Examination', 'Acne Treatment', 'Mole Removal', 'Cosmetic Procedures'],
    requiredEquipment: ['Dermatoscope', 'UV Lamp', 'Cryotherapy Equipment', 'Biopsy Tools'],
    typicalSessionDuration: 30
  },
  {
    name: 'Cardiology',
    description: 'Heart and cardiovascular system care',
    commonServices: ['ECG', 'Echocardiogram', 'Stress Test', 'Cardiac Consultation'],
    requiredEquipment: ['ECG Machine', 'Echocardiogram', 'Holter Monitor', 'Stress Test Equipment'],
    typicalSessionDuration: 45
  },
  {
    name: 'Orthopedics',
    description: 'Musculoskeletal system treatment',
    commonServices: ['Joint Examination', 'Fracture Treatment', 'Sports Medicine', 'Physical Therapy'],
    requiredEquipment: ['X-Ray Machine', 'Ultrasound', 'Orthopedic Tools', 'Physical Therapy Equipment'],
    typicalSessionDuration: 30
  }
]; 