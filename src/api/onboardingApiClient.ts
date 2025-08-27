// ========================================
// CLINIVA ONBOARDING API CLIENT
// ========================================
// Integrates with cliniva-backend onboarding endpoints
// Authentication handled by axios interceptor

import apiClient from '@/lib/axios'
import {
  OrganizationOverviewDto,
  OrganizationContactDto,
  OrganizationLegalDto,
  ComplexOverviewDto,
  ComplexContactDto,
  ComplexLegalInfoDto,
  ComplexWorkingHoursDto,
  ClinicOverviewDto,
  ClinicContactDto,
  ClinicServicesCapacityDto,
  ClinicLegalInfoDto,
  ClinicWorkingHoursDto,
  StepSaveResponseDto,
  StepValidationResultDto,
  OnboardingProgressDto,
  CompleteOnboardingDto,
  ValidationResponse,
  ApiError
} from '@/types/onboarding'
import { Department } from '@/types/onboarding/common'

// ========================================
// ERROR HANDLING HELPER
// ========================================

const handleApiError = (error: any, context: string): never => {
  console.error(`❌ ${context} failed:`, error)

  // Handle network errors
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    throw {
      networkError: true,
      code: 'ERR_NETWORK',
      message: 'Cannot connect to backend server',
      error: 'Backend server is not available. Please start the server.',
      context
    } as ApiError
  }

  // Handle validation errors from backend
  if (error.response?.status === 400) {
    throw {
      validationError: true,
      status: 400,
      message: error.response.data?.message || 'Validation failed',
      errors: error.response.data?.errors || [],
      data: error.response.data,
      context
    } as ApiError
  }

  // Handle authentication errors
  if (error.response?.status === 401) {
    throw {
      authError: true,
      status: 401,
      message: 'Authentication failed',
      error: 'Please log in again',
      context
    } as ApiError
  }

  // Handle server errors
  if (error.response?.status >= 500) {
    throw {
      serverError: true,
      status: error.response.status,
      message: 'Server error occurred',
      error: error.response.statusText,
      context
    } as ApiError
  }

  // Handle backend success:false responses
  if (error.response?.data && !error.response.data.success) {
    throw {
      backendError: true,
      status: error.response.status || 400,
      message: error.response.data.message || 'Operation failed',
      error: error.response.data.error || 'Unknown error',
      canProceed: error.response.data.canProceed || false,
      context
    } as ApiError
  }

  // Re-throw original error if not handled
  throw error
}

// ========================================
// ORGANIZATION ENDPOINTS
// ========================================

export const saveOrganizationOverview = async (data: OrganizationOverviewDto): Promise<StepSaveResponseDto> => {
  console.log('🏢 Saving organization overview:', data)

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/organization/overview', data)

    // Check if backend returned an error response
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save organization overview')
    }

    console.log('✅ Organization overview saved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Save Organization Overview')
  }
}

export const saveOrganizationContact = async (data: OrganizationContactDto): Promise<StepSaveResponseDto> => {
  console.log('📞 Saving organization contact:', data)

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/organization/contact', data)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save organization contact')
    }

    console.log('✅ Organization contact saved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Save Organization Contact')
  }
}

export const saveOrganizationLegal = async (data: OrganizationLegalDto): Promise<StepSaveResponseDto> => {
  console.log('⚖️ Saving organization legal info:', data)

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/organization/legal', data)

    if (!response.data.success) {
      return {
        success: false,
        message: response.data.message || 'Failed to save organization legal info'
      }
    }

    console.log('✅ Organization legal info saved:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Save Organization Legal Info failed:', error)
    return {
      success: false,
      message: 'Failed to save organization legal info'
    }
  }
}

export const completeOrganizationSetup = async (): Promise<StepSaveResponseDto> => {
  console.log('🎯 Completing organization setup')

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/organization/complete')

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to complete organization setup')
    }

    console.log('✅ Organization setup completed:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Complete Organization Setup')
  }
}

// ========================================
// COMPLEX ENDPOINTS
// ========================================

export const saveComplexOverview = async (data: ComplexOverviewDto): Promise<StepSaveResponseDto> => {
  console.log('🏢 Saving complex overview:', data)

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/complex/overview', data)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save complex overview')
    }

    console.log('✅ Complex overview saved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Save Complex Overview')
  }
}

