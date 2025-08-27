/**
 * Data inheritance utilities for Company -> Complex -> Clinic flow
 * Maps organization data to complex/clinic initial data with proper field transformations
 */

export interface OrganizationData {
  overview?: {
    name?: string;
    legalName?: string;
    ceoName?: string;
    yearEstablished?: number;
    overview?: string;
    goals?: string;
    vision?: string;
    mission?: string;
    logoUrl?: string;
    registrationNumber?: string;
    website?: string;
  };
  contact?: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    googleLocation?: string;
    phone?: string;
    email?: string;
    website?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    phoneNumbers?: Array<{number: string; type: string}>;
    socialMediaLinks?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      whatsapp?: string;
    };
  };
  legal?: {
    vatNumber?: string;
    crNumber?: string;
    termsConditionsUrl?: string;
    privacyPolicyUrl?: string;
  };
}

export interface ComplexData {
  overview?: {
    name?: string;
    legalName?: string;
    managerName?: string;
    yearEstablished?: number;
    overview?: string;
    goals?: string;
    vision?: string;
    mission?: string;
    logoUrl?: string;
  };
  contact?: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    googleLocation?: string;
    phone?: string;
    email?: string;
    website?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    phoneNumbers?: Array<{number: string; type: string}>;
    socialMediaLinks?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      whatsapp?: string;
    };
  };
  legal?: {
    vatNumber?: string;
    crNumber?: string;
    termsConditionsUrl?: string;
    privacyPolicyUrl?: string;
  };
  workingHours?: Array<{
    dayOfWeek: string;
    isWorkingDay: boolean;
    openingTime?: string;
    closingTime?: string;
    breakStartTime?: string;
    breakEndTime?: string;
  }>;
}

export interface ComplexInheritedData {
  // Overview fields
  name?: string;
  legalName?: string;
  managerName?: string;
  yearEstablished?: number;
  overview?: string;
  goals?: string;
  vision?: string;
  mission?: string;
  logoUrl?: string;
  
  // Contact fields
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  googleLocation?: string;
  phone?: string;
  email?: string;
  website?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  phoneNumbers?: Array<{number: string; type: string}>;
  socialMediaLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    whatsapp?: string;
  };
  
  // Legal fields
  vatNumber?: string;
  crNumber?: string;
  termsConditionsUrl?: string;
  privacyPolicyUrl?: string;
  
  // Inheritance flag
  inheritsFromOrganization?: boolean;
}

export interface ClinicInheritedData {
  // Overview fields  
  name?: string;
  legalName?: string;
  headDoctorName?: string;
  specialization?: string;
  licenseNumber?: string;
  pin?: string;
  logoUrl?: string;
  website?: string;
  complexDepartmentId?: string;
  
  // Business profile
  businessProfile?: {
    yearEstablished?: number;
    mission?: string;
    vision?: string;
    goals?: string;
  };
  
  // Contact fields
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  googleLocation?: string;
  phone?: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  phoneNumbers?: Array<{number: string; type: string}>;
  socialMediaLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    whatsapp?: string;
  };
  
  // Legal fields
  vatNumber?: string;
  crNumber?: string;
  termsConditionsUrl?: string;
  privacyPolicyUrl?: string;
  
  // Services and capacity (optional - will be empty for inheritance)
  services?: any[];
  capacity?: {
    maxStaff?: number;
    maxDoctors?: number;
    maxPatients?: number;
    sessionDuration?: number;
  };
  
  // Working hours inheritance info
  parentWorkingHours?: Array<{
    dayOfWeek: string;
    isWorkingDay: boolean;
    openingTime?: string;
    closingTime?: string;
    breakStartTime?: string;
    breakEndTime?: string;
  }>;
  
  // Inheritance flags
  inheritsFromComplex?: boolean;
  inheritsFromOrganization?: boolean;
}

/**
 * Maps organization data to complex initial data
 * @param orgData - The organization/company data from step 1
 * @returns Mapped complex initial data
 */
