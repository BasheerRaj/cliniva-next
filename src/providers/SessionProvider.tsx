'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  return (
    <NextAuthSessionProvider 
      refetchInterval={0} // Disable automatic session refetching completely
      refetchOnWindowFocus={false} // Prevent refetch on window focus
      refetchWhenOffline={false} // Don't refetch when offline
      basePath="/api/auth" // Explicitly set the auth API path
    >
      {children}
    </NextAuthSessionProvider>
  );
}; 