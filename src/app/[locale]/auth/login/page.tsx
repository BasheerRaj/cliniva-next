'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result?.ok) {
        // Get updated session and redirect based on role
        window.location.href = '/dashboard';
      } else {
        setError(t('errors.invalidCredentials'));
      }
    } catch (err: any) {
      setError(err.message || t('errors.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Theme Switcher and Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
      
      {/* Left Side - Branding */}
      <div className="w-1/2 bg-[#69a3e9] relative flex items-center justify-center rounded-r-[48px]">
        {/* Decorative Icons */}
        <div className="absolute top-0 right-0 p-6">
          <svg width="96" height="96" viewBox="0 0 105 128" className="opacity-25">
            <path d="M26.8922 0.000382133L41.1584 3.82302C35.1335 50.1443 61.0576 95.0463 104.186 112.989L100.363 127.255L0 100.363L26.8922 0.000382133Z"
                  fill="#FAF6F5" fillOpacity="0.25"/>
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 p-6">
          <svg width="96" height="96" viewBox="0 0 146 146" className="opacity-25">
            <path d="M73.0001 -3.19093e-06L83.3771 -3.64452e-06C87.7114 32.5309 113.469 58.2887 146 62.623L146 73L73.0001 73L73.0001 -3.19093e-06ZM0.000118879 73L73.0001 73L73.0001 146L63.2667 146L63.2667 141.134C63.2667 108.88 37.1198 82.7334 4.86633 82.7334L0.000119305 82.7334L0.000118879 73Z"
                  fill="#FAF6F5" fillOpacity="0.25"/>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 p-6">
          <svg width="96" height="96" viewBox="0 0 181 274" className="opacity-25">
            <path d="M-72.7725 64.5586L-62.3863 46.5691C-1.6499 71.6163 68.7887 52.7422 108.864 0.682616L126.854 11.0688L53.7856 137.627L-72.7725 64.5586ZM-19.2819 264.186L53.7864 137.627L180.345 210.696L170.602 227.57L162.165 222.699C106.248 190.415 34.7468 209.574 2.46313 265.491L-2.40796 273.928L-19.2819 264.186Z"
                  fill="#FAF6F5" fillOpacity="0.25"/>
          </svg>
        </div>

        {/* Brand Content */}
        <div className="flex flex-col items-center gap-16 w-[398px] z-10">
          <div className="text-center">
            <div className="mx-auto mb-8">
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M96 48V54.8232C74.6098 57.6732 57.6732 74.6098 54.8232 96H48V48H96ZM48 0V48H0V41.5996H3.2002C24.4078 41.5995 41.5995 24.4078 41.5996 3.2002V0H48Z"
                      fill="#FAF6F5"/>
              </svg>
            </div>
            <h1 className="text-[#faf6f5] text-[48px] font-semibold leading-none tracking-tight">
              {t('home.title')}
            </h1>
            <p className="text-[#faf6f5] text-xl font-medium mt-4 opacity-90">
              {t('home.heroTitle')} {t('home.heroSubtitle')}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-[#faf6f5]/90 text-lg mb-4 font-medium">
              Welcome Back!
            </p>
            <p className="text-[#faf6f5]/80 text-sm max-w-80 leading-relaxed">
              Sign in to access your healthcare management dashboard and continue providing excellent patient care.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-1/2 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-[#69a3e9] text-4xl font-semibold text-center mb-2">
              {t('auth.loginTitle')}
            </h2>
            <p className="text-gray-600 text-center">
              Enter your credentials to access your account
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                {t('auth.email')} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-9 h-11 focus-visible:ring-[#69a3e9] focus-visible:border-[#69a3e9] border-input"
                  placeholder={t('auth.email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                {t('auth.password')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-9 h-11 focus-visible:ring-[#69a3e9] focus-visible:border-[#69a3e9] border-input"
                  placeholder={t('auth.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-[#69a3e9] focus:ring-[#69a3e9] border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  {t('auth.rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-[#69a3e9] hover:text-blue-500">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#69a3e9] hover:bg-[#4a8ce0] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  {t('common.loading')}
                </>
              ) : (
                t('auth.signIn')
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth.noAccount')}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                asChild
                variant="outline"
                className="w-full h-11 border-[#69a3e9] text-[#69a3e9] hover:bg-[#69a3e9]/10 hover:text-[#69a3e9]"
                size="lg"
              >
                <Link href="/onboarding">{t('home.startOrganization')}</Link>
              </Button>
              
              <Button
                asChild
                variant="ghost"
                className="w-full text-muted-foreground hover:text-[#69a3e9]"
              >
                <Link href="/auth/register">{t('home.registerPatient')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 