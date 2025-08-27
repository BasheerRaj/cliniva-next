import * as yup from 'yup';
import {
  contactInfoSchema,
  legalInfoSchema,
  fileUploadSchema,
  yearEstablishedSchema,
  requiredStringSchema,
  optionalStringSchema,
  positiveNumberSchema,
  optionalPositiveNumberSchema,
  workingHoursSchema,
  serviceSchema
} from './common';

// Clinic overview validation
export const clinicOverviewSchema = yup.object({
  logo: fileUploadSchema.optional(),
  name: requiredStringSchema('Clinic name', 2),
  yearEstablished: yearEstablishedSchema,
  headDoctorName: requiredStringSchema('Head doctor name', 2),
  specialization: requiredStringSchema('Specialization', 2),
  sessionDuration: yup.number()
    .min(15, 'Session duration must be at least 15 minutes')
    .max(240, 'Session duration cannot exceed 240 minutes')
    .required('Session duration is required'),
  maxStaff: positiveNumberSchema('Maximum staff'),
  maxDoctors: positiveNumberSchema('Maximum doctors'),
  maxPatients: positiveNumberSchema('Maximum patients'),
  services: yup.array()
    .of(serviceSchema)
    .min(1, 'At least one service is required')
    .required('Services are required'),
  roomCount: optionalPositiveNumberSchema(),
  equipmentList: yup.array().of(yup.string().min(2, 'Equipment name must be at least 2 characters')).optional(),
  accreditations: yup.array().of(yup.string().min(5, 'Accreditation must be at least 5 characters')).optional(),
  insuranceAccepted: yup.array().of(yup.string().min(2, 'Insurance name must be at least 2 characters')).optional(),
  languagesSpoken: yup.array().of(yup.string().min(2, 'Language must be at least 2 characters')).optional()
});

// Clinic contact validation (extends base contact info)
export const clinicContactSchema = contactInfoSchema.concat(yup.object({
  appointmentPhone: yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid appointment phone number')
    .optional(),
  faxNumber: yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid fax number')
    .optional(),
  afterHoursPhone: yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid after hours phone number')
    .optional(),
  billingEmail: yup.string().email('Invalid billing email format').optional(),
  medicalRecordsEmail: yup.string().email('Invalid medical records email format').optional(),
  patientPortalUrl: yup.string().url('Invalid patient portal URL').optional()
}));

// Clinic legal validation (extends base legal info)
export const clinicLegalSchema = legalInfoSchema.concat(yup.object({
  medicalLicense: optionalStringSchema(5),
  practicePermit: optionalStringSchema(5),
  insurancePolicy: optionalStringSchema(5),
  hipaCompliance: optionalStringSchema(5),
  accreditationCertificates: yup.array().of(yup.string().min(5, 'Certificate must be at least 5 characters')).optional(),
  staffCredentials: yup.array().of(yup.string().min(5, 'Credential must be at least 5 characters')).optional(),
  malpracticeInsurance: optionalStringSchema(5)
}));

// For clinic plan (standalone), legal info is required
export const clinicLegalRequiredSchema = legalInfoSchema.concat(yup.object({
  vatNumber: requiredStringSchema('VAT number', 5),
  crNumber: requiredStringSchema('CR number', 5),
  termsConditions: requiredStringSchema('Terms and conditions', 50),
  privacyPolicy: requiredStringSchema('Privacy policy', 50),
  medicalLicense: requiredStringSchema('Medical license', 5),
  practicePermit: requiredStringSchema('Practice permit', 5),
  insurancePolicy: requiredStringSchema('Insurance policy', 5),
  hipaCompliance: requiredStringSchema('HIPAA compliance', 5),
  accreditationCertificates: yup.array().of(yup.string().min(5, 'Certificate must be at least 5 characters')).optional(),
  staffCredentials: yup.array().of(yup.string().min(5, 'Credential must be at least 5 characters')).optional(),
  malpracticeInsurance: requiredStringSchema('Malpractice insurance', 5)
}));

// Complete clinic form validation (for company/complex plan - legal is optional)
export const clinicFormSchema = yup.object({
  overview: clinicOverviewSchema,
  contact: clinicContactSchema,
  legal: clinicLegalSchema.optional(),
  workingHours: workingHoursSchema
});

// Clinic form validation for standalone clinic plan (legal is required)
export const clinicStandaloneFormSchema = yup.object({
  overview: clinicOverviewSchema,
  contact: clinicContactSchema,
  legal: clinicLegalRequiredSchema,
  workingHours: workingHoursSchema
});

// Step-specific validations for progressive form validation
export const clinicStepValidations = {
  overview: clinicOverviewSchema,
  contact: clinicContactSchema,
  legal: clinicLegalSchema,
  legalRequired: clinicLegalRequiredSchema,
  workingHours: workingHoursSchema
};

// Validation for clinic data transformation to API payload
export const clinicApiPayloadSchema = yup.object({
  name: requiredStringSchema('Clinic name'),
  phone: requiredStringSchema('Phone number'),
  email: yup.string().email('Invalid email').required('Email is required'),
  logoUrl: yup.string().url('Invalid logo URL').optional(),
  headDoctorName: requiredStringSchema('Head doctor name'),
  specialization: requiredStringSchema('Specialization'),
  capacity: yup.object({
    maxStaff: yup.number().min(1).required(),
    maxDoctors: yup.number().min(1).required(),
    maxPatients: yup.number().min(1).required(),
    sessionDuration: yup.number().min(15).max(240).required()
  }).required(),
  businessProfile: yup.object({
    yearEstablished: yup.number().required()
  }).required(),
  legalInfo: yup.object({
    vatNumber: yup.string().optional(),
    crNumber: yup.string().optional(),
    termsConditions: yup.string().optional(),
    privacyPolicy: yup.string().optional()
  }).optional()
});

