import { useState, useEffect } from 'react';

export interface WorkingHour {
  dayOfWeek: string;
  isWorkingDay: boolean;
  openingTime?: string;
  closingTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

export interface WorkingHoursValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const useWorkingHoursValidation = (
  clinicHours: WorkingHour[],
  complexId?: string,
  enabled: boolean = true
) => {
  const [validationResult, setValidationResult] = useState<WorkingHoursValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // Simple validation - check if clinic hours are reasonable
  useEffect(() => {
    if (!enabled || !clinicHours.length) {
      setValidationResult({ isValid: true, errors: [], warnings: [] });
      return;
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    clinicHours.forEach(day => {
      if (!day.isWorkingDay) return;

      // Basic validation for clinic hours
      if (day.openingTime && day.closingTime) {
        if (day.openingTime >= day.closingTime) {
          errors.push(`${day.dayOfWeek}: Opening time must be before closing time`);
        }
      }

      // Check for reasonable working hours
      if (day.openingTime && day.openingTime < '06:00') {
        warnings.push(`${day.dayOfWeek}: Opening very early (${day.openingTime})`);
      }

      if (day.closingTime && day.closingTime > '22:00') {
        warnings.push(`${day.dayOfWeek}: Closing very late (${day.closingTime})`);
      }
    });

    setValidationResult({
      isValid: errors.length === 0,
      errors,
      warnings
    });
  }, [clinicHours, enabled]);

  return {
    validationResult,
    isLoading: false,
    hasComplexHours: false
  };
}; 