// ========================================
// BACKEND HEALTH CHECK UTILITY
// ========================================
// Helps developers check if backend is running

import { useState } from 'react'

export interface HealthCheckResult {
  isHealthy: boolean
  message: string
  details?: string
  instructions?: string[]
}

export const checkBackendHealth = async (): Promise<HealthCheckResult> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
  
  try {
    // Try to ping the backend database health endpoint
    const response = await fetch(`${baseUrl}/database/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      return {
        isHealthy: true,
        message: '✅ Backend server is running and healthy!'
      }
    } else {
      return {
        isHealthy: false,
        message: '⚠️ Backend server is running but may have issues',
        details: `Status: ${response.status} ${response.statusText}`,
        instructions: [
          'Check backend logs for errors',
          'Verify database connection',
          'Ensure all dependencies are installed'
        ]
      }
    }
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        isHealthy: false,
        message: '❌ Backend server is not running',
        details: `Cannot connect to ${baseUrl}`,
        instructions: [
          '1. Navigate to the cliniva-backend directory',
          '2. Run: npm install',
          '3. Start the server: npm run start:dev',
          '4. Verify it starts on port 3001',
          '5. Check that MongoDB is running'
        ]
      }
    }
    
    return {
      isHealthy: false,
      message: '❌ Failed to check backend health',
      details: error.message,
      instructions: [
        'Check your network connection',
        'Verify the API URL in environment variables',
        'Ensure the backend server is accessible'
      ]
    }
  }
}

// React hook for health checking
export const useBackendHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  
  const performHealthCheck = async () => {
    setIsChecking(true)
    try {
      const result = await checkBackendHealth()
      setHealthStatus(result)
      return result
    } finally {
      setIsChecking(false)
    }
  }
  
  return {
    healthStatus,
    isChecking,
    performHealthCheck
  }
} 