import { locales, defaultLocale, Locale } from '@/i18n/config';

/**
 * Get the current locale from the browser pathname
 */
export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const pathname = window.location.pathname;
  const localeFromPath = pathname.split('/')[1];
  
  return locales.includes(localeFromPath as Locale) 
    ? localeFromPath as Locale 
    : defaultLocale;
}

/**
 * Create locale-aware URL
 */
export function createLocalizedPath(path: string, locale?: Locale): string {
  const targetLocale = locale || getCurrentLocale();
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Don't add locale prefix for default locale unless it's already there
  if (targetLocale === defaultLocale) {
    return `/${cleanPath}`;
  }
  
  return `/${targetLocale}/${cleanPath}`;
}

/**
 * Remove locale prefix from pathname
 */
export function removeLocalePrefix(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
    if (pathname === `/${locale}`) {
      return '/';
    }
  }
  return pathname;
}

/**
 * Get language headers for API requests
 */
export function getLanguageHeaders(locale?: Locale): Record<string, string> {
  const targetLocale = locale || getCurrentLocale();
  
  return {
    'Accept-Language': targetLocale,
    'X-Locale': targetLocale,
    'Content-Language': targetLocale
  };
}

/**
 * Enhanced API client with automatic language headers
 */
export function createLocalizedApiCall(apiFunction: Function) {
  return async (...args: any[]) => {
    const currentLocale = getCurrentLocale();
    
    // If the last argument is an options object, add language headers
    if (args.length > 0 && typeof args[args.length - 1] === 'object') {
      const options = args[args.length - 1];
      options.headers = {
        ...options.headers,
        ...getLanguageHeaders(currentLocale)
      };
    } else {
      // Add options object with language headers
      args.push({
        headers: getLanguageHeaders(currentLocale)
      });
    }
    
    return apiFunction(...args);
  };
}

/**
 * Check if the current page is RTL
 */
export function isRTL(locale?: Locale): boolean {
  const targetLocale = locale || getCurrentLocale();
  return targetLocale === 'ar';
}

/**
 * Get text direction for CSS
 */
export function getTextDirection(locale?: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
} 