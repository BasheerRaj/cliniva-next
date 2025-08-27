'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister, OnboardingData } from '@/hooks/useRegister';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeftIcon, ArrowRightIcon, LoaderIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';
import { SkipButton } from '@/components/onboarding/SkipButton';

const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'owner';
  phone?: string;
  gender?: string;
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  planType: 'company' | 'complex' | 'clinic';
  description?: string;
}

// Remove these functions as we'll use the useRegister hook

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  
  const planType = searchParams.get('planType') as 'company' | 'complex' | 'clinic';
  const planId = searchParams.get('planId');
  
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { registerWithOnboarding, loading } = useRegister();

  useEffect(() => {
    // Retrieve selected plan from localStorage
    const storedPlan = localStorage.getItem('selectedPlan');
    if (storedPlan) {
      try {
        const plan = JSON.parse(storedPlan);
        setSelectedPlan(plan);
      } catch (error) {
        console.error('Error parsing stored plan:', error);
      }
    }

    // If no plan is found in localStorage or URL params, redirect back
    if (!planType || !planId) {
      toast.error('Please select a plan first');
      router.push(`/${locale}/onboarding/plan-selection`);
    }
  }, [planType, planId, router, locale]);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  // Remove the mutation as we'll handle it in onSubmit directly

  const onSubmit = async (data: RegistrationFormData) => {
    if (!planType || !planId) {
      toast.error('Plan information is missing. Please select a plan first.');
      return;
    }

    try {
      const onboardingData: OnboardingData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone || undefined,
        gender: data.gender || undefined,
        planId: planId,
        organizationType: planType,
        organizationName: `${data.firstName} ${data.lastName}'s ${planType}`, // Default name
        organizationDescription: `${planType} managed by ${data.firstName} ${data.lastName}`,
      };

      await registerWithOnboarding(onboardingData);
      toast.success('Account created successfully!');
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      if (error.message.includes('already exists')) {
        toast.error('An account with this email already exists');
        form.setError('email', { message: 'Email already exists' });
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  const handleGoBack = () => {
    router.push(`/${locale}/onboarding/plan-selection`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Skip Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <SkipButton 
          size="sm" 
          variant="ghost"
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
          onSkip={() => {
            router.push('/dashboard');
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
            <p className="text-gray-600">
              Register as organization owner for {selectedPlan?.name || planType} plan
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          {/* Selected Plan Info */}
          {selectedPlan && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">{selectedPlan.name}</h3>
                    <p className="text-sm text-blue-700 capitalize">{selectedPlan.planType} Plan</p>
                  </div>
                  <div className="text-blue-600">
                    ✓ Selected
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Registration Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Owner Account Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="john@example.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="+1 (555) 123-4567" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Gender */}
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Enter a strong password"
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOffIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              placeholder="Confirm your password"
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOffIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Requirements */}
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    Password must contain:
                    <ul className="mt-1 ml-4 list-disc">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter</li>
                      <li>One lowercase letter</li>
                      <li>One number</li>
                      <li>One special character (@$!%*?&)</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 