export function mapOrganizationToComplexData(orgData: OrganizationData): ComplexInheritedData {
  const inheritedData: ComplexInheritedData = {
    // Set inheritance flag
    inheritsFromOrganization: true,
    
    // Map overview fields
    name: orgData.overview?.name || "",
    legalName: orgData.overview?.legalName || "",
    managerName: orgData.overview?.ceoName || "", // CEO becomes manager
    yearEstablished: orgData.overview?.yearEstablished,
    overview: orgData.overview?.overview || "",
    goals: orgData.overview?.goals || "",
    vision: orgData.overview?.vision || "",
    mission: orgData.overview?.mission || "",
    logoUrl: orgData.overview?.logoUrl || "",
    
    // Map contact fields
    address: orgData.contact?.address || "",
    city: orgData.contact?.city || "",
    state: orgData.contact?.state || "",
    postalCode: orgData.contact?.postalCode || "",
    country: orgData.contact?.country || "",
    googleLocation: orgData.contact?.googleLocation || "",
    phone: orgData.contact?.phone || "",
    email: orgData.contact?.email || "",
    website: orgData.overview?.website || "",
    emergencyContactName: orgData.contact?.emergencyContactName || "",
    emergencyContactPhone: orgData.contact?.emergencyContactPhone || "",
    phoneNumbers: orgData.contact?.phoneNumbers || [],
    socialMediaLinks: {
      facebook: orgData.contact?.socialMediaLinks?.facebook || "",
      instagram: orgData.contact?.socialMediaLinks?.instagram || "",
      twitter: orgData.contact?.socialMediaLinks?.twitter || "",
      linkedin: orgData.contact?.socialMediaLinks?.linkedin || "",
      whatsapp: orgData.contact?.socialMediaLinks?.whatsapp || "",
    },
    
    // Map legal fields
    vatNumber: orgData.legal?.vatNumber || "",
    crNumber: orgData.legal?.crNumber || "",
    termsConditionsUrl: orgData.legal?.termsConditionsUrl || "",
    privacyPolicyUrl: orgData.legal?.privacyPolicyUrl || "",
  };

  return inheritedData;
}

/**
 * Maps complex data to clinic initial data
 * @param complexData - The complex data from previous steps
 * @returns Mapped clinic initial data
 */
export function mapComplexToClinicData(complexData: ComplexData): ClinicInheritedData {
  const inheritedData: ClinicInheritedData = {
    // Set inheritance flag
    inheritsFromComplex: true,
    
    // Map overview fields (empty name - clinic needs unique name)
    name: "", // Clinic must have unique name
    legalName: complexData.overview?.legalName || "",
    headDoctorName: complexData.overview?.managerName || "", // Manager becomes head doctor
    logoUrl: complexData.overview?.logoUrl || "",
    website: "", // Clinic needs its own website
    
    // Map business profile
    businessProfile: {
      yearEstablished: complexData.overview?.yearEstablished,
      mission: complexData.overview?.mission || "",
      vision: complexData.overview?.vision || "",
      goals: complexData.overview?.goals || "",
    },
    
    // Map contact fields
    address: complexData.contact?.address || "",
    city: complexData.contact?.city || "",
    state: complexData.contact?.state || "",
    postalCode: complexData.contact?.postalCode || "",
    country: complexData.contact?.country || "",
    googleLocation: complexData.contact?.googleLocation || "",
    phone: complexData.contact?.phone || "",
    email: "", // Clinic needs unique email
    emergencyContactName: complexData.contact?.emergencyContactName || "",
    emergencyContactPhone: complexData.contact?.emergencyContactPhone || "",
    phoneNumbers: complexData.contact?.phoneNumbers || [],
    socialMediaLinks: {
      facebook: complexData.contact?.socialMediaLinks?.facebook || "",
      instagram: complexData.contact?.socialMediaLinks?.instagram || "",
      twitter: complexData.contact?.socialMediaLinks?.twitter || "",
      linkedin: complexData.contact?.socialMediaLinks?.linkedin || "",
      whatsapp: complexData.contact?.socialMediaLinks?.whatsapp || "",
    },
    
    // Map legal fields
    vatNumber: complexData.legal?.vatNumber || "",
    crNumber: complexData.legal?.crNumber || "",
    termsConditionsUrl: complexData.legal?.termsConditionsUrl || "",
    privacyPolicyUrl: complexData.legal?.privacyPolicyUrl || "",
    
    // Initialize empty services and capacity (clinic-specific)
    services: [],
    capacity: {
      maxStaff: undefined,
      maxDoctors: undefined,
      maxPatients: undefined,
      sessionDuration: 30, // Default session duration
    },
    
    // Pass parent working hours for validation
    parentWorkingHours: complexData.workingHours || [],
  };

  return inheritedData;
}

