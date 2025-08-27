'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Settings, 
  CreditCard, 
  Building, 
  CheckCircle,
  XCircle,
  Clock,
  Database,
  HardDrive
} from 'lucide-react';

export const RegistrationDebug: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [sessionStorageData, setSessionStorageData] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    // Check sessionStorage
    try {
      const onboardingData = sessionStorage.getItem('onboardingData');
      if (onboardingData) {
        setSessionStorageData(JSON.parse(onboardingData));
      }
    } catch (error) {
      console.error('Error reading sessionStorage:', error);
    }

    // Check localStorage
    try {
      const userId = localStorage.getItem('userId');
      const subscriptionId = localStorage.getItem('subscriptionId');
      if (userId || subscriptionId) {
        setLocalStorageData({ userId, subscriptionId });
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading debug data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* User Session Data */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Session Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p>{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subscription ID</label>
                <p className="font-mono text-xs">{user.subscriptionId || 'Not Set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Plan Type</label>
                <p>{user.planType || 'Not Set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Setup Complete</label>
                <Badge variant={user.setupComplete ? "default" : "secondary"}>
                  {user.setupComplete ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SessionStorage Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            SessionStorage Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessionStorageData ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Organization Type</label>
                  <p>{sessionStorageData.organizationType || 'Not Set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Organization Name</label>
                  <p>{sessionStorageData.organizationName || 'Not Set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subscription ID</label>
                  <p className="font-mono text-xs">{sessionStorageData.subscriptionId || 'Not Set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Plan ID</label>
                  <p className="font-mono text-xs">{sessionStorageData.planId || 'Not Set'}</p>
                </div>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  Raw SessionStorage Data
                </summary>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(sessionStorageData, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <p className="text-muted-foreground">No sessionStorage data found</p>
          )}
        </CardContent>
      </Card>

      {/* LocalStorage Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            LocalStorage Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {localStorageData ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="font-mono text-xs">{localStorageData.userId || 'Not Set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subscription ID</label>
                  <p className="font-mono text-xs">{localStorageData.subscriptionId || 'Not Set'}</p>
                </div>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                  Raw LocalStorage Data
                </summary>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(localStorageData, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <p className="text-muted-foreground">No localStorage data found</p>
          )}
        </CardContent>
      </Card>

      {/* Debug Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                sessionStorage.clear();
                localStorage.clear();
                window.location.reload();
              }}
            >
              Clear All Storage & Reload
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                console.log('Current session:', user);
                console.log('SessionStorage:', sessionStorage.getItem('onboardingData'));
                console.log('LocalStorage userId:', localStorage.getItem('userId'));
                console.log('LocalStorage subscriptionId:', localStorage.getItem('subscriptionId'));
              }}
            >
              Log Debug Info to Console
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 