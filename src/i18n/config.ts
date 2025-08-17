import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'ar'] as const;
export const defaultLocale = 'en' as const;

export default getRequestConfig(async ({ locale }) => {
  // Ensure we have a valid locale
  if (!locale || !locales.includes(locale as any)) {
    // This can happen during SSR, just use default silently
    locale = defaultLocale;
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    locale,
    timeZone: 'Asia/Riyadh',
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }
      }
    }
  };
});

export type Locale = (typeof locales)[number]; 