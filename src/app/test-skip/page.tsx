'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SkipButton } from '@/components/onboarding/SkipButton'
import { CheckCircle, XCircle, Building, Users, Stethoscope } from 'lucide-react'

export default function TestSkipPage() {
  const [userEntities, setUserEntities] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check user entities on page load
  useEffect(() => {
    checkUserEntities()
  }, [])

  const checkUserEntities = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/user/entities/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setUserEntities(data.data)
      } else {
        setError(data.message || 'Failed to check entities')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check entities')
      console.error('Error checking entities:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const StatusIcon = ({ hasEntity }: { hasEntity: boolean }) => (
    hasEntity ? 
      <CheckCircle className="h-5 w-5 text-green-600" /> : 
      <XCircle className="h-5 w-5 text-red-600" />
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Skip Functionality Test</h1>
          <p className="text-lg text-gray-600">
            This page demonstrates how the skip functionality checks existing entities before redirecting.
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="h-5 w-5" />
                <span>Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {userEntities && (
          <>
            {/* Current Status */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Your Current Setup Status</CardTitle>
                <CardDescription>
                  Plan Type: <strong>{userEntities.planType}</strong> | 
                  Needs Setup: <strong>{userEntities.needsSetup ? 'Yes' : 'No'}</strong> | 
                  Next Step: <strong>{userEntities.nextStep}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Company/Organization Status */}
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Building className="h-8 w-8 text-blue-600" />
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <StatusIcon hasEntity={userEntities.hasOrganization} />
                        <span className="font-medium">Company</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {userEntities.hasOrganization ? 'Created' : 'Not created'}
                      </p>
                    </div>
                  </div>

                  {/* Complex Status */}
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <StatusIcon hasEntity={userEntities.hasComplex} />
                        <span className="font-medium">Complex</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {userEntities.hasComplex ? 'Created' : 'Not created'}
                      </p>
                    </div>
                  </div>

                  {/* Clinic Status */}
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Stethoscope className="h-8 w-8 text-green-600" />
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <StatusIcon hasEntity={userEntities.hasClinic} />
                        <span className="font-medium">Clinic</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {userEntities.hasClinic ? 'Created' : 'Not created'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skip Test */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Test Skip Functionality</CardTitle>
                <CardDescription>
                  Click the skip button below to test the skip functionality. 
                  It will check your entities and redirect appropriately.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Expected Behavior:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {userEntities.needsSetup ? (
                        <>
                          <li>• You still need to complete setup</li>
                          <li>• Skip will redirect you to: <strong>{userEntities.nextStep}</strong></li>
                          <li>• You can complete the missing setup later</li>
                        </>
                      ) : (
                        <>
                          <li>• ✅ You have completed all required setup for your plan</li>
                          <li>• Skip will redirect you directly to dashboard</li>
                          <li>• Your setup is marked as complete</li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex gap-4">
                    <SkipButton 
                      onSkip={() => {
                        console.log('Skip button clicked!')
                        // Refresh entities after skip
                        setTimeout(checkUserEntities, 2000)
                      }}
                    />
                    <Button 
                      onClick={checkUserEntities} 
                      variant="outline"
                      disabled={isLoading}
                    >
                      Refresh Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Requirements</CardTitle>
                <CardDescription>
                  What each plan type requires to be considered "complete"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Company Plan</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Organization/Company</li>
                      <li>✓ At least one Complex</li>
                      <li>✓ At least one Clinic</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Complex Plan</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Organization/Company</li>
                      <li>✓ At least one Clinic</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Clinic Plan</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Organization/Company</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
} 