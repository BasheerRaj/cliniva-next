import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;
  
  // Validate that the incoming locale is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Get messages for this specific locale
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className={locale === 'ar' ? 'rtl' : 'ltr'} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
} 