export const saveComplexContact = async (data: ComplexContactDto): Promise<StepSaveResponseDto> => {
  console.log('📞 Saving complex contact:', data)

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/complex/contact', data)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save complex contact')
    }

    console.log('✅ Complex contact saved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Save Complex Contact')
  }
}

export const saveComplexLegal = async (data: ComplexLegalInfoDto): Promise<StepSaveResponseDto> => {
  console.log('⚖️ Saving complex legal info:', data)

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/complex/legal', data)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save complex legal info')
    }

    console.log('✅ Complex legal info saved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Save Complex Legal Info')
  }
}

export const saveComplexSchedule = async (data: ComplexWorkingHoursDto[]): Promise<StepSaveResponseDto> => {
  console.log('📅 Saving complex schedule:', data)

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/complex/schedule', data)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save complex schedule')
    }

    console.log('✅ Complex schedule saved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Save Complex Schedule')
  }
}

export const completeComplexSetup = async (): Promise<StepSaveResponseDto> => {
  console.log('🎯 Completing complex setup')

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/complex/complete')

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to complete complex setup')
    }

    console.log('✅ Complex setup completed:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Complete Complex Setup')
  }
}

// ========================================
// CLINIC ENDPOINTS
// ========================================

export const saveClinicOverview = async (data: ClinicOverviewDto): Promise<StepSaveResponseDto> => {
  console.log('🏥 Saving clinic overview:', data)

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/clinic/overview', data)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save clinic overview')
    }

    console.log('✅ Clinic overview saved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Save Clinic Overview')
  }
}

export const saveClinicContact = async (data: ClinicContactDto): Promise<StepSaveResponseDto> => {
  console.log('📞 Saving clinic contact:', data)

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/clinic/contact', data)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save clinic contact')
    }

    console.log('✅ Clinic contact saved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Save Clinic Contact')
  }
}

export const saveClinicServicesCapacity = async (data: ClinicServicesCapacityDto): Promise<StepSaveResponseDto> => {
  console.log('🔧 Saving clinic services and capacity:', data)

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/clinic/services-capacity', data)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save clinic services and capacity')
    }

    console.log('✅ Clinic services and capacity saved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Save Clinic Services and Capacity')
  }
}

export const saveClinicLegal = async (data: ClinicLegalInfoDto): Promise<StepSaveResponseDto> => {
  console.log('⚖️ Saving clinic legal info:', data)

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/clinic/legal', data)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save clinic legal info')
    }

    console.log('✅ Clinic legal info saved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Save Clinic Legal Info')
  }
}

export const saveClinicSchedule = async (data: ClinicWorkingHoursDto[]): Promise<StepSaveResponseDto> => {
  console.log('📅 Saving clinic schedule:', data)

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/clinic/schedule', data)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save clinic schedule')
    }

    console.log('✅ Clinic schedule saved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Save Clinic Schedule')
  }
}

export const completeClinicSetup = async (): Promise<StepSaveResponseDto> => {
  console.log('🎯 Completing clinic setup')

  try {
    const response = await apiClient.post<StepSaveResponseDto>('/onboarding/clinic/complete')

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to complete clinic setup')
    }

    console.log('✅ Clinic setup completed:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Complete Clinic Setup')
  }
}

// ========================================
// PROGRESS & STATUS ENDPOINTS
// ========================================

export const getCurrentProgress = async (): Promise<StepSaveResponseDto> => {
  console.log('📊 Getting current onboarding progress')

  try {
    const response = await apiClient.get<StepSaveResponseDto>('/onboarding/progress')
    console.log('✅ Current progress retrieved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Get Current Progress')
  }
}

export const getOnboardingProgress = async (userId: string): Promise<OnboardingProgressDto> => {
  console.log('📊 Getting onboarding progress for user:', userId)

  try {
    const response = await apiClient.get<OnboardingProgressDto>(`/onboarding/progress/${userId}`)
    console.log('✅ Onboarding progress retrieved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Get Onboarding Progress')
  }
}

export const getOnboardingStatus = async (userId: string): Promise<any> => {
  console.log('📈 Getting onboarding status for user:', userId)

  try {
    const response = await apiClient.get(`/onboarding/status?userId=${userId}`)
    console.log('✅ Onboarding status retrieved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Get Onboarding Status')
  }
}

export const skipToDashboard = async (): Promise<StepSaveResponseDto> => {
  console.log('⏭️ Skipping to dashboard')

  try {
    const response = await apiClient.get<StepSaveResponseDto>('/onboarding/skip-to-dashboard')

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to skip to dashboard')
    }

    console.log('✅ Skipped to dashboard:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Skip to Dashboard')
  }
}

