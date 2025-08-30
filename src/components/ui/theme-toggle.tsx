'use client';

import { useClivinaTheme } from '@/hooks/useClivinaTheme';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export function ThemeToggle({ 
  className = '', 
  variant = 'ghost', 
  size = 'default' 
}: ThemeToggleProps) {
  const { theme, toggleTheme, isLight, isDark } = useClivinaTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={className}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
    >
      {isLight ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">
        {`Switch to ${isLight ? 'dark' : 'light'} theme`}
      </span>
    </Button>
  );
}

// Simple icon-only version
export function ThemeToggleIcon({ className = '' }: { className?: string }) {
  const { toggleTheme, isLight } = useClivinaTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-md border border-border-light hover:bg-surface-hover transition-colors ${className}`}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
    >
      {isLight ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}