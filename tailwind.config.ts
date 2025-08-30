import { Config } from "tailwindcss";
import { designSystem } from "./src/lib/design-system";

// Tailwind Config Helper with Dark Mode Support
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Static colors from design system
        ...designSystem.colors,
        
        // Theme-aware colors using CSS variables
        background: {
          primary: 'var(--theme-background-primary)',
          secondary: 'var(--theme-background-secondary)',
          tertiary: 'var(--theme-background-tertiary)',
          inverse: 'var(--theme-background-inverse)',
          overlay: 'var(--theme-background-overlay)',
          card: 'var(--theme-background-card)',
          modal: 'var(--theme-background-modal)',
          popover: 'var(--theme-background-popover)',
        },
        text: {
          primary: 'var(--theme-text-primary)',
          secondary: 'var(--theme-text-secondary)',
          tertiary: 'var(--theme-text-tertiary)',
          inverse: 'var(--theme-text-inverse)',
          muted: 'var(--theme-text-muted)',
          accent: 'var(--theme-text-accent)',
        },
        border: {
          light: 'var(--theme-border-light)',
          medium: 'var(--theme-border-medium)',
          dark: 'var(--theme-border-dark)',
          focus: 'var(--theme-border-focus)',
        },
        surface: {
          primary: 'var(--theme-surface-primary)',
          secondary: 'var(--theme-surface-secondary)',
          tertiary: 'var(--theme-surface-tertiary)',
          hover: 'var(--theme-surface-hover)',
          active: 'var(--theme-surface-active)',
        },
        
        // Cliniva brand colors (keeping existing structure but adding design system)
        cliniva: {
          primary: designSystem.colors.primary,
          secondary: designSystem.colors.secondary,
          neutral: designSystem.colors.neutral,
        },
      },
      fontFamily: designSystem.typography.fontFamily,
      fontSize: designSystem.typography.fontSize,
      fontWeight: designSystem.typography.fontWeight,
      letterSpacing: designSystem.typography.letterSpacing,
      spacing: designSystem.spacing,
      borderRadius: designSystem.borderRadius,
      boxShadow: designSystem.boxShadow,
      zIndex: designSystem.zIndex,
      screens: designSystem.breakpoints,
      
      // Custom animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in-from-right 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;