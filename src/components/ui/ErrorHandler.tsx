// ========================================
// ERROR HANDLER COMPONENT
// ========================================
// Provides user-friendly error handling and feedback

"use client"

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Info, X, RefreshCw } from 'lucide-react'
import { colors } from '@/lib/colors'

export type ErrorType = 'error' | 'warning' | 'info' | 'success'

export interface ErrorInfo {
  type: ErrorType
  title: string
  message: string
  details?: string
  action?: {
    label: string
    onClick: () => void
  }
  autoHide?: number // Auto-hide after ms
}

interface ErrorHandlerProps {
  errors: ErrorInfo[]
  onDismiss: (index: number) => void
  className?: string
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({ 
  errors, 
  onDismiss, 
  className = "" 
}) => {
  const [visibleErrors, setVisibleErrors] = useState<ErrorInfo[]>(errors)

  useEffect(() => {
    setVisibleErrors(errors)

    // Set up auto-hide timers
    errors.forEach((error, index) => {
      if (error.autoHide) {
        setTimeout(() => {
          onDismiss(index)
        }, error.autoHide)
      }
    })
  }, [errors, onDismiss])

  const getIcon = (type: ErrorType) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5" style={{ color: colors.light.state.error }} />
      case 'warning':
        return <AlertCircle className="w-5 h-5" style={{ color: '#f59e0b' }} />
      case 'info':
        return <Info className="w-5 h-5" style={{ color: colors.light.brand.secondary }} />
      case 'success':
        return <CheckCircle className="w-5 h-5" style={{ color: colors.light.state.success }} />
    }
  }

  const getBackgroundColor = (type: ErrorType) => {
    switch (type) {
      case 'error':
        return '#fef2f2'
      case 'warning':
        return '#fefbf2'
      case 'info':
        return '#f0f9ff'
      case 'success':
        return '#f0fdf4'
    }
  }

  const getBorderColor = (type: ErrorType) => {
    switch (type) {
      case 'error':
        return colors.light.state.error
      case 'warning':
        return '#f59e0b'
      case 'info':
        return colors.light.brand.secondary
      case 'success':
        return colors.light.state.success
    }
  }

  if (visibleErrors.length === 0) return null

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleErrors.map((error, index) => (
        <div
          key={index}
          className="p-4 rounded-lg border-l-4 shadow-sm"
          style={{
            backgroundColor: getBackgroundColor(error.type),
            borderLeftColor: getBorderColor(error.type)
          }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(error.type)}
            </div>
            
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium" style={{ color: colors.light.text.primary }}>
                {error.title}
              </h3>
              
              <p className="mt-1 text-sm" style={{ color: colors.light.text.secondary }}>
                {error.message}
              </p>
              
              {error.details && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer" style={{ color: colors.light.text.secondary }}>
                    Show details
                  </summary>
                  <pre className="mt-2 text-xs whitespace-pre-wrap p-2 rounded" style={{ 
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    color: colors.light.text.secondary 
                  }}>
                    {error.details}
                  </pre>
                </details>
              )}
              
              {error.action && (
                <button
                  onClick={error.action.onClick}
                  className="mt-3 text-sm font-medium px-3 py-1 rounded hover:opacity-80"
                  style={{
                    backgroundColor: getBorderColor(error.type),
                    color: 'white'
                  }}
                >
                  <RefreshCw className="w-3 h-3 inline mr-1" />
                  {error.action.label}
                </button>
              )}
            </div>
            
            <button
              onClick={() => onDismiss(index)}
              className="ml-4 flex-shrink-0 hover:opacity-60"
            >
              <X className="w-4 h-4" style={{ color: colors.light.text.secondary }} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ========================================
// ERROR MANAGER HOOK
// ========================================

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([])

  const addError = (error: Omit<ErrorInfo, 'type'> & { type?: ErrorType }) => {
    const newError: ErrorInfo = {
      type: 'error',
      ...error
    }
    
    setErrors(prev => [...prev, newError])
    console.error('Error added:', newError)
  }

  const addSuccess = (message: string, title = 'Success') => {
    addError({
      type: 'success',
      title,
      message,
      autoHide: 3000
    })
  }

  const addWarning = (message: string, title = 'Warning') => {
    addError({
      type: 'warning',
      title,
      message,
      autoHide: 5000
    })
  }

  const addInfo = (message: string, title = 'Information') => {
    addError({
      type: 'info',
      title,
      message,
      autoHide: 4000
    })
  }

  const dismissError = (index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index))
  }

  const clearAllErrors = () => {
    setErrors([])
  }

  // Helper for API errors
  const handleApiError = (error: any, context = 'Operation') => {
    let message = 'An unexpected error occurred'
    let details = ''

    if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message) {
      message = error.message
    }

    if (error?.response?.data?.error) {
      details = typeof error.response.data.error === 'string' 
        ? error.response.data.error 
        : JSON.stringify(error.response.data.error, null, 2)
    }

    addError({
      type: 'error',
      title: `${context} Failed`,
      message,
      details,
      action: {
        label: 'Retry',
        onClick: () => {
          // Retry logic can be passed as parameter
          console.log('Retry action clicked')
        }
      }
    })
  }

  // Helper for validation errors
  const handleValidationErrors = (errors: Array<{ field: string; message: string }>) => {
    errors.forEach(({ field, message }) => {
      addError({
        type: 'warning',
        title: 'Validation Error',
        message: `${field}: ${message}`,
        autoHide: 5000
      })
    })
  }

  return {
    errors,
    addError,
    addSuccess,
    addWarning,
    addInfo,
    dismissError,
    clearAllErrors,
    handleApiError,
    handleValidationErrors,
    hasErrors: errors.length > 0
  }
}

