// ========================================
// VALIDATION INDICATOR COMPONENT
// ========================================
// Shows validation status with icons and messages

"use client"

import React from 'react'
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { colors } from '@/lib/colors'
import { ValidationResult } from '@/hooks/useFormValidation'

interface ValidationIndicatorProps {
  validationResult?: ValidationResult
  className?: string
  showWarnings?: boolean
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({ 
  validationResult, 
  className = "",
  showWarnings = true 
}) => {
  if (!validationResult) return null

  const { isValid, errors, warnings } = validationResult

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Show errors */}
      {errors.map((error, index) => (
        <div key={`error-${index}`} className="flex items-center gap-1 text-xs">
          <XCircle className="w-3 h-3" style={{ color: colors.light.state.error }} />
          <span style={{ color: colors.light.state.error }}>{error.message}</span>
        </div>
      ))}

      {/* Show warnings if enabled and no errors */}
      {showWarnings && errors.length === 0 && warnings.map((warning, index) => (
        <div key={`warning-${index}`} className="flex items-center gap-1 text-xs">
          <AlertTriangle className="w-3 h-3" style={{ color: '#f59e0b' }} />
          <span style={{ color: '#f59e0b' }}>{warning.message}</span>
        </div>
      ))}

      {/* Show success if valid and no warnings to show */}
      {isValid && errors.length === 0 && (!showWarnings || warnings.length === 0) && (
        <div className="flex items-center gap-1 text-xs">
          <CheckCircle className="w-3 h-3" style={{ color: colors.light.state.success }} />
          <span style={{ color: colors.light.state.success }}>All fields are valid</span>
        </div>
      )}
    </div>
  )
}

// ========================================
// FORM VALIDATION STATUS COMPONENT
// ========================================

interface FormValidationStatusProps {
  formType: string
  validationResult?: ValidationResult
  canProceed: boolean
  className?: string
}

export const FormValidationStatus: React.FC<FormValidationStatusProps> = ({
  formType,
  validationResult,
  canProceed,
  className = ""
}) => {
  if (!validationResult) return null

  const { isValid, errors, warnings } = validationResult
  const hasErrors = errors.length > 0
  const hasWarnings = warnings.length > 0

  return (
    <div className={`p-3 rounded-lg border ${className}`} style={{
      backgroundColor: hasErrors ? '#fef2f2' : hasWarnings ? '#fefbf2' : '#f0fdf4',
      borderColor: hasErrors ? colors.light.state.error : hasWarnings ? '#f59e0b' : colors.light.state.success
    }}>
      <div className="flex items-center gap-2 mb-2">
        {hasErrors ? (
          <XCircle className="w-4 h-4" style={{ color: colors.light.state.error }} />
        ) : hasWarnings ? (
          <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
        ) : (
          <CheckCircle className="w-4 h-4" style={{ color: colors.light.state.success }} />
        )}
        
        <span className="text-sm font-medium" style={{
          color: hasErrors ? colors.light.state.error : hasWarnings ? '#f59e0b' : colors.light.state.success
        }}>
          {hasErrors ? 'Form has errors' : hasWarnings ? 'Form has warnings' : 'Form is valid'}
        </span>
      </div>

      <ValidationIndicator validationResult={validationResult} showWarnings />

      {!canProceed && (
        <div className="mt-2 text-xs" style={{ color: colors.light.text.secondary }}>
          Please fix the errors above before proceeding to the next step.
        </div>
      )}
    </div>
  )
} 