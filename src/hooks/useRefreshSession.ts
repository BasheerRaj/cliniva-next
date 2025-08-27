import { useSession } from 'next-auth/react';
import { useCallback } from 'react';
import { apiHelpers } from '@/lib/axios';

export const useRefreshSession = () => {
  const { data: session, update } = useSession();

  const refreshSession = useCallback(async () => {
    if (!session?.user?.id) {
      console.log('❌ No session found, cannot refresh');
      return false;
    }

    try {
      console.log('🔄 Refreshing session with fresh user data for user:', session.user.id);
      
      // Force NextAuth to re-fetch user data by calling update with trigger
      const updated = await update();
      
      console.log('✅ Session refreshed successfully:', { 
        setupComplete: updated?.user?.setupComplete,
        organizationId: updated?.user?.organizationId 
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to refresh session:', error);
      return false;
    }
  }, [session, update]);

  const forceRefreshWithLogin = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔄 Force refreshing session by re-authenticating...');
      
      // Get fresh user data from backend
      const loginResponse = await apiHelpers.post('/auth/login', {
        email,
        password
      });

      if (loginResponse.success && loginResponse.user) {
        console.log('✅ Got fresh user data from backend:', loginResponse.user);
        
        // Update the session with fresh data
        const updated = await update({
          user: loginResponse.user,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        });
        
        console.log('✅ Session force-refreshed successfully:', updated);
        return updated;
      } else {
        throw new Error('Failed to get fresh user data');
      }
    } catch (error) {
      console.error('❌ Failed to force refresh session:', error);
      return null;
    }
  }, [update]);

  return {
    refreshSession,
    forceRefreshWithLogin,
    isSessionLoaded: !!session,
    currentUser: session?.user
  };
}; 