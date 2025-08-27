'use client';

import { useMutation } from '@tanstack/react-query';
import { useState, useCallback, useRef, useEffect } from 'react';
import { debounce } from 'lodash';
import apiClient from '@/lib/axios';

interface UniquenessCheckResult {
  isUnique: boolean;
  message?: string;
  suggestions?: string[];
}

interface UseUniquenessValidationOptions {
  debounceMs?: number;
  enabled?: boolean;
  minLength?: number;
}

// Hook for checking organization name uniqueness
export const useOrganizationNameValidation = (options: UseUniquenessValidationOptions = {}) => {
  const { debounceMs = 800, enabled = true, minLength = 2 } = options;
  const [nameToCheck, setNameToCheck] = useState<string>('');
  const [lastCheckedName, setLastCheckedName] = useState<string>('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Simple cache to prevent duplicate requests
  const cacheRef = useRef<Map<string, UniquenessCheckResult>>(new Map());

  const checkUniqueness = useMutation({
    mutationFn: async (name: string): Promise<UniquenessCheckResult> => {
      if (!name || name.length < minLength) {
        return { isUnique: true };
      }

      const trimmedName = name.trim().toLowerCase();
      
      // Check cache first
      if (cacheRef.current.has(trimmedName)) {
        const cached = cacheRef.current.get(trimmedName)!;
        console.log('💾 Using cached result for:', name, cached);
        return cached;
      }

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        console.log('🔍 Validating organization name:', name);
        
        const response = await apiClient.post('/onboarding/validate-organization-name', 
          { name }, 
          { 
            signal: abortControllerRef.current.signal,
            timeout: 10000 // 10 second timeout
          }
        );
        
        // Handle the backend response format: { success, message, data: { isAvailable, name } }
        let result: UniquenessCheckResult;
        
        if (response.data.success && response.data.data) {
          console.log('✅ Organization name validation result:', response.data.data.isAvailable);
          result = { 
            isUnique: response.data.data.isAvailable,
            message: response.data.message 
          };
        } else {
          // If backend returns error format, assume name is taken
          result = { 
            isUnique: false, 
            message: response.data.message || 'Organization name may already be taken' 
          };
        }
        
        // Cache the result for 5 minutes
        cacheRef.current.set(trimmedName, result);
        setTimeout(() => {
          cacheRef.current.delete(trimmedName);
        }, 5 * 60 * 1000); // 5 minutes
        
        return result;
      } catch (error: any) {
        // Don't log errors for cancelled requests
        if (error.name === 'CanceledError' || error.code === 'ABORT_ERR') {
          throw error; // Let React Query handle the cancellation
        }
        
        // Handle network errors gracefully - assume name is available to prevent blocking
        console.warn('Organization name validation failed:', error.message);
        const result = { 
          isUnique: true, 
          message: 'Could not verify name availability, proceeding...' 
        };
        
        // Don't cache error results
        return result;
      }
    },
    retry: false,
  });

  // Cleanup function to clear timeout and abort request
  const cleanup = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount - also clear cache
  useEffect(() => {
    return () => {
      cleanup();
      cacheRef.current.clear(); // Clear cache on unmount
    };
  }, [cleanup]);

  const validateName = useCallback((name: string) => {
    if (!enabled) return;
    
    const trimmedName = name.trim();
    setNameToCheck(trimmedName);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Cancel existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Don't validate if name is too short
    if (trimmedName.length < minLength) {
      return;
    }
    
    // Don't validate if name hasn't changed
    if (trimmedName === lastCheckedName) {
      return;
    }
    
    // Set up debounced validation
    debounceTimeoutRef.current = setTimeout(() => {
      setLastCheckedName(trimmedName);
      checkUniqueness.mutate(trimmedName);
    }, debounceMs);
  }, [enabled, minLength, debounceMs, lastCheckedName, checkUniqueness]);

  return {
    validateName,
    isChecking: checkUniqueness.isPending,
    result: checkUniqueness.data,
    error: checkUniqueness.error,
    reset: useCallback(() => {
      cleanup();
      setNameToCheck('');
      setLastCheckedName('');
      cacheRef.current.clear(); // Clear cache on reset
      checkUniqueness.reset();
    }, [cleanup, checkUniqueness]),
    currentName: nameToCheck
  };
};

