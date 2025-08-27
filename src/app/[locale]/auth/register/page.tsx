'use client';

import { useState } from 'react';
import { useRegister } from '@/hooks/useRegister';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
  });
  
  const { registerPatient, loading, error } = useRegister();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await registerPatient(formData);
      // Registration successful, user will be redirected automatically
    } catch (err) {
      // Error is handled by the hook
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
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
              <Link
                href="/auth/login"
                className="text-[#69a3e9] hover:text-blue-600 font-medium transition-colors"
              >
                {t('common.signIn')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-[#69a3e9] mb-4">
              {t('auth.registerTitle')}
            </h2>
            <p className="text-gray-600">
              Create your patient account to access healthcare services
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.hasAccount')}{' '}
            <Link
              href="/auth/login"
              className="font-medium text-[#69a3e9] hover:text-[#4a8ce0] transition-colors"
            >
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="pt-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
                  {t('auth.firstName')}
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="h-11 focus-visible:ring-[#69a3e9] focus-visible:border-[#69a3e9]"
                  placeholder={t('auth.firstName')}
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
                  {t('auth.lastName')}
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="h-11 focus-visible:ring-[#69a3e9] focus-visible:border-[#69a3e9]"
                  placeholder={t('auth.lastName')}
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                {t('auth.email')}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="h-11 focus-visible:ring-[#69a3e9] focus-visible:border-[#69a3e9]"
                placeholder={t('auth.email')}
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                {t('auth.phone')}
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                className="h-11 focus-visible:ring-[#69a3e9] focus-visible:border-[#69a3e9]"
                placeholder={t('auth.phone')}
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-foreground">
                  Date of Birth
                </label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  className="h-11 focus-visible:ring-[#69a3e9] focus-visible:border-[#69a3e9]"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-foreground">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="mt-1 h-11 appearance-none relative block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-[#69a3e9] focus:border-[#69a3e9]"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                {t('auth.password')}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="h-11 focus-visible:ring-[#69a3e9] focus-visible:border-[#69a3e9]"
                placeholder={t('auth.password')}
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                {t('auth.confirmPassword')}
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="h-11 focus-visible:ring-[#69a3e9] focus-visible:border-[#69a3e9]"
                placeholder={t('auth.confirmPassword')}
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
          </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#69a3e9] hover:bg-[#4a8ce0] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  {t('common.loading')}
                </>
              ) : (
                t('auth.signUp')
              )}
            </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Are you a healthcare provider?{' '}
                <Link
                  href="/onboarding/plan-selection"
                  className="font-medium text-[#69a3e9] hover:text-[#4a8ce0] transition-colors"
                >
                  {t('home.startOrganization')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 