/**
 * Maps organization data directly to clinic data (for company -> clinic flow)
 * @param orgData - The organization/company data
 * @returns Mapped clinic initial data
 */
export function mapOrganizationToClinicData(orgData: OrganizationData): ClinicInheritedData {
  const inheritedData: ClinicInheritedData = {
    // Set inheritance flags
    inheritsFromOrganization: true,
    inheritsFromComplex: false,
    
    // Map overview fields (empty name - clinic needs unique name)
    name: "", // Clinic must have unique name
    legalName: orgData.overview?.legalName || "",
    headDoctorName: orgData.overview?.ceoName || "", // CEO becomes head doctor
    logoUrl: orgData.overview?.logoUrl || "",
    website: "", // Clinic needs its own website
    
    // Map business profile
    businessProfile: {
      yearEstablished: orgData.overview?.yearEstablished,
      mission: orgData.overview?.mission || "",
      vision: orgData.overview?.vision || "",
      goals: orgData.overview?.goals || "",
    },
    
    // Map contact fields
    address: orgData.contact?.address || "",
    city: orgData.contact?.city || "",
    state: orgData.contact?.state || "",
    postalCode: orgData.contact?.postalCode || "",
    country: orgData.contact?.country || "",
    googleLocation: orgData.contact?.googleLocation || "",
    phone: orgData.contact?.phone || "",
    email: "", // Clinic needs unique email
    emergencyContactName: orgData.contact?.emergencyContactName || "",
    emergencyContactPhone: orgData.contact?.emergencyContactPhone || "",
    phoneNumbers: orgData.contact?.phoneNumbers || [],
    socialMediaLinks: {
      facebook: orgData.contact?.socialMediaLinks?.facebook || "",
      instagram: orgData.contact?.socialMediaLinks?.instagram || "",
      twitter: orgData.contact?.socialMediaLinks?.twitter || "",
      linkedin: orgData.contact?.socialMediaLinks?.linkedin || "",
      whatsapp: orgData.contact?.socialMediaLinks?.whatsapp || "",
    },
    
    // Map legal fields
    vatNumber: orgData.legal?.vatNumber || "",
    crNumber: orgData.legal?.crNumber || "",
    termsConditionsUrl: orgData.legal?.termsConditionsUrl || "",
    privacyPolicyUrl: orgData.legal?.privacyPolicyUrl || "",
    
    // Initialize empty services and capacity (clinic-specific)
    services: [],
    capacity: {
      maxStaff: undefined,
      maxDoctors: undefined,
      maxPatients: undefined,
      sessionDuration: 30, // Default session duration
    },
    
    // No parent working hours constraints for company -> clinic
    parentWorkingHours: [],
  };

  return inheritedData;
}

/**
 * Determines if department selection should be shown based on plan type
 * @param planType - The current plan type
 * @returns Boolean indicating if department selection is needed
 */
