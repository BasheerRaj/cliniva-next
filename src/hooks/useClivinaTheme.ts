'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useTheme as useDesignSystemTheme } from '@/providers/theme-provider';
import { designSystem, Theme, getColor, getSpacing, getFontSize, getBreakpoint } from '@/lib/design-system';

/**
 * Unified theme hook that combines next-themes with our design system
 * Provides seamless integration between system theme detection and design system colors
 */
export function useClivinaTheme() {
  const nextTheme = useNextTheme();
  const designSystemTheme = useDesignSystemTheme();

  // Get the current theme, defaulting to light if undefined
  const currentTheme = (nextTheme.theme || 'light') as Theme;
  
  // Get design system colors for current theme
  const colors = designSystem.themes[currentTheme];

  return {
    // Next-themes properties
    theme: currentTheme,
    setTheme: nextTheme.setTheme,
    systemTheme: nextTheme.systemTheme as Theme,
    resolvedTheme: nextTheme.resolvedTheme as Theme,
    
    // Design system properties
    colors,
    designSystem,
    
    // Utility functions
    getColor,
    getSpacing,
    getFontSize,
    getBreakpoint,
    
    // Combined utilities
    toggleTheme: () => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      nextTheme.setTheme(newTheme);
    },
    
    // Check if theme matches
    isLight: currentTheme === 'light',
    isDark: currentTheme === 'dark',
    
    // Get theme-specific value
    getThemeValue: <T>(lightValue: T, darkValue: T): T => {
      return currentTheme === 'dark' ? darkValue : lightValue;
    },
  };
}

/**
 * Hook to get design system colors for current theme
 */
export function useColors() {
  const { colors } = useClivinaTheme();
  return colors;
}

/**
 * Hook to get design system utilities
 */
export function useDesignSystem() {
  const { designSystem, getColor, getSpacing, getFontSize, getBreakpoint } = useClivinaTheme();
  
  return {
    designSystem,
    getColor,
    getSpacing,
    getFontSize,
    getBreakpoint,
  };
}