// Hook for checking complex name uniqueness
export const useComplexNameValidation = (options: UseUniquenessValidationOptions = {}) => {
  const { debounceMs = 500, enabled = true } = options;
  const [nameToCheck, setNameToCheck] = useState<string>('');

  const checkUniqueness = useMutation({
    mutationFn: async (params: { name: string; organizationId?: string }): Promise<UniquenessCheckResult> => {
      if (!params.name || params.name.length < 2) {
        return { isUnique: true };
      }

      const response = await apiClient.post('/onboarding/validate-complex-name', params);
      return response.data;
    },
    retry: false,
  });

  const debouncedCheck = useCallback(
    debounce((name: string, organizationId?: string) => {
      setNameToCheck(name);
      if (name && name.length >= 2) {
        checkUniqueness.mutate({ name, organizationId });
      }
    }, debounceMs),
    [checkUniqueness, debounceMs]
  );

  const validateName = (name: string, organizationId?: string) => {
    if (enabled) {
      debouncedCheck(name, organizationId);
    }
  };

  return {
    validateName,
    isChecking: checkUniqueness.isPending,
    result: checkUniqueness.data,
    error: checkUniqueness.error,
    reset: checkUniqueness.reset,
    currentName: nameToCheck
  };
};

// Hook for checking clinic name uniqueness
export const useClinicNameValidation = (options: UseUniquenessValidationOptions = {}) => {
  const { debounceMs = 500, enabled = true } = options;
  const [nameToCheck, setNameToCheck] = useState<string>('');

  const checkUniqueness = useMutation({
    mutationFn: async (params: { 
      name: string; 
      complexId?: string; 
      organizationId?: string;
    }): Promise<UniquenessCheckResult> => {
      if (!params.name || params.name.length < 2) {
        return { isUnique: true };
      }

      const response = await apiClient.post('/onboarding/validate-clinic-name', params);
      return response.data;
    },
    retry: false,
  });

  const debouncedCheck = useCallback(
    debounce((name: string, complexId?: string, organizationId?: string) => {
      setNameToCheck(name);
      if (name && name.length >= 2) {
        checkUniqueness.mutate({ name, complexId, organizationId });
      }
    }, debounceMs),
    [checkUniqueness, debounceMs]
  );

  const validateName = (name: string, complexId?: string, organizationId?: string) => {
    if (enabled) {
      debouncedCheck(name, complexId, organizationId);
    }
  };

  return {
    validateName,
    isChecking: checkUniqueness.isPending,
    result: checkUniqueness.data,
    error: checkUniqueness.error,
    reset: checkUniqueness.reset,
    currentName: nameToCheck
  };
};

// Hook for checking email availability
export const useEmailValidation = (options: UseUniquenessValidationOptions = {}) => {
  const { debounceMs = 800, enabled = true, minLength = 3 } = options;
  const [emailToCheck, setEmailToCheck] = useState<string>('');
  const [lastCheckedEmail, setLastCheckedEmail] = useState<string>('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Simple cache to prevent duplicate requests
  const cacheRef = useRef<Map<string, UniquenessCheckResult>>(new Map());

  const checkAvailability = useMutation({
    mutationFn: async (email: string): Promise<UniquenessCheckResult> => {
      if (!email || !email.includes('@') || email.length < minLength) {
        return { isUnique: true };
      }

      const trimmedEmail = email.trim().toLowerCase();
      
      // Check cache first
      if (cacheRef.current.has(trimmedEmail)) {
        const cached = cacheRef.current.get(trimmedEmail)!;
        console.log('💾 Using cached email result for:', email, cached);
        return cached;
      }

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        console.log('📧 Validating email availability:', email);
        
        const response = await apiClient.post('/onboarding/validate-email', 
          { email }, 
          { 
            signal: abortControllerRef.current.signal,
            timeout: 10000 // 10 second timeout
          }
        );
        
        let result: UniquenessCheckResult;
        
        // Handle response format - assuming similar to organization name validation
        if (response.data.success && response.data.data) {
          console.log('✅ Email availability result:', response.data.data.isAvailable);
          result = { 
            isUnique: response.data.data.isAvailable,
            message: response.data.message 
          };
        } else {
          // If backend returns error format, assume email is taken
          result = { 
            isUnique: false, 
            message: response.data.message || 'Email may already be taken' 
          };
        }
        
        // Cache the result for 5 minutes
        cacheRef.current.set(trimmedEmail, result);
        setTimeout(() => {
          cacheRef.current.delete(trimmedEmail);
        }, 5 * 60 * 1000); // 5 minutes
        
        return result;
      } catch (error: any) {
        // Don't log errors for cancelled requests
        if (error.name === 'CanceledError' || error.code === 'ABORT_ERR') {
          throw error; // Let React Query handle the cancellation
        }
        
        // Handle network errors gracefully - assume email is available to prevent blocking
        console.warn('Email validation failed:', error.message);
        const result = { 
          isUnique: true, 
          message: 'Could not verify email availability, proceeding...' 
        };
        
        // Don't cache error results
        return result;
      }
    },
    retry: false,
  });

  // Cleanup function to clear timeout and abort request
  const cleanup = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount - also clear cache
  useEffect(() => {
    return () => {
      cleanup();
      cacheRef.current.clear(); // Clear cache on unmount
    };
  }, [cleanup]);

  const validateEmail = useCallback((email: string) => {
    if (!enabled) return;
    
    const trimmedEmail = email.trim();
    setEmailToCheck(trimmedEmail);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Cancel existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Don't validate if email is too short or invalid format
    if (trimmedEmail.length < minLength || !trimmedEmail.includes('@')) {
      return;
    }
    
    // Don't validate if email hasn't changed
    if (trimmedEmail === lastCheckedEmail) {
      return;
    }
    
    // Set up debounced validation
    debounceTimeoutRef.current = setTimeout(() => {
      setLastCheckedEmail(trimmedEmail);
      checkAvailability.mutate(trimmedEmail);
    }, debounceMs);
  }, [enabled, minLength, debounceMs, lastCheckedEmail, checkAvailability]);

  return {
    validateEmail,
    isChecking: checkAvailability.isPending,
    result: checkAvailability.data,
    error: checkAvailability.error,
    reset: useCallback(() => {
      cleanup();
      setEmailToCheck('');
      setLastCheckedEmail('');
      cacheRef.current.clear(); // Clear cache on reset
      checkAvailability.reset();
    }, [cleanup, checkAvailability]),
    currentEmail: emailToCheck
  };
};

