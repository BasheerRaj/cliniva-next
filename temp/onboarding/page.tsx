'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LanguageSwitcher, { FloatingLanguageSwitcher } from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { OnboardingRouter } from '@/components/onboarding/OnboardingRouter';

export default function OnboardingPage() {
  const t = useTranslations();

  return (
    <OnboardingRouter>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-blue-50">
        <FloatingLanguageSwitcher />
        
        <div className="bg-background shadow-sm border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <svg width="48" height="48" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M96 48V54.8232C74.6098 57.6732 57.6732 74.6098 54.8232 96H48V48H96ZM48 0V48H0V41.5996H3.2002C24.4078 41.5995 41.5995 24.4078 41.5996 3.2002V0H48Z"
                        fill="#69a3e9"/>
                </svg>
                <h1 className="text-3xl font-bold text-[#69a3e9]">{t('home.title')}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-[#69a3e9] mb-6">
              {t('home.startOrganization')}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Set up your healthcare organization with our comprehensive onboarding process.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#69a3e9] hover:bg-[#4a8ce0] text-white font-semibold px-8 py-6 rounded-xl text-lg"
              >
                <Link href="/onboarding/plan-selection">Start Onboarding</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-[#69a3e9] text-[#69a3e9] hover:bg-[#69a3e9]/10 px-8 py-6 rounded-xl text-lg"
              >
                <Link href="/auth/login">{t('common.signIn')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </OnboardingRouter>
  );
} 