export function shouldShowDepartmentSelection(planType: 'company' | 'complex' | 'clinic'): boolean {
  switch (planType) {
    case 'company':
      return false; // Company creates its own departments
    case 'complex':
      return false; // Complex can create departments, but clinic links to them later
    case 'clinic':
      return true; // Clinic needs to select department if part of complex
    default:
      return false;
  }
}

/**
 * Determines if working hours should be constrained by parent entity
 * @param planType - The current plan type
 * @param hasParentHours - Whether parent working hours exist
 * @returns Boolean indicating if hours should be constrained
 */
export function shouldConstrainWorkingHours(
  planType: 'company' | 'complex' | 'clinic', 
  hasParentHours: boolean
): boolean {
  // Clinics created under a company or complex must adhere to their parent entity working hours
  if ((planType === 'company' || planType === 'complex') && hasParentHours) {
    return true;
  }

  // Stand-alone clinic plans have no parent hour constraints
  return false;
}

/**
 * Validates clinic working hours against parent constraints
 * @param clinicHours - Proposed clinic working hours
 * @param parentHours - Parent entity working hours
 * @returns Validation result with errors if any
 */
export function validateWorkingHoursConstraints(
  clinicHours: Array<{dayOfWeek: string; isWorkingDay: boolean; openingTime?: string; closingTime?: string}>,
  parentHours: Array<{dayOfWeek: string; isWorkingDay: boolean; openingTime?: string; closingTime?: string}>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const clinicDay of clinicHours) {
    if (!clinicDay.isWorkingDay) continue;
    
    const parentDay = parentHours.find(p => p.dayOfWeek === clinicDay.dayOfWeek);
    
    if (!parentDay || !parentDay.isWorkingDay) {
      errors.push(`Cannot work on ${clinicDay.dayOfWeek} - parent entity is closed on this day`);
      continue;
    }
    
    if (!clinicDay.openingTime || !clinicDay.closingTime || !parentDay.openingTime || !parentDay.closingTime) {
      continue; // Skip validation if times are not set
    }
    
    if (clinicDay.openingTime < parentDay.openingTime) {
      errors.push(`${clinicDay.dayOfWeek}: Opening time cannot be before ${parentDay.openingTime}`);
    }
    
    if (clinicDay.closingTime > parentDay.closingTime) {
      errors.push(`${clinicDay.dayOfWeek}: Closing time cannot be after ${parentDay.closingTime}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets the appropriate inheritance data based on plan type and available data
 * @param planType - Current plan type
 * @param stepData - All form step data
 * @param currentEntityStep - Current step within the entity
 * @returns Inheritance data for the current form
 */
export function getInheritanceDataForStep(
  planType: 'company' | 'complex' | 'clinic',
  stepData: Record<string, any>,
  currentEntityStep: string
): any {
  // For clinic plan - no inheritance, start with empty values
  if (planType === 'clinic') {
    return {};
  }
  
  // For company plan
  if (planType === 'company') {
    if (currentEntityStep.startsWith('2-')) {
      // Complex step - inherit from company
      const companyData = {
        overview: stepData['1-overview'] || {},
        contact: stepData['1-contact'] || {},
        legal: stepData['1-legal'] || {}
      };
      return mapOrganizationToComplexData(companyData);
    }
    
    if (currentEntityStep.startsWith('3-')) {
      // Clinic step - inherit from complex
      const complexData = {
        overview: stepData['2-overview'] || {},
        contact: stepData['2-contact'] || {},
        legal: stepData['2-legal'] || {},
        workingHours: stepData['2-schedule'] || []
      };
      return mapComplexToClinicData(complexData);
    }
  }
  
  // For complex plan  
  if (planType === 'complex') {
    if (currentEntityStep.startsWith('2-')) {
      // Clinic step - inherit from complex
      const complexData = {
        overview: stepData['1-overview'] || {},
        contact: stepData['1-contact'] || {},
        legal: stepData['1-legal'] || {},
        workingHours: stepData['1-schedule'] || []
      };
      return mapComplexToClinicData(complexData);
    }
  }
  
  return {};
} 