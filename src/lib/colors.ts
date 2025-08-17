/**
 * Cliniva Design System - Color Palette
 * Comprehensive color system extracted from the Cliniva brand guidelines
 */

export const clinivaColors = {
  // Primary Brand Colors
  primary: {
    DEFAULT: '#69a3e9', // Main Cliniva Blue
    light: '#8fb8ed',   // Lighter shade for hover states
    dark: '#4a8ce0',    // Darker shade for active states
    foreground: '#ffffff', // Text color on primary backgrounds
  },

  // Secondary Colors
  secondary: {
    DEFAULT: '#f1f5f9',   // Light blue-gray
    dark: '#e2e8f0',      // Darker secondary
    foreground: '#334155', // Text color on secondary backgrounds
  },

  // Neutral Colors
  neutral: {
    white: '#ffffff',
    light: '#faf6f5',    // Cliniva light background
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic Colors
  success: {
    DEFAULT: '#10b981',
    light: '#34d399',
    dark: '#059669',
    foreground: '#ffffff',
  },
  
  error: {
    DEFAULT: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    foreground: '#ffffff',
  },
  
  warning: {
    DEFAULT: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    foreground: '#ffffff',
  },
  
  info: {
    DEFAULT: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    foreground: '#ffffff',
  },

  // Background Gradients (for use in Tailwind classes)
  gradients: {
    primary: 'from-blue-50 via-white to-blue-50',
    hero: 'from-blue-50 to-indigo-100',
    card: 'from-white to-gray-50',
  },

  // Shadow Colors (for custom shadows)
  shadow: {
    primary: '0 4px 14px 0 rgba(105, 163, 233, 0.15)',
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    hover: '0 10px 25px -3px rgba(105, 163, 233, 0.2)',
  },
} as const;

// Export individual color categories for easier imports
export const {
  primary,
  secondary,
  neutral,
  success,
  error,
  warning,
  info,
  gradients,
  shadow,
} = clinivaColors;

// Tailwind CSS class helpers
export const clinivaClasses = {
  // Primary button styles
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-cliniva-primary-dark',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-cliniva-secondary-dark',
    success: 'bg-cliniva-success text-white hover:bg-cliniva-success/90',
    error: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  
  // Input styles
  input: {
    default: 'border-input bg-background focus:ring-ring focus:border-ring',
    error: 'border-destructive focus:ring-destructive focus:border-destructive',
  },
  
  // Card styles
  card: {
    default: 'bg-card text-card-foreground border-border',
    hover: 'hover:shadow-lg transition-shadow duration-200',
  },
  
  // Text colors
  text: {
    primary: 'text-foreground',
    secondary: 'text-muted-foreground',
    brand: 'text-cliniva-primary',
    success: 'text-cliniva-success',
    error: 'text-destructive',
    warning: 'text-cliniva-warning',
  },
} as const;

// Color palette for shadcn/ui theme configuration
export const shadcnTheme = {
  light: {
    background: '#ffffff',
    foreground: '#0f172a',
    card: '#ffffff',
    'card-foreground': '#0f172a',
    popover: '#ffffff',
    'popover-foreground': '#0f172a',
    primary: '#69a3e9',
    'primary-foreground': '#ffffff',
    secondary: '#f1f5f9',
    'secondary-foreground': '#334155',
    muted: '#f1f5f9',
    'muted-foreground': '#64748b',
    accent: '#8fb8ed',
    'accent-foreground': '#0f172a',
    destructive: '#ef4444',
    'destructive-foreground': '#ffffff',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#69a3e9',
  },
  dark: {
    background: '#0f172a',
    foreground: '#f1f5f9',
    card: '#1e293b',
    'card-foreground': '#f1f5f9',
    popover: '#1e293b',
    'popover-foreground': '#f1f5f9',
    primary: '#8fb8ed',
    'primary-foreground': '#0f172a',
    secondary: '#1e293b',
    'secondary-foreground': '#f1f5f9',
    muted: '#1e293b',
    'muted-foreground': '#94a3b8',
    accent: '#1e293b',
    'accent-foreground': '#f1f5f9',
    destructive: '#f87171',
    'destructive-foreground': '#f1f5f9',
    border: '#1e293b',
    input: '#1e293b',
    ring: '#8fb8ed',
  },
} as const;

// Utility function to get color values
export function getClivinaColor(colorPath: string): string {
  const keys = colorPath.split('.');
  let result: any = clinivaColors;
  
  for (const key of keys) {
    result = result?.[key];
  }
  
  return typeof result === 'string' ? result : '';
}

// CSS-in-JS styles for direct use
export const clinivaStyles = {
  primaryButton: {
    backgroundColor: primary.DEFAULT,
    color: primary.foreground,
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.5rem',
    fontWeight: '600',
    transition: 'all 0.2s ease-in-out',
    boxShadow: shadow.primary,
    '&:hover': {
      backgroundColor: primary.dark,
      boxShadow: shadow.hover,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&:disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
  
  card: {
    backgroundColor: neutral.white,
    borderRadius: '0.75rem',
    padding: '2rem',
    boxShadow: shadow.card,
    border: `1px solid ${neutral[200]}`,
    '&:hover': {
      boxShadow: shadow.hover,
      transform: 'translateY(-2px)',
    },
  },
} as const;

export default clinivaColors;