// Hook for checking VAT number validity
export const useVatNumberValidation = (options: UseUniquenessValidationOptions = {}) => {
  const { debounceMs = 1000, enabled = true, minLength = 5 } = options;
  const [vatToCheck, setVatToCheck] = useState<string>('');
  const [lastCheckedVat, setLastCheckedVat] = useState<string>('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Simple cache to prevent duplicate requests
  const cacheRef = useRef<Map<string, UniquenessCheckResult>>(new Map());

  const checkVat = useMutation({
    mutationFn: async (vatNumber: string): Promise<UniquenessCheckResult> => {
      if (!vatNumber || vatNumber.length < minLength) {
        return { isUnique: true };
      }

      const trimmedVat = vatNumber.trim().replace(/\s+/g, '');
      
      // Check cache first
      if (cacheRef.current.has(trimmedVat)) {
        const cached = cacheRef.current.get(trimmedVat)!;
        console.log('💾 Using cached VAT result for:', vatNumber, cached);
        return cached;
      }

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        console.log('🏷️ Validating VAT number:', vatNumber);
        
        const response = await apiClient.post('/onboarding/validate-vat', 
          { vatNumber }, 
          { 
            signal: abortControllerRef.current.signal,
            timeout: 10000 // 10 second timeout
          }
        );
        
        let result: UniquenessCheckResult = {
          isUnique: response.data.isUnique || false,
          message: response.data.message
        };
        
        // Cache the result for 5 minutes
        cacheRef.current.set(trimmedVat, result);
        setTimeout(() => {
          cacheRef.current.delete(trimmedVat);
        }, 5 * 60 * 1000); // 5 minutes
        
        return result;
      } catch (error: any) {
        // Don't log errors for cancelled requests
        if (error.name === 'CanceledError' || error.code === 'ABORT_ERR') {
          throw error; // Let React Query handle the cancellation
        }
        
        // Handle network errors gracefully - assume VAT is valid to prevent blocking
        console.warn('VAT validation failed:', error.message);
        const result = { 
          isUnique: true, 
          message: 'Could not verify VAT number, proceeding...' 
        };
        
        // Don't cache error results
        return result;
      }
    },
    retry: false,
  });

  // Cleanup function to clear timeout and abort request
  const cleanup = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount - also clear cache
  useEffect(() => {
    return () => {
      cleanup();
      cacheRef.current.clear(); // Clear cache on unmount
    };
  }, [cleanup]);

  const validateVat = useCallback((vatNumber: string) => {
    if (!enabled) return;
    
    const trimmedVat = vatNumber.trim();
    
    // Skip if already validated this exact value
    if (trimmedVat === lastCheckedVat) {
      return;
    }
    
    // Clear existing timeout
    cleanup();
    
    // Skip validation for empty or too short values
    if (!trimmedVat || trimmedVat.length < minLength) {
      setVatToCheck('');
      setLastCheckedVat('');
      checkVat.reset();
      return;
    }
    
    // Set up new debounced validation
    debounceTimeoutRef.current = setTimeout(() => {
      setVatToCheck(trimmedVat);
      setLastCheckedVat(trimmedVat);
      checkVat.mutate(trimmedVat);
    }, debounceMs);
  }, [enabled, minLength, debounceMs, lastCheckedVat, cleanup, checkVat]);

  return {
    validateVat,
    isChecking: checkVat.isPending,
    result: checkVat.data,
    error: checkVat.error,
    reset: useCallback(() => {
      cleanup();
      setVatToCheck('');
      setLastCheckedVat('');
      checkVat.reset();
    }, [cleanup, checkVat]),
    currentVat: vatToCheck
  };
};

