'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProvider as DesignSystemProvider } from './theme-provider';
import * as React from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
  [key: string]: any;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={false}
      themes={['light', 'dark']}
      {...props}
    >
      <DesignSystemProvider
        defaultTheme="light"
        storageKey="cliniva-theme"
      >
        {children}
      </DesignSystemProvider>
    </NextThemesProvider>
  );
}
