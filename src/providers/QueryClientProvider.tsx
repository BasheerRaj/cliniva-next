'use client';

import { useState, ReactNode } from 'react';
import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryClientProviderProps {
  children: ReactNode;
}

export const QueryClientProvider = ({ children }: QueryClientProviderProps) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors except 429 (rate limit)
          if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 429) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
      },
      mutations: {
        retry: (failureCount, error: any) => {
          // Don't retry mutations on 4xx errors
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false;
          }
          // Retry once for other errors
          return failureCount < 1;
        },
      },
    },
  }));

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </TanStackQueryClientProvider>
  );
}; 