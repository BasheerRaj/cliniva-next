// ========================================
// BACKEND STATUS COMPONENT (Development Only)
// ========================================
// Shows backend connectivity status and helps with debugging

"use client"

import React, { useEffect } from 'react'
import { AlertCircle, CheckCircle, RefreshCw, Server } from 'lucide-react'
import { useBackendHealthCheck } from '@/lib/health-check'
import { colors } from '@/lib/colors'

interface BackendStatusProps {
  showInProduction?: boolean
  className?: string
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ 
  showInProduction = false, 
  className = "" 
}) => {
  const { healthStatus, isChecking, performHealthCheck } = useBackendHealthCheck()

  // Hide in production unless explicitly shown
  if (!showInProduction && process.env.NODE_ENV === 'production') {
    return null
  }

  useEffect(() => {
    // Auto-check on mount
    performHealthCheck()
  }, [])

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="w-4 h-4 animate-spin" style={{ color: colors.light.brand.secondary }} />
    }
    
    if (!healthStatus) {
      return <Server className="w-4 h-4" style={{ color: colors.light.text.secondary }} />
    }
    
    return healthStatus.isHealthy 
      ? <CheckCircle className="w-4 h-4" style={{ color: colors.light.state.success }} />
      : <AlertCircle className="w-4 h-4" style={{ color: colors.light.state.error }} />
  }

  const getStatusColor = () => {
    if (isChecking || !healthStatus) return colors.light.text.secondary
    return healthStatus.isHealthy ? colors.light.state.success : colors.light.state.error
  }

  const getBackgroundColor = () => {
    if (isChecking || !healthStatus) return '#f8f9fa'
    return healthStatus.isHealthy ? '#f0fdf4' : '#fef2f2'
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 p-3 rounded-lg border shadow-lg max-w-sm z-50 ${className}`}
      style={{ 
        backgroundColor: getBackgroundColor(),
        borderColor: getStatusColor()
      }}
    >
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: getStatusColor() }}>
              Backend Status
            </p>
            <button 
              onClick={performHealthCheck}
              disabled={isChecking}
              className="text-xs px-2 py-1 rounded hover:opacity-80 disabled:opacity-50"
              style={{ 
                backgroundColor: getStatusColor(),
                color: 'white'
              }}
            >
              {isChecking ? 'Checking...' : 'Refresh'}
            </button>
          </div>
          
          {healthStatus && (
            <>
              <p className="text-xs mt-1" style={{ color: colors.light.text.secondary }}>
                {healthStatus.message}
              </p>
              
              {healthStatus.details && (
                <p className="text-xs mt-1 font-mono" style={{ color: colors.light.text.secondary }}>
                  {healthStatus.details}
                </p>
              )}
              
              {healthStatus.instructions && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer" style={{ color: colors.light.text.secondary }}>
                    Show fix instructions
                  </summary>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    {healthStatus.instructions.map((instruction, index) => (
                      <li key={index} className="text-xs" style={{ color: colors.light.text.secondary }}>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
} 