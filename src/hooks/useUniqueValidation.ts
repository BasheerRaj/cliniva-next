import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounced';
import { validationApi, RealTimeValidationResponse } from '@/api/validationApi';

export interface UniqueValidationState {
  isChecking: boolean;
  isValid: boolean;
  isAvailable: boolean;
  message: string;
  hasChecked: boolean;
}

/**
 * Custom hook for unique field validation with debouncing
 * @param value - The value to validate
 * @param validationType - The type of validation ('organizationName', 'complexName', 'clinicName', 'email', 'vatNumber', 'crNumber')
 * @param delay - Debounce delay in milliseconds (default: 800ms)
 * @param additionalParams - Additional parameters for validation (e.g., organizationId for complexName)
 * @param skipValidation - Skip validation (useful when editing existing user data)
 * @returns validation state
 */
export function useUniqueValidation(
  value: string,
  validationType: 'organizationName' | 'complexName' | 'clinicName' | 'email' | 'vatNumber' | 'crNumber',
  delay: number = 800,
  additionalParams?: { organizationId?: string; complexId?: string },
  skipValidation: boolean = false
) {
  const [state, setState] = useState<UniqueValidationState>({
    isChecking: false,
    isValid: false,
    isAvailable: false,
    message: '',
    hasChecked: false,
  });

  const debouncedValue = useDebounce(value, delay);

  useEffect(() => {
    // If validation should be skipped, mark as available
    if (skipValidation && debouncedValue && debouncedValue.trim().length > 0) {
      setState({
        isChecking: false,
        isValid: true,
        isAvailable: true,
        message: 'Using existing value',
        hasChecked: true,
      });
      return;
    }

    if (!debouncedValue || debouncedValue.trim().length === 0) {
      setState({
        isChecking: false,
        isValid: false,
        isAvailable: false,
        message: '',
        hasChecked: false,
      });
      return;
    }

    const validateField = async () => {
      setState(prev => ({ ...prev, isChecking: true }));

      try {
        let result: RealTimeValidationResponse;

        switch (validationType) {
          case 'organizationName':
            result = await validationApi.validateOrganizationName(debouncedValue);
            break;
          case 'complexName':
            result = await validationApi.validateComplexName(debouncedValue, additionalParams?.organizationId);
            break;
          case 'clinicName':
            result = await validationApi.validateClinicName(debouncedValue, additionalParams?.complexId);
            break;
          case 'email':
            result = await validationApi.validateEmail(debouncedValue);
            break;
          case 'vatNumber':
            result = await validationApi.validateVatNumber(debouncedValue);
            break;
          case 'crNumber':
            result = await validationApi.validateCrNumber(debouncedValue);
            break;
          default:
            throw new Error(`Unknown validation type: ${validationType}`);
        }

        setState({
          isChecking: false,
          isValid: result.isValid,
          isAvailable: result.isAvailable,
          message: result.message,
          hasChecked: true,
        });
      } catch (error) {
        console.error('Unique validation error:', error);
        setState({
          isChecking: false,
          isValid: false,
          isAvailable: false,
          message: 'Unable to validate. Please try again.',
          hasChecked: true,
        });
      }
    };

    validateField();
  }, [debouncedValue, validationType, additionalParams?.organizationId, additionalParams?.complexId, skipValidation]);

  // Reset state when value changes (immediate feedback)
  useEffect(() => {
    if (value !== debouncedValue) {
      setState(prev => ({ 
        ...prev, 
        isChecking: false,
        hasChecked: false,
        message: prev.hasChecked ? 'Checking...' : '' 
      }));
    }
  }, [value, debouncedValue]);

  return state;
}

/**
 * Get validation status class for styling
 */
export function getValidationStatusClass(validationState: UniqueValidationState): string {
  if (validationState.isChecking) {
    return 'border-blue-300 focus:border-blue-500 focus:ring-blue-200';
  }
  
  if (!validationState.hasChecked) {
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-200';
  }
  
  if (validationState.isValid && validationState.isAvailable) {
    return 'border-green-300 focus:border-green-500 focus:ring-green-200';
  }
  
  return 'border-red-300 focus:border-red-500 focus:ring-red-200';
}

/**
 * Get validation message with appropriate styling class
 */
export function getValidationMessage(validationState: UniqueValidationState): { 
  message: string; 
  className: string; 
} {
  if (validationState.isChecking) {
    return {
      message: 'Checking availability...',
      className: 'text-blue-600 text-sm mt-1'
    };
  }
  
  if (!validationState.hasChecked || !validationState.message) {
    return {
      message: '',
      className: ''
    };
  }
  
  if (validationState.isValid && validationState.isAvailable) {
    return {
      message: validationState.message,
      className: 'text-green-600 text-sm mt-1'
    };
  }
  
  return {
    message: validationState.message,
    className: 'text-red-600 text-sm mt-1'
  };
} 