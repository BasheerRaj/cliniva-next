import * as yup from 'yup';
import {
  contactInfoSchema,
  legalInfoSchema,
  fileUploadSchema,
  yearEstablishedSchema,
  requiredStringSchema,
  optionalStringSchema,
  optionalPositiveNumberSchema,
  workingHoursSchema,
  departmentSchema
} from './common';

// Complex overview validation
export const complexOverviewSchema = yup.object({
  logo: fileUploadSchema.optional(),
  name: requiredStringSchema('Complex name', 2),
  yearEstablished: yearEstablishedSchema,
  managerName: requiredStringSchema('Manager name', 2),
  description: optionalStringSchema(20),
  departments: yup.array()
    .of(departmentSchema)
    .min(1, 'At least one department is required')
    .required('Departments are required'),
  totalArea: optionalPositiveNumberSchema(),
  parkingSpaces: optionalPositiveNumberSchema(),
  emergencyServices: yup.boolean().optional(),
  laboratoryServices: yup.boolean().optional(),
  pharmacyServices: yup.boolean().optional()
});

// Complex contact validation (extends base contact info)
export const complexContactSchema = contactInfoSchema.concat(yup.object({
  receptionPhone: yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid reception phone number')
    .optional(),
  emergencyPhone: yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid emergency phone number')
    .optional(),
  administrativeEmail: yup.string().email('Invalid administrative email format').optional(),
  maintenanceEmail: yup.string().email('Invalid maintenance email format').optional(),
  securityPhone: yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid security phone number')
    .optional()
}));

// Complex legal validation (extends base legal info)
export const complexLegalSchema = legalInfoSchema.concat(yup.object({
  buildingPermits: optionalStringSchema(5),
  healthDepartmentLicense: optionalStringSchema(5),
  fireAndSafetyCompliance: optionalStringSchema(5),
  environmentalClearance: optionalStringSchema(5),
  accessibilityCompliance: optionalStringSchema(5)
}));

// For complex plan (standalone), legal info is required
export const complexLegalRequiredSchema = legalInfoSchema.concat(yup.object({
  vatNumber: requiredStringSchema('VAT number', 5),
  crNumber: requiredStringSchema('CR number', 5),
  termsConditions: requiredStringSchema('Terms and conditions', 50),
  privacyPolicy: requiredStringSchema('Privacy policy', 50),
  buildingPermits: requiredStringSchema('Building permits', 5),
  healthDepartmentLicense: requiredStringSchema('Health department license', 5),
  fireAndSafetyCompliance: requiredStringSchema('Fire and safety compliance', 5),
  environmentalClearance: optionalStringSchema(5),
  accessibilityCompliance: optionalStringSchema(5)
}));

// Complete complex form validation (for company plan - legal is optional)
export const complexFormSchema = yup.object({
  overview: complexOverviewSchema,
  contact: complexContactSchema,
  legal: complexLegalSchema.optional(),
  workingHours: workingHoursSchema
});

// Complex form validation for standalone complex plan (legal is required)
export const complexStandaloneFormSchema = yup.object({
  overview: complexOverviewSchema,
  contact: complexContactSchema,
  legal: complexLegalRequiredSchema,
  workingHours: workingHoursSchema
});

// Step-specific validations for progressive form validation
export const complexStepValidations = {
  overview: complexOverviewSchema,
  contact: complexContactSchema,
  legal: complexLegalSchema,
  legalRequired: complexLegalRequiredSchema,
  workingHours: workingHoursSchema
};

// Validation for complex data transformation to API payload
export const complexApiPayloadSchema = yup.object({
  name: requiredStringSchema('Complex name'),
  address: requiredStringSchema('Address', 10),
  googleLocation: yup.object({
    lat: yup.number().required(),
    lng: yup.number().required()
  }).required(),
  phone: requiredStringSchema('Phone number'),
  email: yup.string().email('Invalid email').required('Email is required'),
  logoUrl: yup.string().url('Invalid logo URL').optional(),
  managerName: requiredStringSchema('Manager name'),
  businessProfile: yup.object({
    yearEstablished: yup.number().required(),
    mission: yup.string().optional()
  }).required(),
  legalInfo: yup.object({
    vatNumber: yup.string().optional(),
    crNumber: yup.string().optional(),
    termsConditions: yup.string().optional(),
    privacyPolicy: yup.string().optional()
  }).optional()
});

// Department with services validation
export const departmentWithServicesSchema = departmentSchema.concat(yup.object({
  services: yup.array().of(yup.object({
    name: requiredStringSchema('Service name'),
    description: optionalStringSchema(10),
    durationMinutes: yup.number().min(5).max(480).optional(),
    price: yup.number().min(0).optional()
  })).optional(),
  head: optionalStringSchema(2),
  staffCount: optionalPositiveNumberSchema(),
  budget: optionalPositiveNumberSchema()
}));

// Helper function to validate complex data at different steps
export const validateComplexStep = async (
  stepName: keyof typeof complexStepValidations, 
  data: any, 
  isStandalone: boolean = false
) => {
  let schema = complexStepValidations[stepName];
  
  // Use required legal schema for standalone complex plans
  if (stepName === 'legal' && isStandalone) {
    schema = complexStepValidations.legalRequired;
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

// Validate working hours specifically for complex
export const validateComplexWorkingHours = async (workingHours: any[]) => {
  try {
    await workingHoursSchema.validate(workingHours, { abortEarly: false });
    
    // Additional complex-specific validation
    const hasWeekendHours = workingHours.some(day => 
      (day.dayOfWeek === 'saturday' || day.dayOfWeek === 'sunday') && day.isWorkingDay
    );
    
    const hasEmergencyHours = workingHours.some(day => 
      day.isWorkingDay && (
        day.openingTime <= '06:00' || 
        day.closingTime >= '22:00'
      )
    );
    
    return { 
      isValid: true, 
      errors: [],
      hasWeekendHours,
      hasEmergencyHours
    };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        isValid: false,
        errors: error.inner.map(err => ({
          field: err.path || '',
          message: err.message
        })),
        hasWeekendHours: false,
        hasEmergencyHours: false
      };
    }
    return {
      isValid: false,
      errors: [{ field: 'general', message: 'Working hours validation failed' }],
      hasWeekendHours: false,
      hasEmergencyHours: false
    };
  }
}; 