// ========================================
// VALIDATION ENDPOINTS
// ========================================

export const validateOnboardingData = async (data: any): Promise<StepValidationResultDto> => {
  console.log('🔍 Validating onboarding data:', data)

  try {
    const response = await apiClient.post<StepValidationResultDto>('/onboarding/validate', data)
    console.log('✅ Onboarding data validation result:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Validate Onboarding Data')
  }
}

export const validateOrganizationName = async (name: string): Promise<ValidationResponse> => {
  console.log('🔍 Validating organization name:', name)

  try {
    const response = await apiClient.post('/onboarding/validate-organization-name', { name })
    console.log('✅ Organization name validation result:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Validate Organization Name')
  }
}

export const validateComplexName = async (name: string, organizationId?: string): Promise<ValidationResponse> => {
  console.log('🔍 Validating complex name:', name)

  try {
    const response = await apiClient.post('/onboarding/validate-complex-name', { name, organizationId })
    console.log('✅ Complex name validation result:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Validate Complex Name')
  }
}

export const validateClinicName = async (name: string, complexId?: string, organizationId?: string): Promise<ValidationResponse> => {
  console.log('🔍 Validating clinic name:', name)

  try {
    const response = await apiClient.post('/onboarding/validate-clinic-name', { name, complexId, organizationId })
    console.log('✅ Clinic name validation result:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Validate Clinic Name')
  }
}

export const validateEmail = async (email: string): Promise<ValidationResponse> => {
  console.log('🔍 Validating email:', email)

  try {
    const response = await apiClient.post('/onboarding/validate-email', { email })
    console.log('✅ Email validation result:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Validate Email')
  }
}

export const validateVatNumber = async (vatNumber: string): Promise<ValidationResponse> => {
  console.log('🔍 Validating VAT number:', vatNumber)

  try {
    const response = await apiClient.post('/onboarding/validate-vat', { vatNumber })
    console.log('✅ VAT number validation result:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Validate VAT Number')
  }
}

export const validateCrNumber = async (crNumber: string): Promise<ValidationResponse> => {
  console.log('🔍 Validating CR number:', crNumber)

  try {
    const response = await apiClient.post('/onboarding/validate-cr', { crNumber })
    console.log('✅ CR number validation result:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Validate CR Number')
  }
}

// ========================================
// UTILITY ENDPOINTS
// ========================================

export const getAvailablePlans = async (): Promise<any> => {
  console.log('📋 Getting available plans')

  try {
    const response = await apiClient.get('/onboarding/plans')
    console.log('✅ Available plans retrieved:', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Get Available Plans')
  }
}

// ========================================
// LEGACY ENDPOINT
// ========================================

export const completeOnboarding = async (data: CompleteOnboardingDto): Promise<any> => {
  console.log('🎉 Completing onboarding (legacy):', data)

  try {
    const response = await apiClient.post('/onboarding/complete', data)

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to complete onboarding')
    }

    console.log('✅ Onboarding completed (legacy):', response.data)
    return response.data
  } catch (error) {
    return handleApiError(error, 'Complete Onboarding (Legacy)')
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

export const handleOnboardingError = (error: ApiError): string => {
  if (error.networkError) {
    return 'Cannot connect to server. Please check your connection and try again.'
  }

  if (error.validationError) {
    return error.message || 'Please check your input and try again.'
  }

  if (error.authError) {
    return 'Your session has expired. Please log in again.'
  }

  if (error.serverError) {
    return 'Server error occurred. Please try again later.'
  }

  return error.message || 'An unexpected error occurred. Please try again.'
}

export const canProceedWithError = (error: ApiError): boolean => {
  return error.canProceed === true
}

// Working Hours Validation
export const getComplexWorkingHours = async (complexId: string): Promise<any> => {
  console.log('📅 Getting complex working hours for:', complexId)
  try {
    const response = await apiClient.get(`/working-hours/complex/${complexId}`)
    return response.data
  } catch (error) {
    console.error('❌ Failed to get complex working hours:', error)
    throw error
  }
}

// Department endpoints
export const fetchDepartments = async (): Promise<Department[]> => {
  console.log('📋 Fetching departments')
  try {
    const response = await apiClient.get<Department[]>('/departments')
    return response.data
  } catch (error) {
    console.error('❌ Fetch departments failed:', error)
    throw error
  }
}