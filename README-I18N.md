# Internationalization (i18n) Implementation Guide

This document explains the internationalization setup for the Cliniva Next.js application, supporting Arabic (ar) and English (en) languages.

## Overview

The i18n implementation uses `next-intl`, which is the recommended internationalization library for Next.js applications. It provides:

- Server-side and client-side localization
- Automatic language detection
- Type-safe translations
- RTL (Right-to-Left) support for Arabic
- SEO-friendly locale-based routing

## Installation

To install the required dependencies:

```bash
npm install next-intl
```

## Project Structure

```
src/
├── i18n/
│   ├── config.ts                 # Main i18n configuration
│   └── messages/
│       ├── en.json              # English translations
│       └── ar.json              # Arabic translations
├── app/
│   ├── layout.tsx               # Root layout with i18n provider
│   ├── page.tsx                 # Redirect to default locale
│   └── [locale]/
│       ├── layout.tsx           # Locale-specific layout
│       └── page.tsx             # Localized home page
├── components/
│   └── LanguageSwitcher.tsx     # Language switching component
├── lib/
│   ├── axios.ts                 # API client with language headers
│   └── i18n-helpers.ts          # i18n utility functions
└── middleware.ts                # Enhanced middleware for auth + i18n
```

## Key Features

### 1. Language Switching Components

Two language switcher components are available:

- **LanguageSwitcher**: Dropdown menu for language selection
- **FloatingLanguageSwitcher**: Fixed floating button for quick language toggle

```tsx
import LanguageSwitcher, { FloatingLanguageSwitcher } from '@/components/LanguageSwitcher';

// In your component
<LanguageSwitcher />
<FloatingLanguageSwitcher />
```

### 2. Translation Usage

Use the `useTranslations` hook in client components:

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </div>
  );
}
```

### 3. Backend Integration

The API client automatically includes language headers:

- `Accept-Language`: Current locale (ar/en)
- `X-Locale`: Current locale for backend processing
- `Content-Language`: Current locale for response content

### 4. RTL Support

Arabic language automatically enables RTL (Right-to-Left) layout:

- HTML `dir` attribute is set to "rtl" for Arabic
- CSS classes for RTL-specific styling
- Proper text direction and spacing adjustments

### 5. URL Structure

The application supports locale-prefixed URLs:

- English (default): `/`, `/about`, `/dashboard`
- Arabic: `/ar`, `/ar/about`, `/ar/dashboard`

## Configuration Files

### i18n/config.ts

Main configuration with supported locales and settings:

```typescript
export const locales = ['en', 'ar'] as const;
export const defaultLocale = 'en' as const;
```

### Translation Files

Translation files are organized by namespace:

```json
{
  "common": {
    "signIn": "Sign In",
    "loading": "Loading..."
  },
  "home": {
    "title": "Cliniva",
    "description": "Healthcare Management System"
  }
}
```

## Middleware Integration

The middleware handles both authentication and internationalization:

1. Locale detection and URL rewriting
2. Authentication checks with locale-aware redirects
3. Proper locale preservation in auth flows

## Helper Functions

The `i18n-helpers.ts` file provides utility functions:

- `getCurrentLocale()`: Get current locale from URL
- `createLocalizedPath()`: Create locale-aware URLs
- `getLanguageHeaders()`: Generate API headers
- `isRTL()`: Check if current locale is RTL

## Backend Communication

The backend receives language information through headers:

```typescript
// In your backend middleware/controller
const locale = req.headers['x-locale'] || 'en';
const acceptLanguage = req.headers['accept-language'];
```

## CSS and Styling

RTL support is handled through:

- CSS `[dir="rtl"]` selectors
- Tailwind CSS RTL utilities
- Arabic font family specifications
- Proper spacing and margin adjustments

## Development Guidelines

### Adding New Translations

1. Add translation keys to both `en.json` and `ar.json`
2. Use nested objects for organization
3. Keep translation keys descriptive and consistent

### Creating Localized Components

1. Use `useTranslations()` hook for client components
2. Use `getTranslations()` for server components
3. Test both LTR and RTL layouts

### Testing

1. Test language switching functionality
2. Verify RTL layout correctness
3. Ensure backend receives proper language headers
4. Check URL routing for both locales

## Best Practices

1. **Consistent naming**: Use descriptive translation keys
2. **Namespace organization**: Group related translations
3. **RTL consideration**: Design components to work in both directions
4. **Accessibility**: Ensure proper language attributes
5. **Performance**: Use server-side translations when possible

## Troubleshooting

### Common Issues

1. **Translation not found**: Check if key exists in both language files
2. **RTL layout issues**: Verify CSS classes and direction attributes
3. **API language headers**: Ensure axios interceptor is properly configured
4. **Middleware conflicts**: Check middleware order and conditions

### Debug Tips

1. Use browser dev tools to inspect language headers
2. Check HTML `lang` and `dir` attributes
3. Verify URL locale prefixes
4. Test with browser language preferences

## Future Enhancements

- Add more languages as needed
- Implement language preference persistence
- Add translation management system
- Enhance RTL component library
- Add language-specific date/number formatting 