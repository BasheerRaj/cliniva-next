'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function DebugPage() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      <div className="space-y-2">
        <p><strong>Current Locale:</strong> {locale}</p>
        <p><strong>Current Pathname:</strong> {pathname}</p>
        <p><strong>Direction:</strong> {locale === 'ar' ? 'RTL' : 'LTR'}</p>
        <p><strong>Translation Test:</strong> {t('home.title')}</p>
        <p><strong>Common Sign In:</strong> {t('common.signIn')}</p>
      </div>
    </div>
  );
} 