// ========================================
// ONBOARDING-SPECIFIC ERROR HELPERS
// ========================================

export const useOnboardingErrorHandler = () => {
  const errorHandler = useErrorHandler()

  const handleSaveError = (step: string, error: any) => {
    errorHandler.handleApiError(error, `Saving ${step}`)
  }

  const handleValidationError = (field: string, error: any) => {
    errorHandler.addError({
      type: 'warning',
      title: 'Validation Failed',
      message: `${field} validation failed: ${error.message || 'Please check your input'}`,
      autoHide: 5000
    })
  }

  const handleProgressError = (error: any) => {
    // Check if it's a network error (backend not available)
    if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
      errorHandler.addError({
        type: 'error',
        title: 'Backend Server Not Available',
        message: 'The backend server is not running. Please start the server to continue.',
        details: 'Network Error: Cannot connect to http://localhost:3001/api/v1',
        action: {
          label: 'Show Instructions',
          onClick: () => {
            errorHandler.addInfo(
              'To start the backend server:\n1. Open terminal in cliniva-backend directory\n2. Run: npm install\n3. Run: npm run start:dev\n4. Wait for "🚀 Cliniva Backend is running on port 3001"',
              'Backend Setup Instructions'
            )
          }
        }
      })
      return
    }
    
    errorHandler.addError({
      type: 'error',
      title: 'Progress Update Failed',
      message: 'We couldn\'t save your progress. Your data is safe, but you may need to re-enter some information.',
      details: error.message,
      action: {
        label: 'Continue Anyway',
        onClick: () => {
          errorHandler.clearAllErrors()
        }
      }
    })
  }

  const showAutoSaveSuccess = () => {
    errorHandler.addSuccess('Your changes have been automatically saved', 'Auto-saved')
  }

  const showValidationSuccess = (field: string) => {
    errorHandler.addSuccess(`${field} is available and valid`, 'Validation Passed')
  }

  const showOnboardingCompletionError = (error: any) => {
    // Check for network errors (backend not available)
    if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
      errorHandler.addError({
        type: 'error',
        title: 'Backend Server Not Available',
        message: 'Cannot connect to the server. Your progress has been saved locally.',
        details: 'Network Error: Cannot connect to http://localhost:3001/api/v1',
        action: {
          label: 'Show Setup Instructions',
          onClick: () => {
            errorHandler.addInfo(
              'To start the backend server:\n1. Open terminal in cliniva-backend directory\n2. Run: npm install\n3. Run: npm run start:dev\n4. Wait for "🚀 Cliniva Backend is running on port 3001"\n5. Then try completing onboarding again',
              'Backend Setup Instructions'
            )
          }
        }
      })
      return
    }
    
    // Check for authentication issues
    if (error?.response?.status === 401) {
      errorHandler.addError({
        type: 'warning',
        title: 'Session Issue',
        message: 'Your session may have expired. Please refresh the page and try again.',
        details: 'HTTP 401: Authentication issue',
        action: {
          label: 'Refresh Page',
          onClick: () => {
            window.location.reload()
          }
        }
      })
      return
    }
    
    // Check for validation errors
    if (error?.response?.status === 400) {
      errorHandler.addError({
        type: 'warning',
        title: 'Validation Error',
        message: error?.response?.data?.message || 'Please check your information and try again.',
        details: `HTTP 400: ${error?.response?.data?.error || 'Validation failed'}`,
        action: {
          label: 'Review Information',
          onClick: () => {
            errorHandler.clearAllErrors()
          }
        }
      })
      return
    }
    
    // Check for server errors
    if (error?.response?.status >= 500) {
      errorHandler.addError({
        type: 'error',
        title: 'Server Error',
        message: 'The server encountered an issue. Please try again in a moment.',
        details: `HTTP ${error?.response?.status}: ${error?.response?.statusText}`,
        action: {
          label: 'Retry',
          onClick: () => {
            errorHandler.clearAllErrors()
          }
        }
      })
      return
    }
    
    // Generic error fallback
    errorHandler.addError({
      type: 'error',
      title: 'Setup Failed',
      message: error?.response?.data?.message || error?.message || 'Failed to complete setup. Please try again.',
      details: error?.stack || 'Unknown error occurred',
      action: {
        label: 'Try Again',
        onClick: () => {
          errorHandler.clearAllErrors()
        }
      }
    })
  }

  return {
    ...errorHandler,
    handleSaveError,
    handleValidationError,
    handleProgressError,
    showAutoSaveSuccess,
    showValidationSuccess,
    showOnboardingCompletionError
  }
} 