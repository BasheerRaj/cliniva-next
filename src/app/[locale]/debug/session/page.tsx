'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { RegistrationDebug } from '@/components/debug/RegistrationDebug';
import { 
  User, 
  Settings, 
  CreditCard, 
  Building, 
  Hospital, 
  Home,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export default function SessionDebugPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading session data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Session Debug</h1>
        <Button onClick={() => router.push('/dashboard')} variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
      </div>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Authenticated
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Not Authenticated
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID</label>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p>{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p>{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Active Status</label>
                <Badge variant={user.isActive ? "default" : "destructive"}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Status */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Onboarding Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Setup Complete</label>
                <Badge variant={user.setupComplete ? "default" : "secondary"}>
                  {user.setupComplete ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Onboarding Complete</label>
                <Badge variant={user.onboardingComplete ? "default" : "secondary"}>
                  {user.onboardingComplete ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Plan Type</label>
                <p>{user.planType || 'Not Set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subscription ID</label>
                <p className="font-mono text-xs">{user.subscriptionId || 'Not Set'}</p>
              </div>
              <div className="col-span-full">
                <label className="text-sm font-medium text-muted-foreground">Onboarding Progress</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.onboardingProgress && user.onboardingProgress.length > 0 ? (
                    user.onboardingProgress.map((step, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {step}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No progress recorded</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organization Information */}
      {user && (user.organizationId || user.complexId || user.clinicId) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Organization Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user.organizationId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Organization ID</label>
                  <p className="font-mono text-xs">{user.organizationId}</p>
                </div>
              )}
              {user.complexId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Complex ID</label>
                  <p className="font-mono text-xs">{user.complexId}</p>
                </div>
              )}
              {user.clinicId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Clinic ID</label>
                  <p className="font-mono text-xs">{user.clinicId}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Actions */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!user.setupComplete && user.role === 'owner' && (
                <>
                  {!user.subscriptionId && !user.planType && (
                    <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                      <p className="text-amber-800 font-medium">No Plan Selected</p>
                      <p className="text-amber-700 text-sm mt-1">
                        You should select a subscription plan to continue setup.
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => router.push('/onboarding/plan-selection')}
                      >
                        Choose Plan
                      </Button>
                    </div>
                  )}
                  
                  {(user.subscriptionId || user.planType) && (
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 font-medium">Ready for Setup</p>
                      <p className="text-blue-700 text-sm mt-1">
                        You have a plan selected. Continue with organization setup.
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => router.push(`/setup?plan=${user.planType || 'clinic'}`)}
                      >
                        Continue Setup
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              {user.setupComplete && (
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium">Setup Complete</p>
                  <p className="text-green-700 text-sm mt-1">
                    Your organization setup is complete. You can access your dashboard.
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => router.push('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registration Debug Component */}
      <RegistrationDebug />

      {/* Raw Session Data */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Session Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
} 