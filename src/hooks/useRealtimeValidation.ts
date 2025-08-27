// ========================================
// REAL-TIME VALIDATION HOOK
// ========================================
// Validates form fields against backend endpoints with debouncing

import { useState, useCallback, useRef } from 'react'
import { debounce } from 'lodash'
import { 
  validateOrganizationName,
  validateComplexName,
  validateClinicName
} from '@/api/onboardingApiClient'

export interface ValidationResult {
  isValid: boolean
  isValidating: boolean
  error?: string
  message?: string
}

interface ValidationOptions {
  delay?: number // Debounce delay in milliseconds
  validateOnEmpty?: boolean // Whether to validate empty values
}

export const useRealtimeValidation = (options: ValidationOptions = {}) => {
  const { delay = 1000, validateOnEmpty = false } = options
  const [validationStates, setValidationStates] = useState<Record<string, ValidationResult>>({})
  const validationInProgress = useRef<Set<string>>(new Set())

  // Generic validation function
  const validateField = useCallback(
    debounce(async (
      fieldKey: string, 
      value: string, 
      validatorFn: (value: string, ...args: any[]) => Promise<any>,
      ...args: any[]
    ) => {
      // Skip validation for empty values unless explicitly enabled
      if (!value.trim() && !validateOnEmpty) {
        setValidationStates(prev => ({
          ...prev,
          [fieldKey]: { isValid: true, isValidating: false }
        }))
        return
      }

      // Skip if validation already in progress for this field
      if (validationInProgress.current.has(fieldKey)) {
        return
      }

      try {
        validationInProgress.current.add(fieldKey)
        
        // Set validating state
        setValidationStates(prev => ({
          ...prev,
          [fieldKey]: { isValid: false, isValidating: true }
        }))

        console.log(`🔍 Validating ${fieldKey}:`, value)
        const result = await validatorFn(value, ...args)
        
        // Check if result has error information (network errors, etc.)
        if (result && typeof result === 'object' && 'networkError' in result && result.networkError) {
          setValidationStates(prev => ({
            ...prev,
            [fieldKey]: {
              isValid: false,
              isValidating: false,
              error: result.error || 'Backend server is not available. Please start the server or check your connection.',
              message: '🔌 Connection failed - Backend server required'
            }
          }))
          return
        }
        
        // Check if result has specific error information
        if (result && typeof result === 'object' && 'error' in result && result.error) {
          setValidationStates(prev => ({
            ...prev,
            [fieldKey]: {
              isValid: false,
              isValidating: false,
              error: result.error as string,
              message: `⚠️ ${result.error}`
            }
          }))
          return
        }
        
        const isValid = result.isAvailable !== false && result.isUnique !== false
        const message = isValid 
          ? `✅ ${fieldKey} is available`
          : `❌ ${fieldKey} is already taken`

        setValidationStates(prev => ({
          ...prev,
          [fieldKey]: {
            isValid,
            isValidating: false,
            message,
            error: isValid ? undefined : message
          }
        }))

        console.log(`${isValid ? '✅' : '❌'} Validation result for ${fieldKey}:`, result)

      } catch (error) {
        console.error(`❌ Validation error for ${fieldKey}:`, error)
        
        // Handle generic errors
        setValidationStates(prev => ({
          ...prev,
          [fieldKey]: {
            isValid: false,
            isValidating: false,
            error: 'Validation failed. Please try again.',
            message: '❌ Validation failed'
          }
        }))
      } finally {
        validationInProgress.current.delete(fieldKey)
      }
    }, delay),
    [delay, validateOnEmpty]
  )

  // Organization name validation
  const validateOrgName = useCallback((name: string) => {
    validateField('organizationName', name, validateOrganizationName)
  }, [validateField])

  // Complex name validation
  const validateComplName = useCallback((name: string, organizationId?: string) => {
    validateField('complexName', name, validateComplexName, organizationId)
  }, [validateField])

  // Clinic name validation
  const validateClinicNameField = useCallback((name: string, complexId?: string, organizationId?: string) => {
    validateField('clinicName', name, validateClinicName, complexId, organizationId)
  }, [validateField])

  // Get validation state for a field
  const getValidationState = useCallback((fieldKey: string): ValidationResult => {
    return validationStates[fieldKey] || { isValid: true, isValidating: false }
  }, [validationStates])

  // Clear validation for a field
  const clearValidation = useCallback((fieldKey: string) => {
    setValidationStates(prev => {
      const newState = { ...prev }
      delete newState[fieldKey]
      return newState
    })
  }, [])

  // Clear all validations
  const clearAllValidations = useCallback(() => {
    setValidationStates({})
    validationInProgress.current.clear()
  }, [])

  return {
    // Validation functions
    validateOrgName,
    validateComplName,
    validateClinicNameField,
    
    // State management
    getValidationState,
    clearValidation,
    clearAllValidations,
    
    // Utilities
    isAnyFieldValidating: Object.values(validationStates).some(state => state.isValidating),
    allFieldsValid: Object.values(validationStates).every(state => state.isValid)
  }
}

 