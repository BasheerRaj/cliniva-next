import { z } from 'zod';

// ========================================
// COMMON VALIDATION SCHEMAS
// ========================================

const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
const urlSchema = z.string().url().optional().or(z.literal(''));

export const socialMediaLinksSchema = z.object({
  facebook: urlSchema,
  instagram: urlSchema,
  twitter: urlSchema,
  linkedin: urlSchema,
  whatsapp: urlSchema,
}).optional();

export const workingHoursSchema = z.object({
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  isWorkingDay: z.boolean(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
});

export const contactSchema = z.object({
  contactType: z.string().min(1, 'Contact type is required'),
  contactValue: z.string().min(1, 'Contact value is required'),
  isActive: z.boolean().optional().default(true),
});

// ========================================
// ORGANIZATION/COMPANY SCHEMAS
// ========================================

export const organizationOverviewSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  legalName: z.string().optional(),
  yearEstablished: z.number().min(1800).max(new Date().getFullYear()).optional(),
  overview: z.string().optional(),
  goals: z.string().optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
  ceoName: z.string().optional(),
  logoUrl: urlSchema,
  registrationNumber: z.string().optional(),
});

export const organizationContactSchema = z.object({
  address: z.string().optional(),
  googleLocation: z.string().optional(),
  phone: z.string().regex(phoneRegex, 'Please enter a valid phone number').optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  website: urlSchema,
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().regex(phoneRegex, 'Please enter a valid emergency contact phone').optional().or(z.literal('')),
  socialMediaLinks: socialMediaLinksSchema,
});

export const organizationLegalSchema = z.object({
  vatNumber: z.string().optional(),
  crNumber: z.string().optional(),
  termsConditionsUrl: urlSchema,
  privacyPolicyUrl: urlSchema,
});

export const organizationStepSchema = z.object({
  overview: organizationOverviewSchema,
  contact: organizationContactSchema.optional(),
  legal: organizationLegalSchema.optional(),
  skipToNext: z.boolean().optional(),
  completeSetup: z.boolean().optional(),
});

// ========================================
// TYPE EXPORTS
// ========================================

export type OrganizationOverview = z.infer<typeof organizationOverviewSchema>;
export type OrganizationContact = z.infer<typeof organizationContactSchema>;
export type OrganizationLegal = z.infer<typeof organizationLegalSchema>;
export type OrganizationStep = z.infer<typeof organizationStepSchema>;