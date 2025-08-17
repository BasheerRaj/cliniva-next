import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiHelpers } from '@/lib/axios';
import { signIn } from 'next-auth/react';

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface OnboardingData extends RegisterData {
  planId: string;
  organizationType: 'clinic' | 'complex' | 'company';
  organizationName: string;
  organizationDescription?: string;
}

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const registerPatient = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Register patient
      const result = await apiHelpers.register({
        ...data,
        role: 'patient',
      });

      // Auto-login after successful registration
      const loginResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        throw new Error('Registration successful, but login failed. Please login manually.');
      }

      // Redirect to patient dashboard
      router.push('/dashboard/patient');
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const registerWithOnboarding = async (data: OnboardingData) => {
    setLoading(true);
    setError(null);

    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Step 1: Register owner user
      console.log('🔥 Step 1: Registering owner user...');
      const userResult = await apiHelpers.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'owner',
        phone: data.phone || undefined,
      });

      console.log('✅ User registered successfully:', userResult);

      // Step 2: Create subscription with selected plan
      console.log('🔥 Step 2: Creating subscription...');
      const subscriptionResult = await apiHelpers.post('/subscriptions', {
        userId: userResult.user.id,
        planId: data.planId,
        planType: data.organizationType, // clinic, complex, or company
        status: 'active'
      });

      console.log('✅ Subscription created successfully:', subscriptionResult);

      // Step 3: Auto-login after successful registration
      console.log('🔥 Step 3: Auto-login...');
      const loginResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        throw new Error('Registration successful, but login failed. Please login manually.');
      }

      console.log('✅ Auto-login successful');

      // Step 4: Store onboarding data in sessionStorage for setup page
      const onboardingData = {
        organizationType: data.organizationType,
        organizationName: data.organizationName,
        organizationDescription: data.organizationDescription,
        subscriptionId: subscriptionResult.data.id,
        planId: data.planId
      };
      
      sessionStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      console.log('✅ Onboarding data stored for setup');

      // Step 5: Redirect to setup page
      router.push('/setup');
      
      return { user: userResult, subscription: subscriptionResult };
    } catch (err: any) {
      console.error('💥 Registration failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    registerPatient,
    registerWithOnboarding,
    loading,
    error,
    clearError,
  };
}; 