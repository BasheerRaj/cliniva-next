import * as yup from 'yup';

// Common validation patterns
export const phoneNumberRegex = /^[\+]?[1-9][\d]{0,15}$/;
export const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

// Location validation
export const locationCoordsSchema = yup.object({
  lat: yup.number()
    .required('Latitude is required')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: yup.number()
    .required('Longitude is required')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  shareableLink: yup.string().url('Invalid URL format').optional()
});

// Contact information validation
export const contactInfoSchema = yup.object({
  phoneNumbers: yup.array()
    .of(yup.string().matches(phoneNumberRegex, 'Invalid phone number format'))
    .min(1, 'At least one phone number is required')
    .required('Phone numbers are required'),
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  website: yup.string()
    .matches(urlRegex, 'Invalid website URL')
    .optional(),
  address: yup.string()
    .min(10, 'Address must be at least 10 characters')
    .required('Address is required'),
  googleLocation: locationCoordsSchema
    .required('Location is required'),
  emergencyContactName: yup.string()
    .min(2, 'Emergency contact name must be at least 2 characters')
    .optional(),
  emergencyContactPhone: yup.string()
    .matches(phoneNumberRegex, 'Invalid emergency contact phone number')
    .optional()
});

// Social media validation
export const socialMediaSchema = yup.object({
  facebook: yup.string().url('Invalid Facebook URL').optional(),
  twitter: yup.string().url('Invalid Twitter URL').optional(),
  instagram: yup.string().url('Invalid Instagram URL').optional(),
  linkedin: yup.string().url('Invalid LinkedIn URL').optional()
});

// Legal information validation
export const legalInfoSchema = yup.object({
  vatNumber: yup.string()
    .min(5, 'VAT number must be at least 5 characters')
    .optional(),
  crNumber: yup.string()
    .min(5, 'CR number must be at least 5 characters')
    .optional(),
  termsConditions: yup.string()
    .min(50, 'Terms and conditions must be at least 50 characters')
    .optional(),
  privacyPolicy: yup.string()
    .min(50, 'Privacy policy must be at least 50 characters')
    .optional()
});

// Working day validation
export const workingDaySchema = yup.object({
  dayOfWeek: yup.string()
    .oneOf(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .required('Day of week is required'),
  isWorkingDay: yup.boolean()
    .required('Working day status is required'),
  openingTime: yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .when('isWorkingDay', {
      is: true,
      then: (schema) => schema.required('Opening time is required for working days'),
      otherwise: (schema) => schema.nullable()
    }),
  closingTime: yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .when('isWorkingDay', {
      is: true,
      then: (schema) => schema.required('Closing time is required for working days'),
      otherwise: (schema) => schema.nullable()
    }),
  breakStartTime: yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .optional(),
  breakEndTime: yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .optional()
});

// Working hours validation (array of working days)
export const workingHoursSchema = yup.array()
  .of(workingDaySchema)
  .length(7, 'Must include all 7 days of the week')
  .test('at-least-one-working-day', 'At least one working day is required', (value) => {
    return value?.some(day => day.isWorkingDay) || false;
  });

// Department validation
export const departmentSchema = yup.object({
  name: yup.string()
    .min(2, 'Department name must be at least 2 characters')
    .required('Department name is required'),
  description: yup.string()
    .min(10, 'Department description must be at least 10 characters')
    .optional()
});

// Service validation
export const serviceSchema = yup.object({
  name: yup.string()
    .min(2, 'Service name must be at least 2 characters')
    .required('Service name is required'),
  description: yup.string()
    .min(10, 'Service description must be at least 10 characters')
    .optional(),
  durationMinutes: yup.number()
    .min(5, 'Duration must be at least 5 minutes')
    .max(480, 'Duration cannot exceed 8 hours')
    .optional(),
  price: yup.number()
    .min(0, 'Price cannot be negative')
    .optional()
});

// File upload validation
export const fileUploadSchema = yup.mixed()
  .test('fileSize', 'File size must be less than 5MB', (value) => {
    if (!value) return true; // Allow empty files
    if (value instanceof File) {
      return value.size <= 5 * 1024 * 1024; // 5MB
    }
    return true;
  })
  .test('fileType', 'Only image files are allowed', (value) => {
    if (!value) return true; // Allow empty files
    if (value instanceof File) {
      return Boolean(value.type && value.type.startsWith('image/'));
    }
    return true;
  });

// Year validation
export const yearEstablishedSchema = yup.number()
  .min(1800, 'Year must be after 1800')
  .max(new Date().getFullYear(), `Year cannot be in the future`)
  .required('Year established is required');

// Common text field validations
export const requiredStringSchema = (fieldName: string, minLength: number = 2) =>
  yup.string()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .required(`${fieldName} is required`);

export const optionalStringSchema = (minLength: number = 2) =>
  yup.string()
    .min(minLength, `Must be at least ${minLength} characters if provided`)
    .optional();

// Number validations
export const positiveNumberSchema = (fieldName: string) =>
  yup.number()
    .min(1, `${fieldName} must be at least 1`)
    .required(`${fieldName} is required`);

export const optionalPositiveNumberSchema = () =>
  yup.number()
    .min(0, 'Value cannot be negative')
    .optional(); 