// Enhanced service validation for clinic
export const clinicServiceSchema = serviceSchema.concat(yup.object({
  category: optionalStringSchema(2),
  prerequisites: yup.array().of(yup.string().min(5, 'Prerequisite must be at least 5 characters')).optional(),
  followUpRequired: yup.boolean().optional(),
  equipment: yup.array().of(yup.string().min(2, 'Equipment must be at least 2 characters')).optional(),
  staffRequired: yup.array().of(yup.string().min(2, 'Staff type must be at least 2 characters')).optional()
}));

// Specialization validation
export const specializationSchema = yup.object({
  name: requiredStringSchema('Specialization name'),
  description: requiredStringSchema('Specialization description', 20),
  commonServices: yup.array().of(yup.string().min(2, 'Service must be at least 2 characters')).optional(),
  requiredEquipment: yup.array().of(yup.string().min(2, 'Equipment must be at least 2 characters')).optional(),
  typicalSessionDuration: yup.number().min(15).max(240).optional()
});

// Helper function to validate clinic data at different steps
export const validateClinicStep = async (
  stepName: keyof typeof clinicStepValidations, 
  data: any, 
  isStandalone: boolean = false
) => {
  let schema = clinicStepValidations[stepName];
  
  // Use required legal schema for standalone clinic plans
  if (stepName === 'legal' && isStandalone) {
    schema = clinicStepValidations.legalRequired;
  }
  
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        isValid: false,
        errors: error.inner.map(err => ({
          field: err.path || '',
          message: err.message
        }))
      };
    }
    return {
      isValid: false,
      errors: [{ field: 'general', message: 'Validation failed' }]
    };
  }
};

// Validate clinic services with specialization compatibility
export const validateClinicServices = async (services: any[], specialization: string) => {
  try {
    // Validate each service
    await yup.array().of(clinicServiceSchema).validate(services, { abortEarly: false });
    
    // Check specialization compatibility (this would be enhanced with a database lookup)
    const isCompatible = services.length > 0; // Basic check
    
    // Additional validation logic based on specialization
    const warnings = [];
    if (specialization === 'Pediatrics' && services.some(s => s.name.toLowerCase().includes('surgery'))) {
      warnings.push('Surgery services may not be appropriate for pediatric clinics');
    }
    
    if (specialization === 'Dermatology' && services.some(s => s.durationMinutes && s.durationMinutes < 20)) {
      warnings.push('Dermatology consultations typically require at least 20 minutes');
    }
    
    return { 
      isValid: true, 
      errors: [],
      isCompatible,
      warnings
    };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        isValid: false,
        errors: error.inner.map(err => ({
          field: err.path || '',
          message: err.message
        })),
        isCompatible: false,
        warnings: []
      };
    }
    return {
      isValid: false,
      errors: [{ field: 'general', message: 'Services validation failed' }],
      isCompatible: false,
      warnings: []
    };
  }
};

// Validate clinic working hours with service duration compatibility
export const validateClinicWorkingHours = async (workingHours: any[], sessionDuration: number) => {
  try {
    await workingHoursSchema.validate(workingHours, { abortEarly: false });
    
    // Calculate total weekly hours
    const totalWeeklyHours = workingHours.reduce((total, day) => {
      if (!day.isWorkingDay) return total;
      
      const opening = new Date(`2000-01-01T${day.openingTime}:00`);
      const closing = new Date(`2000-01-01T${day.closingTime}:00`);
      const breakStart = day.breakStartTime ? new Date(`2000-01-01T${day.breakStartTime}:00`) : null;
      const breakEnd = day.breakEndTime ? new Date(`2000-01-01T${day.breakEndTime}:00`) : null;
      
      let dailyHours = (closing.getTime() - opening.getTime()) / (1000 * 60 * 60);
      
      if (breakStart && breakEnd) {
        const breakHours = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
        dailyHours -= breakHours;
      }
      
      return total + dailyHours;
    }, 0);
    
    // Check if session duration is compatible with working hours
    const hasCompatibleHours = workingHours.some(day => {
      if (!day.isWorkingDay) return false;
      
      const opening = new Date(`2000-01-01T${day.openingTime}:00`);
      const closing = new Date(`2000-01-01T${day.closingTime}:00`);
      const dailyMinutes = (closing.getTime() - opening.getTime()) / (1000 * 60);
      
      return dailyMinutes >= sessionDuration;
    });
    
    return { 
      isValid: true, 
      errors: [],
      totalWeeklyHours,
      hasCompatibleHours,
      recommendedDailySlots: Math.floor((totalWeeklyHours * 60) / (7 * sessionDuration))
    };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        isValid: false,
        errors: error.inner.map(err => ({
          field: err.path || '',
          message: err.message
        })),
        totalWeeklyHours: 0,
        hasCompatibleHours: false,
        recommendedDailySlots: 0
      };
    }
    return {
      isValid: false,
      errors: [{ field: 'general', message: 'Working hours validation failed' }],
      totalWeeklyHours: 0,
      hasCompatibleHours: false,
      recommendedDailySlots: 0
    };
  }
}; 