// Hook for checking CR number validity
export const useCrNumberValidation = (options: UseUniquenessValidationOptions = {}) => {
  const { debounceMs = 1000, enabled = true, minLength = 5 } = options;
  const [crToCheck, setCrToCheck] = useState<string>('');
  const [lastCheckedCr, setLastCheckedCr] = useState<string>('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Simple cache to prevent duplicate requests
  const cacheRef = useRef<Map<string, UniquenessCheckResult>>(new Map());

  const checkCr = useMutation({
    mutationFn: async (crNumber: string): Promise<UniquenessCheckResult> => {
      if (!crNumber || crNumber.length < minLength) {
        return { isUnique: true };
      }

      const trimmedCr = crNumber.trim().replace(/\s+/g, '');
      
      // Check cache first
      if (cacheRef.current.has(trimmedCr)) {
        const cached = cacheRef.current.get(trimmedCr)!;
        console.log('💾 Using cached CR result for:', crNumber, cached);
        return cached;
      }

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        console.log('🏢 Validating CR number:', crNumber);
        
        const response = await apiClient.post('/onboarding/validate-cr', 
          { crNumber }, 
          { 
            signal: abortControllerRef.current.signal,
            timeout: 10000 // 10 second timeout
          }
        );
        
        let result: UniquenessCheckResult = {
          isUnique: response.data.isUnique || false,
          message: response.data.message
        };
        
        // Cache the result for 5 minutes
        cacheRef.current.set(trimmedCr, result);
        setTimeout(() => {
          cacheRef.current.delete(trimmedCr);
        }, 5 * 60 * 1000); // 5 minutes
        
        return result;
      } catch (error: any) {
        // Don't log errors for cancelled requests
        if (error.name === 'CanceledError' || error.code === 'ABORT_ERR') {
          throw error; // Let React Query handle the cancellation
        }
        
        // Handle network errors gracefully - assume CR is valid to prevent blocking
        console.warn('CR validation failed:', error.message);
        const result = { 
          isUnique: true, 
          message: 'Could not verify CR number, proceeding...' 
        };
        
        // Don't cache error results
        return result;
      }
    },
    retry: false,
  });

  // Cleanup function to clear timeout and abort request
  const cleanup = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount - also clear cache
  useEffect(() => {
    return () => {
      cleanup();
      cacheRef.current.clear(); // Clear cache on unmount
    };
  }, [cleanup]);

  const validateCr = useCallback((crNumber: string) => {
    if (!enabled) return;
    
    const trimmedCr = crNumber.trim();
    
    // Skip if already validated this exact value
    if (trimmedCr === lastCheckedCr) {
      return;
    }
    
    // Clear existing timeout
    cleanup();
    
    // Skip validation for empty or too short values
    if (!trimmedCr || trimmedCr.length < minLength) {
      setCrToCheck('');
      setLastCheckedCr('');
      checkCr.reset();
      return;
    }
    
    // Set up new debounced validation
    debounceTimeoutRef.current = setTimeout(() => {
      setCrToCheck(trimmedCr);
      setLastCheckedCr(trimmedCr);
      checkCr.mutate(trimmedCr);
    }, debounceMs);
  }, [enabled, minLength, debounceMs, lastCheckedCr, cleanup, checkCr]);

  return {
    validateCr,
    isChecking: checkCr.isPending,
    result: checkCr.data,
    error: checkCr.error,
    reset: useCallback(() => {
      cleanup();
      setCrToCheck('');
      setLastCheckedCr('');
      checkCr.reset();
    }, [cleanup, checkCr]),
    currentCr: crToCheck
  };
};

// Combined hook for all uniqueness validations
export const useUniquenessValidation = (options: UseUniquenessValidationOptions = {}) => {
  const organizationName = useOrganizationNameValidation(options);
  const complexName = useComplexNameValidation(options);
  const clinicName = useClinicNameValidation(options);
  const email = useEmailValidation(options);
  const vatNumber = useVatNumberValidation(options);
  const crNumber = useCrNumberValidation(options);

  const isAnyChecking = 
    organizationName.isChecking ||
    complexName.isChecking ||
    clinicName.isChecking ||
    email.isChecking ||
    vatNumber.isChecking ||
    crNumber.isChecking;

  const resetAll = () => {
    organizationName.reset();
    complexName.reset();
    clinicName.reset();
    email.reset();
    vatNumber.reset();
    crNumber.reset();
  };

  return {
    organizationName,
    complexName,
    clinicName,
    email,
    vatNumber,
    crNumber,
    isAnyChecking,
    resetAll
  };
};
