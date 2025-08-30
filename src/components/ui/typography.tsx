import React from 'react';
import { cn } from '@/lib/utils';
import { getTypographyStyle } from '@/lib/design-system';

// Base Typography Component Props
interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

// Heading Component
interface HeadingProps extends TypographyProps {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  weight?: 'semibold' | 'bold' | 'extrabold';
}

export function Heading({ 
  children, 
  className, 
  as, 
  level, 
  weight = 'bold' 
}: HeadingProps) {
  const Component = as || level;
  const style = getTypographyStyle('heading', level, weight);
  
  const baseClasses = 'text-text-primary';
  
  return (
    <Component 
      className={cn(baseClasses, className)} 
      style={style}
    >
      {children}
    </Component>
  );
}

// Title Component
interface TitleProps extends TypographyProps {
  size: '18' | '16' | '14' | '12' | '11' | '10' | '9' | '8';
  weight?: 'regular' | 'semibold' | 'bold';
}

export function Title({ 
  children, 
  className, 
  as = 'div', 
  size, 
  weight = 'regular' 
}: TitleProps) {
  const Component = as;
  const style = getTypographyStyle('title', size, weight);
  
  const baseClasses = 'text-text-primary';
  
  return (
    <Component 
      className={cn(baseClasses, className)} 
      style={style}
    >
      {children}
    </Component>
  );
}

// Paragraph Component
interface ParagraphProps extends TypographyProps {
  size?: '16' | '14' | '12' | '11' | '10';
  weight?: 'regular' | 'semibold' | 'bold';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'muted';
}

export function Paragraph({ 
  children, 
  className, 
  as = 'p', 
  size = '14', 
  weight = 'regular',
  variant = 'primary' 
}: ParagraphProps) {
  const Component = as;
  const style = getTypographyStyle('paragraph', size, weight);
  
  const variantClasses = {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    tertiary: 'text-text-tertiary',
    muted: 'text-text-muted',
  };
  
  return (
    <Component 
      className={cn(variantClasses[variant], className)} 
      style={style}
    >
      {children}
    </Component>
  );
}

// Button Text Component
interface ButtonTextProps extends TypographyProps {
  size?: '14' | '12' | '11';
  weight?: 'medium' | 'semibold';
}

export function ButtonText({ 
  children, 
  className, 
  as = 'span', 
  size = '14', 
  weight = 'medium' 
}: ButtonTextProps) {
  const Component = as;
  const style = getTypographyStyle('button', size, weight);
  
  const baseClasses = 'text-inherit';
  
  return (
    <Component 
      className={cn(baseClasses, className)} 
      style={style}
    >
      {children}
    </Component>
  );
}

// Convenience Components for common use cases

// H1 Component
export function H1({ children, className, weight = 'bold' }: Omit<HeadingProps, 'level' | 'as'>) {
  return (
    <Heading level="h1" weight={weight} className={className}>
      {children}
    </Heading>
  );
}

// H2 Component
export function H2({ children, className, weight = 'bold' }: Omit<HeadingProps, 'level' | 'as'>) {
  return (
    <Heading level="h2" weight={weight} className={className}>
      {children}
    </Heading>
  );
}

// H3 Component
export function H3({ children, className, weight = 'bold' }: Omit<HeadingProps, 'level' | 'as'>) {
  return (
    <Heading level="h3" weight={weight} className={className}>
      {children}
    </Heading>
  );
}

// H4 Component
export function H4({ children, className, weight = 'bold' }: Omit<HeadingProps, 'level' | 'as'>) {
  return (
    <Heading level="h4" weight={weight} className={className}>
      {children}
    </Heading>
  );
}

// H5 Component
export function H5({ children, className, weight = 'bold' }: Omit<HeadingProps, 'level' | 'as'>) {
  return (
    <Heading level="h5" weight={weight} className={className}>
      {children}
    </Heading>
  );
}

// H6 Component
export function H6({ children, className, weight = 'bold' }: Omit<HeadingProps, 'level' | 'as'>) {
  return (
    <Heading level="h6" weight={weight} className={className}>
      {children}
    </Heading>
  );
}

// Body text component (commonly used paragraph)
export function Body({ children, className, variant = 'primary' }: Omit<ParagraphProps, 'as' | 'size' | 'weight'>) {
  return (
    <Paragraph size="14" weight="regular" variant={variant} className={className}>
      {children}
    </Paragraph>
  );
}

// Caption component (small text)
export function Caption({ children, className, variant = 'secondary' }: Omit<ParagraphProps, 'as' | 'size' | 'weight'>) {
  return (
    <Paragraph size="12" weight="regular" variant={variant} className={className}>
      {children}
    </Paragraph>
  );
}

// Label component (for forms)
export function Label({ children, className }: Omit<TitleProps, 'as' | 'size' | 'weight'>) {
  return (
    <Title size="14" weight="semibold" as="label" className={className}>
      {children}
    </Title>
  );
}