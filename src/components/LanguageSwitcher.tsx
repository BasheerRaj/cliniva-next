'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { locales } from '@/i18n/config';

export default function LanguageSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: string) => {
    // Remove current locale from pathname if it exists
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';
    
    // Always add locale prefix for both languages in the new structure
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    
    router.push(newPath);
    setIsOpen(false);
  };

  const getCurrentLanguageSymbol = () => {
    switch (locale) {
      case 'ar':
        return '🇸🇦';
      case 'en':
      default:
        return '🇺🇸';
    }
  };

  return (
    <div className="relative">
      {/* Main Language Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{width: '100%', height: '100%'}}>
          <rect width="40" height="40" rx="20" className="fill-muted"/>
          <path d="M17.4229 11C17.9325 11 18.3496 11.4171 18.3496 11.9268V13.7705H23.9189C24.4285 13.7705 24.8455 14.1877 24.8457 14.6973C24.8457 15.207 24.4286 15.624 23.9189 15.624H21.4082C21.0004 16.5507 20.1102 18.3677 18.6738 20.1377C19.6114 21.0516 20.7241 21.8358 22.0156 22.2617L23.7764 18.0518C23.9154 17.7091 24.2584 17.4874 24.6289 17.4873C24.9994 17.4873 25.3331 17.7092 25.4814 18.0518L28.5586 25.4014C28.5669 25.4015 28.5673 25.4089 28.5674 25.4102L29.9297 28.6631C30.1243 29.1356 29.9022 29.6823 29.4297 29.877C29.3093 29.9233 29.1887 29.9511 29.0684 29.9512C28.7069 29.9512 28.3641 29.7379 28.2158 29.3857L27.0938 26.6982H22.1729L21.0518 29.3857C20.8479 29.8583 20.3105 30.0813 19.8379 29.8867C19.3653 29.6921 19.1433 29.145 19.3379 28.6631L20.7002 25.4102L21.2979 23.9785C19.7832 23.4474 18.4953 22.5443 17.4141 21.5088C16.0982 22.7783 14.4762 23.8442 12.5117 24.2705C12.4468 24.2798 12.3813 24.2891 12.3164 24.2891C11.8903 24.2889 11.5008 23.9921 11.4082 23.5566C11.2972 23.0563 11.613 22.5653 12.1133 22.4541C13.6977 22.1112 15.0506 21.2125 16.1533 20.1377C14.7169 18.3677 13.8184 16.5415 13.4199 15.624H10.9082C10.3985 15.624 10 15.207 10 14.6973C10.0002 14.1877 10.4172 13.7705 10.9268 13.7705H16.4961V11.9268C16.4961 11.4171 16.9132 11.0001 17.4229 11ZM22.9424 24.8545H26.3154L24.6289 20.8232L22.9424 24.8545ZM15.4678 15.624C15.8848 16.458 16.524 17.598 17.4043 18.7285C18.2754 17.6072 18.9248 16.4673 19.3418 15.624H15.4678Z" 
                className="fill-muted-foreground"/>
        </svg>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 ltr:right-0 rtl:left-0 bg-popover border border-border rounded-2xl shadow-xl z-50 min-w-[140px] backdrop-blur-sm">
          <div className="py-2">
            {locales.map((lang) => (
              <button
                key={lang}
                onClick={() => switchLanguage(lang)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground transition-all duration-200 flex items-center space-x-3 rounded-xl mx-2 first:mt-1 last:mb-1 ${
                  locale === lang
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-popover-foreground'
                }`}
              >
                <span className="text-lg">
                  {lang === 'ar' ? '🇸🇦' : '🇺🇸'}
                </span>
                <span className="font-medium">
                  {lang === 'ar' ? 'العربية' : 'English'}
                </span>
                {locale === lang && (
                  <svg className="w-4 h-4 ml-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export function FloatingLanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchToOppositeLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';
    
    // Always add locale prefix for both languages
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    
    router.push(newPath);
  };

  return (
          <Button
        onClick={switchToOppositeLanguage}
        className="fixed top-1/2 right-4 transform -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg border-2 border-background"
        size="sm"
      >
        <span className="text-lg">
          {locale === 'ar' ? '🇺🇸' : '🇸🇦'}
        </span>
      </Button>
  );
} 