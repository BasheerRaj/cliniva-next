import * as yup from 'yup';
import {
  contactInfoSchema,
  socialMediaSchema,
  legalInfoSchema,
  fileUploadSchema,
  yearEstablishedSchema,
  requiredStringSchema,
  optionalStringSchema,
  optionalPositiveNumberSchema
} from './common';

// Company overview validation
export const companyOverviewSchema = yup.object({
  logo: fileUploadSchema.optional(),
  tradeName: requiredStringSchema('Trade name', 2),
  legalName: requiredStringSchema('Legal name', 2),
  yearEstablished: yearEstablishedSchema,
  overview: requiredStringSchema('Company overview', 50),
  vision: requiredStringSchema('Vision statement', 20),
  goals: requiredStringSchema('Goals and objectives', 20),
  ceoName: requiredStringSchema('CEO name', 2),
  employeeCount: optionalPositiveNumberSchema(),
  yearlyRevenue: optionalPositiveNumberSchema(),
  industry: optionalStringSchema(2)
});

// Company contact validation (extends base contact with social media)
export const companyContactSchema = contactInfoSchema.concat(socialMediaSchema).concat(yup.object({
  headquarters: optionalStringSchema(10),
  branches: yup.array().of(yup.string().min(5, 'Branch address must be at least 5 characters')).optional(),
  publicRelationsEmail: yup.string().email('Invalid PR email format').optional(),
  supportEmail: yup.string().email('Invalid support email format').optional(),
  billingEmail: yup.string().email('Invalid billing email format').optional()
}));

// Company legal validation (extends base legal info)
export const companyLegalSchema = legalInfoSchema.concat(yup.object({
  vatNumber: requiredStringSchema('VAT number', 5),
  crNumber: requiredStringSchema('CR number', 5),
  termsConditions: requiredStringSchema('Terms and conditions', 50),
  privacyPolicy: requiredStringSchema('Privacy policy', 50),
  businessLicense: optionalStringSchema(5),
  healthcareAccreditation: optionalStringSchema(5),
  insurancePolicy: optionalStringSchema(5),
  complianceCertifications: yup.array().of(yup.string().min(5, 'Certification must be at least 5 characters')).optional(),
  dataProtectionPolicy: optionalStringSchema(50)
}));

// Complete company form validation
export const companyFormSchema = yup.object({
  overview: companyOverviewSchema,
  contact: companyContactSchema,
  legal: companyLegalSchema
});

// Step-specific validations for progressive form validation
export const companyStepValidations = {
  overview: companyOverviewSchema,
  contact: companyContactSchema,
  legal: companyLegalSchema
};

// Validation for company data transformation
export const companyApiPayloadSchema = yup.object({
  name: requiredStringSchema('Company name'),
  legalName: requiredStringSchema('Legal name'),
  phone: requiredStringSchema('Phone number'),
  email: yup.string().email('Invalid email').required('Email is required'),
  address: requiredStringSchema('Address', 10),
  googleLocation: yup.object({
    lat: yup.number().required(),
    lng: yup.number().required()
  }).required(),
  logoUrl: yup.string().url('Invalid logo URL').optional(),
  website: yup.string().url('Invalid website URL').optional(),
  businessProfile: yup.object({
    yearEstablished: yup.number().required(),
    mission: yup.string().required(),
    vision: yup.string().required(),
    ceoName: yup.string().required()
  }).required(),
  legalInfo: yup.object({
    vatNumber: yup.string().required(),
    crNumber: yup.string().required(),
    termsConditions: yup.string().required(),
    privacyPolicy: yup.string().required()
  }).required()
});

// Helper function to validate company data at different steps
export const validateCompanyStep = async (stepName: keyof typeof companyStepValidations, data: any) => {
  const schema = companyStepValidations[stepName];
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