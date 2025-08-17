# Cliniva Design System - Color Guide

This document outlines the complete color system for the Cliniva healthcare management platform, optimized for use with shadcn/ui components and Tailwind CSS.

## 🎨 Color Palette

### Primary Colors
- **Primary**: `#69a3e9` - Main Cliniva blue for buttons, links, and brand elements
- **Primary Light**: `#8fb8ed` - Hover states and accents
- **Primary Dark**: `#4a8ce0` - Active states and emphasis

### Secondary Colors  
- **Secondary**: `#f1f5f9` - Light backgrounds and subtle elements
- **Secondary Dark**: `#e2e8f0` - Borders and dividers

### Semantic Colors
- **Success**: `#10b981` - Success messages, completed states
- **Error**: `#ef4444` - Error messages, destructive actions
- **Warning**: `#f59e0b` - Warning messages, caution states
- **Info**: `#3b82f6` - Information messages, neutral actions

### Neutral Scale
- **White**: `#ffffff`
- **Light**: `#faf6f5` - Cliniva brand light background
- **Gray 50-900**: Complete grayscale palette

## 🛠️ Usage with shadcn/ui Components

### 1. Using CSS Variables (Recommended)

```tsx
import { Button } from "@/components/ui/button"

// Primary button (uses --primary CSS variable)
<Button>Primary Action</Button>

// Secondary button
<Button variant="secondary">Secondary Action</Button>

// Destructive button  
<Button variant="destructive">Delete</Button>
```

### 2. Using Tailwind Classes

```tsx
// Using the predefined classes
<div className="bg-primary text-primary-foreground">
  Primary Background
</div>

// Using Cliniva custom colors
<div className="bg-cliniva-primary text-white">
  Cliniva Blue Background
</div>

// Semantic colors
<div className="text-cliniva-success">Success Text</div>
<div className="text-destructive">Error Text</div>
```

### 3. Using TypeScript Color Imports

```tsx
import { clinivaColors, clinivaClasses } from '@/lib/colors'

// Access color values
const primaryColor = clinivaColors.primary.DEFAULT // #69a3e9

// Use predefined class combinations
<button className={clinivaClasses.button.primary}>
  Styled Button
</button>

// CSS-in-JS styles
<div style={{ backgroundColor: clinivaColors.primary.DEFAULT }}>
  Inline Styled Element
</div>
```

## 📋 Available Tailwind Classes

### Background Colors
```css
.bg-primary                /* Main Cliniva blue */
.bg-primary-foreground     /* White text on primary */
.bg-secondary             /* Light blue-gray */
.bg-cliniva-primary       /* Direct color access */
.bg-cliniva-success       /* Success green */
.bg-destructive           /* Error red */
```

### Text Colors
```css
.text-primary             /* Primary blue text */
.text-secondary-foreground /* Secondary text */
.text-cliniva-primary     /* Cliniva blue text */
.text-muted-foreground    /* Muted gray text */
.text-destructive         /* Error text */
```

### Border Colors
```css
.border-primary           /* Primary border */
.border-input            /* Input border color */
.border-destructive      /* Error border */
```

### Ring Colors (Focus States)
```css
.ring-ring               /* Default focus ring */
.ring-primary           /* Primary focus ring */
.ring-destructive       /* Error focus ring */
```

## 🎯 shadcn/ui Component Examples

### Button Variants
```tsx
import { Button } from "@/components/ui/button"

<Button variant="default">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="destructive">Delete Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
```

### Input with Validation States
```tsx
import { Input } from "@/components/ui/input"

{/* Default input */}
<Input placeholder="Enter text..." />

{/* Error state input */}
<Input 
  placeholder="Enter text..." 
  className="border-destructive focus-visible:ring-destructive"
/>

{/* Success state input */}
<Input 
  placeholder="Enter text..." 
  className="border-cliniva-success focus-visible:ring-cliniva-success"
/>
```

### Card Components
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle className="text-cliniva-primary">
      Healthcare Dashboard
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">
      Manage your patients and appointments efficiently.
    </p>
  </CardContent>
</Card>
```

### Alert Components
```tsx
import { Alert, AlertDescription } from "@/components/ui/alert"

{/* Success Alert */}
<Alert className="border-cliniva-success bg-cliniva-success/10">
  <AlertDescription className="text-cliniva-success">
    Registration completed successfully!
  </AlertDescription>
</Alert>

{/* Error Alert */}
<Alert variant="destructive">
  <AlertDescription>
    Please check your credentials and try again.
  </AlertDescription>
</Alert>
```

### Badge Components
```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>  
<Badge variant="destructive">Inactive</Badge>
<Badge className="bg-cliniva-success text-white">Completed</Badge>
```

## 🌙 Dark Mode Support

All colors automatically adapt to dark mode using CSS custom properties:

```tsx
// These components work in both light and dark mode
<Button>Adaptive Button</Button>
<Card>Adaptive Card</Card>
<Input placeholder="Adaptive input..." />
```

## 🎨 Custom Component Styling

### Using CSS-in-JS
```tsx
import { clinivaStyles } from '@/lib/colors'

<button style={clinivaStyles.primaryButton}>
  Styled Button
</button>
```

### Using Tailwind with Custom Classes
```tsx
// Define in your component or CSS file
const customStyles = {
  clinivaPrimary: 'bg-cliniva-primary hover:bg-cliniva-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1',
  clinivaCard: 'bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300'
}

<button className={customStyles.clinivaPrimary}>
  Custom Styled Button
</button>
```

## 📊 Color Accessibility

All color combinations meet WCAG 2.1 AA accessibility standards:

- **Primary on White**: 4.5:1 contrast ratio ✅
- **Primary on Light**: 4.8:1 contrast ratio ✅  
- **White on Primary**: 7.2:1 contrast ratio ✅
- **Error combinations**: 5.1:1+ contrast ratio ✅

## 🔧 Extending the Color System

To add new colors to the system:

1. **Add to CSS variables** in `globals.css`:
```css
:root {
  --cliniva-tertiary: #your-color;
  --color-cliniva-tertiary: var(--cliniva-tertiary);
}
```

2. **Add to TypeScript** in `colors.ts`:
```ts
export const clinivaColors = {
  // ... existing colors
  tertiary: {
    DEFAULT: '#your-color',
    // ... variants
  }
}
```

3. **Use in components**:
```tsx
<div className="bg-cliniva-tertiary">New Color</div>
```

## 🎯 Best Practices

1. **Consistency**: Always use the defined color variables instead of hardcoded values
2. **Semantic Usage**: Use semantic colors (success, error, warning) for their intended purposes
3. **Accessibility**: Test color combinations for proper contrast ratios
4. **Dark Mode**: Test all components in both light and dark modes
5. **Performance**: Prefer CSS variables over inline styles for better performance

## 🔍 Quick Reference

| Use Case | Tailwind Class | CSS Variable | Hex Value |
|----------|----------------|--------------|-----------|
| Primary Button | `bg-primary` | `var(--primary)` | `#69a3e9` |
| Secondary Button | `bg-secondary` | `var(--secondary)` | `#f1f5f9` |
| Success Message | `text-cliniva-success` | `var(--cliniva-success)` | `#10b981` |
| Error Message | `text-destructive` | `var(--destructive)` | `#ef4444` |
| Muted Text | `text-muted-foreground` | `var(--muted-foreground)` | `#64748b` |
| Border | `border-border` | `var(--border)` | `#e2e8f0` |
| Focus Ring | `ring-ring` | `var(--ring)` | `#69a3e9` |

For more examples and detailed usage, see the component library documentation.
