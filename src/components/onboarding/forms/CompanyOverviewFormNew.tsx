'use client';

import React, { useState, useRef, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, ChevronDown, ChevronUp, Upload, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/ui/sidebar"
import { colors } from "@/lib/colors"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// Real-time validation will be added later
import { stepApi } from '@/api/validationApi';
import { useUniqueValidation, getValidationStatusClass, getValidationMessage } from '@/hooks/useUniqueValidation';
import { apiHelpers } from '@/lib/axios';
import { useSession } from 'next-auth/react';

// Form validation schema based on backend CreateOrganizationDto
const companyOverviewSchema = z.object({
  name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .trim(),
  legalName: z.string()
    .max(100, 'Legal name must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  registrationNumber: z.string()
    .max(50, 'Registration number must be less than 50 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  yearEstablished: z.number()
    .min(1800, 'Year must be after 1800')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional(),
  logoUrl: z.string()
    .optional()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'Please provide a valid logo URL'
    }),
  ceoName: z.string()
    .max(50, 'CEO name must be less than 50 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  mission: z.string()
    .max(500, 'Mission statement must be less than 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  vision: z.string()
    .max(500, 'Vision statement must be less than 500 characters')
    .trim()
    .optional()
    .or(z.literal('')),
});

type CompanyOverviewFormData = z.infer<typeof companyOverviewSchema>;

interface CompanyOverviewFormProps {
  onNext: (data: CompanyOverviewFormData) => void;
  onPrevious?: () => void;
  initialData?: Partial<CompanyOverviewFormData>;
  currentStep?: number;
  currentSubStep?: string;
}

export const CompanyOverviewFormNew: React.FC<CompanyOverviewFormProps> = ({
  onNext,
  onPrevious,
  initialData,
  currentStep = 1,
  currentSubStep = 'overview'
}) => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOrgData, setIsLoadingOrgData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const form = useForm<CompanyOverviewFormData>({
    resolver: zodResolver(companyOverviewSchema),
    defaultValues: {
      name: initialData?.name || '',
      legalName: initialData?.legalName || '',
      registrationNumber: initialData?.registrationNumber || '',
      yearEstablished: initialData?.yearEstablished, // Keep as number or undefined
      logoUrl: initialData?.logoUrl || '',
      ceoName: initialData?.ceoName || '',
      mission: initialData?.mission || '',
      vision: initialData?.vision || '',
    },
  });

  // Fetch current organization data when component mounts if user has an organization
  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (session?.user?.organizationId && (!initialData || Object.keys(initialData).length === 0)) {
        setIsLoadingOrgData(true);
        try {
          const response = await apiHelpers.getCurrentOrganization();
          if (response.success && response.data) {
            const orgData = response.data;
            
            // Update form with organization data
            form.setValue('name', orgData.name || '');
            form.setValue('legalName', orgData.legalName || '');
            form.setValue('registrationNumber', orgData.registrationNumber || '');
            form.setValue('yearEstablished', orgData.yearEstablished);
            form.setValue('logoUrl', orgData.logoUrl || ''); // This will now have the correct URL
            form.setValue('ceoName', orgData.ceoName || '');
            form.setValue('mission', orgData.mission || '');
            form.setValue('vision', orgData.vision || '');
            
            console.log('✅ Loaded organization data:', orgData);
          }
        } catch (error) {
          console.error('Failed to fetch organization data:', error);
          // Don't show error toast, just log it as this is optional enhancement
        } finally {
          setIsLoadingOrgData(false);
        }
      }
    };

    fetchOrganizationData();
  }, [session?.user?.organizationId, initialData, form]);

  // Update form when initialData changes (when user returns from other forms)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      Object.keys(initialData).forEach(key => {
        const value = initialData[key as keyof typeof initialData];
        if (value !== undefined && value !== null) {
          form.setValue(key as keyof CompanyOverviewFormData, value);
        }
      });
    }
  }, [initialData, form]);

  // Real-time validation for company name uniqueness
  const currentName = form.watch('name') || '';
  const isEditingExistingName = Boolean(
    initialData?.name && 
    initialData.name.trim().length > 0 && 
    currentName.trim().toLowerCase() === initialData.name.trim().toLowerCase()
  );
  
  const companyNameValidation = useUniqueValidation(
    currentName,
    'organizationName',
    800, // 800ms debounce delay
    undefined,
    isEditingExistingName // Skip validation if editing existing organization name
  );

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an SVG, PNG, JPG or GIF file');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      // For now, create a blob URL for preview
      // TODO: Upload to server and get proper URL
      const imageUrl = URL.createObjectURL(file);
      form.setValue('logoUrl', imageUrl);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: CompanyOverviewFormData) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Validate and clean the data
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => {
          if (typeof value === 'string') {
            return value.trim() !== '';
          }
          return value !== undefined && value !== null;
        })
      ) as CompanyOverviewFormData;

      // Ensure required fields are present
      if (!cleanedData.name || cleanedData.name.trim() === '') {
        toast.error('Company name is required');
        setIsSubmitting(false);
        return;
      }

      // Check unique validation before submitting
      if (companyNameValidation.hasChecked && (!companyNameValidation.isValid || !companyNameValidation.isAvailable)) {
        toast.error('Please fix the company name issue before continuing');
        setIsSubmitting(false);
        return;
      }

      // If validation is still in progress, wait for it
      if (companyNameValidation.isChecking) {
        toast.info('Please wait for name validation to complete');
        setIsSubmitting(false);
        return;
      }

      console.log('Submitting company overview data:', cleanedData);
      
      // Try backend validation first
      try {
        const validationResult = await stepApi.saveOrganizationOverview(cleanedData);
        if (validationResult.success && validationResult.canProceed) {
          onNext(cleanedData);
          toast.success(validationResult.message || 'Company overview saved successfully');
          return;
        } else if (!validationResult.success) {
          // Handle specific validation errors from backend
          toast.error(validationResult.message || 'Company overview validation failed');
          setIsSubmitting(false);
          return;
        }
      } catch (error: any) {
        console.error('Backend validation error:', error);
        
        // Handle specific backend validation errors
        if (error.response?.status === 400) {
          const errorMessage = error.response.data?.message || error.message || 'Invalid data provided';
          
          // Handle specific validation error cases
          if (errorMessage.includes('already owns an organization')) {
            toast.error('You already own a company. Each user can only own one organization.');
          } else if (errorMessage.includes('Subscription is not active')) {
            toast.error('Your subscription is not active. Please contact support or update your subscription.');
          } else if (errorMessage.includes('company plan')) {
            toast.error('Company registration requires a company plan subscription. Please upgrade your plan.');
          } else if (errorMessage.includes('User not found')) {
            toast.error('Authentication error. Please log out and log in again.');
          } else if (errorMessage.includes('Invalid Commercial Registration')) {
            toast.error('Commercial Registration number must be exactly 10 digits.');
          } else if (errorMessage.includes('Invalid VAT')) {
            toast.error('VAT number format is invalid. Please enter a valid VAT number.');
          } else if (errorMessage.includes('Invalid email')) {
            toast.error('Please enter a valid email address.');
          } else if (errorMessage.includes('required')) {
            toast.error('Please fill in all required fields.');
          } else {
            toast.error(`Validation Error: ${errorMessage}`);
          }
        } else if (error.response?.status === 401) {
          toast.error('Authentication required. Please log in again.');
        } else if (error.response?.status >= 500) {
          toast.error('Server error. Please try again in a few minutes.');
        } else {
          // For network errors, fall back to local mode
          console.warn('Backend API not available, continuing with form flow:', error);
          onNext(cleanedData);
          toast.success('Company overview data saved locally');
        }
        
        setIsSubmitting(false);
        return;
      }

      // Fallback: proceed locally if backend is unavailable
      onNext(cleanedData);
      toast.success('Company overview data saved locally');
      
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.light.background.primary }}>
      {/* Sidebar */}
      <Sidebar currentStep={currentStep} currentSubStep={currentSubStep} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            className="flex items-center gap-2 text-sm mb-4 hover:opacity-80"
            style={{ color: colors.light.text.secondary }}
            onClick={onPrevious}
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Choosing Plan Page
          </button>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: colors.light.text.primary }}>
            Fill in Company Details
          </h1>
          <p style={{ color: colors.light.text.secondary }}>Company Overview</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-8">
            {/* Logo and Company Name Row */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                  Logo<span style={{ color: colors.light.state.error }}>*</span>
                </label>
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div
                          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            borderColor: colors.light.border.secondary,
                            backgroundColor: colors.light.background.tertiary,
                          }}
                          onClick={triggerFileUpload}
                        >
                          {field.value ? (
                            <div className="flex flex-col items-center">
                              <img src={field.value} alt="Logo" className="w-12 h-12 object-contain mb-2 rounded" />
                              <p className="text-sm" style={{ color: colors.light.brand.secondary }}>
                                Logo uploaded successfully
                              </p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: colors.light.text.secondary }} />
                              <p className="text-sm mb-1" style={{ color: colors.light.brand.secondary }}>
                                {isUploading ? 'Uploading...' : 'Click or Drag file to this area to upload'}
                              </p>
                              <p className="text-xs" style={{ color: colors.light.text.secondary }}>
                                SVG, PNG, JPG or GIF , Maximum file size 2MB.
                              </p>
                            </>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/svg+xml,image/png,image/jpeg,image/gif"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file);
                            }}
                            className="hidden"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                    Company Name<span style={{ color: colors.light.state.error }}>*</span>
                  </label>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter Trade Name"
                            className={`bg-white ${getValidationStatusClass(companyNameValidation)}`}
                            style={{
                              color: colors.light.text.secondary,
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        {/* Unique validation message */}
                        {(() => {
                          const { message, className } = getValidationMessage(companyNameValidation);
                          return message ? (
                            <div className={className}>
                              {companyNameValidation.isChecking && (
                                <span className="inline-flex items-center gap-1">
                                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeLinecap="round"/>
                                  </svg>
                                  {message}
                                </span>
                              )}
                              {!companyNameValidation.isChecking && (
                                <span className="inline-flex items-center gap-1">
                                  {companyNameValidation.isValid && companyNameValidation.isAvailable && (
                                    <svg className="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                  )}
                                  {(!companyNameValidation.isValid || !companyNameValidation.isAvailable) && (
                                    <svg className="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                    </svg>
                                  )}
                                  {message}
                                </span>
                              )}
                            </div>
                          ) : null;
                        })()}
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="legalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter Legal Name"
                            className="bg-white"
                            style={{
                              borderColor: colors.light.border.primary,
                              color: colors.light.text.secondary,
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Year of Establishment */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                  Year of Establishment
                </label>
                <FormField
                  control={form.control}
                  name="yearEstablished"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            value={field.value || ''}
                            name={field.name}
                            onBlur={field.onBlur}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? parseInt(value) : undefined);
                            }}
                            placeholder="Select Date"
                            className="bg-white pr-10"
                            style={{
                              borderColor: colors.light.border.primary,
                              color: colors.light.text.secondary,
                            }}
                          />
                          <Calendar
                            className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2"
                            style={{ color: colors.light.text.secondary }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Company Overview Section */}
            <Card className="bg-white" style={{ borderColor: colors.light.border.primary }}>
              <div className="p-6">
                <div 
                  className="flex items-center justify-between mb-6 cursor-pointer"
                  onClick={() => setIsOverviewOpen(!isOverviewOpen)}
                >
                  <h3 className="text-lg font-medium" style={{ color: colors.light.text.primary }}>
                    Company Overview
                  </h3>
                  {isOverviewOpen ? (
                    <ChevronUp className="w-5 h-5" style={{ color: colors.light.text.secondary }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: colors.light.text.secondary }} />
                  )}
                </div>

                {isOverviewOpen && (
                  <>
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                          Mission
                        </label>
                                          <FormField
                    control={form.control}
                    name="mission"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Enter Mission"
                                  className="bg-white min-h-[100px] resize-none"
                                  style={{
                                    borderColor: colors.light.border.primary,
                                    color: colors.light.text.secondary,
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                          Vision
                        </label>
                        <FormField
                          control={form.control}
                          name="vision"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Enter Vision"
                                  className="bg-white min-h-[100px] resize-none"
                                  style={{
                                    borderColor: colors.light.border.primary,
                                    color: colors.light.text.secondary,
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                          CEO Name
                        </label>
                        <FormField
                          control={form.control}
                          name="ceoName"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter CEO Name"
                                  className="bg-white"
                                  style={{
                                    borderColor: colors.light.border.primary,
                                    color: colors.light.text.secondary,
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                          Registration Number
                        </label>
                        <FormField
                          control={form.control}
                          name="registrationNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter Registration Number"
                                  className="bg-white"
                                  style={{
                                    borderColor: colors.light.border.primary,
                                    color: colors.light.text.secondary,
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Bottom Navigation */}
            <div className="flex justify-between items-center mt-12">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={!onPrevious}
                className="px-8 py-2 bg-transparent hover:opacity-80"
                style={{
                  borderColor: colors.light.border.secondary,
                  color: colors.light.text.secondary,
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: colors.light.brand.primary,
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}; 