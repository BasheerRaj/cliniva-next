'use client';

import React, { useState } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogoUpload } from '@/components/ui/logo-upload';
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeftIcon, ChevronRightIcon, Upload, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { toast } from 'sonner';
import { OrganizationOverviewDto } from '@/types/onboarding';
import { saveOrganizationOverview, validateOrganizationName } from '@/api/onboardingApiClient';

// Form validation schema matching new flattened OrganizationOverviewDto
const companyOverviewSchema = z.object({
  // Required fields
  name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .trim(),
  
  // Optional basic info
  legalName: z.string()
    .max(100, 'Legal name must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  logoUrl: z.string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val === '' ||
        z.string().url().safeParse(val).success ||
        val.startsWith('/uploads/'),
      {
        message: 'Please provide a valid logo URL'
      }
    ),
  website: z.string()
    .optional()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'Please provide a valid website URL (e.g., https://example.com)'
    }),
    
  // Flattened business profile fields (no nested businessProfile object)
  yearEstablished: z.number()
    .min(1800, 'Year must be after 1800')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional(),
  mission: z.string()
    .max(500, 'Mission statement must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  vision: z.string()
    .max(500, 'Vision statement must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  overview: z.string()
    .max(1000, 'Overview must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  goals: z.string()
    .max(1000, 'Goals must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  ceoName: z.string()
    .max(50, 'CEO name must be less than 50 characters')
    .trim()
    .optional()
    .or(z.literal(''))
});

type CompanyOverviewFormData = z.infer<typeof companyOverviewSchema>;

interface CompanyOverviewFormProps {
  onNext: (data: OrganizationOverviewDto) => void;
  onPrevious: () => void;
  initialData?: Partial<OrganizationOverviewDto>;
  isLoading?: boolean;
}

export const CompanyOverviewForm: React.FC<CompanyOverviewFormProps> = ({
  onNext,
  onPrevious,
  initialData = {},
  isLoading = false
}) => {
  const [isValidatingName, setIsValidatingName] = useState(false);
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] = useState(false);
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true);

  const form = useForm<CompanyOverviewFormData>({
    resolver: zodResolver(companyOverviewSchema),
    defaultValues: {
      name: initialData.name || '',
      legalName: initialData.legalName || '',
      logoUrl: initialData.logoUrl || '',
      website: initialData.website || '',
      // Flattened fields from business profile
      yearEstablished: initialData.yearEstablished,
      mission: initialData.mission || '',
      vision: initialData.vision || '',
      overview: initialData.overview || '',
      goals: initialData.goals || '',
      ceoName: initialData.ceoName || ''
    }
  });

  const validateCompanyName = async (name: string) => {
    if (!name || name.length < 2) return;
    
    setIsValidatingName(true);
    try {
      const result = await validateOrganizationName(name);
      if (!result.isAvailable) {
        form.setError('name', {
          type: 'manual',
          message: 'This organization name is already taken'
        });
      } else {
        form.clearErrors('name');
      }
    } catch (error) {
      console.error('Name validation failed:', error);
      // Don't show error to user for validation failures
    } finally {
      setIsValidatingName(false);
    }
  };

  const onSubmit = async (data: CompanyOverviewFormData) => {
    try {
      // Transform form data to OrganizationOverviewDto (already matches)
      const organizationData: OrganizationOverviewDto = {
        name: data.name,
        legalName: data.legalName || undefined,
        logoUrl: data.logoUrl || undefined,
        website: data.website || undefined,
        // Flattened business profile fields
        yearEstablished: data.yearEstablished,
        mission: data.mission || undefined,
        vision: data.vision || undefined,
        overview: data.overview || undefined,
        goals: data.goals || undefined,
        ceoName: data.ceoName || undefined
      };

      // Save to backend
      const response = await saveOrganizationOverview(organizationData);
      
      if (response.success) {
        toast.success('Company overview saved successfully!');
        onNext(organizationData);
      } else {
        throw new Error(response.message || 'Failed to save organization overview');
      }
    } catch (error: any) {
      console.error('Error saving company overview:', error);
      
      if (error.validationError && error.errors) {
        // Handle field-specific validation errors
        error.errors.forEach((err: any) => {
          form.setError(err.field, {
            type: 'manual',
            message: err.message
          });
        });
        toast.error('Please check the form for errors');
      } else {
        toast.error(error.message || 'Failed to save company overview');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>Company Setup</span>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-primary font-medium">Overview</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tell us about your company
        </h1>
        <p className="text-gray-600">
          Provide basic information about your organization to get started
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Information Section */}
          <Card>
            <Collapsible open={isBasicInfoExpanded} onOpenChange={setIsBasicInfoExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                    <p className="text-sm text-gray-600">Essential company details</p>
                  </div>
                  {isBasicInfoExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">
                  
                  {/* Company Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Company Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your company name"
                            className="h-12"
                            onBlur={() => validateCompanyName(field.value)}
                            disabled={isLoading || isValidatingName}
                          />
                        </FormControl>
                        <FormMessage />
                        {isValidatingName && (
                          <p className="text-sm text-blue-600">Checking availability...</p>
                        )}
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Legal Name */}
                    <FormField
                      control={form.control}
                      name="legalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legal Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Official legal name"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Year Established */}
                    <FormField
                      control={form.control}
                      name="yearEstablished"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Established</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 2020"
                              className="h-12"
                              disabled={isLoading}
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value ? parseInt(value) : undefined);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company Logo */}
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Logo</FormLabel>
                          <FormControl>
                            <LogoUpload
                              value={field.value || ''}
                              onChange={field.onChange}
                              disabled={isLoading}
                              placeholder="Upload your company logo"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Website */}
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://yourcompany.com"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* CEO Name */}
                  <FormField
                    control={form.control}
                    name="ceoName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEO/Director Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Name of CEO or Director"
                            className="h-12"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Business Profile Section */}
          <Card>
            <Collapsible open={isBusinessProfileExpanded} onOpenChange={setIsBusinessProfileExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Business Profile</h2>
                    <p className="text-sm text-gray-600">Mission, vision, and company description</p>
                  </div>
                  {isBusinessProfileExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  {/* Company Overview */}
                  <FormField
                    control={form.control}
                    name="overview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Overview</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your company's background and what you do..."
                            className="min-h-[120px] resize-none"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          {field.value?.length || 0}/1000 characters
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Company Goals */}
                  <FormField
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Goals</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What are your company's main goals and objectives?"
                            className="min-h-[120px] resize-none"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          {field.value?.length || 0}/1000 characters
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mission Statement */}
                  <FormField
                    control={form.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission Statement</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What is your company's mission?"
                            className="min-h-[100px] resize-none"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          {field.value?.length || 0}/500 characters
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Vision Statement */}
                  <FormField
                    control={form.control}
                    name="vision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vision Statement</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What is your company's vision for the future?"
                            className="min-h-[100px] resize-none"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          {field.value?.length || 0}/500 characters
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={isLoading || isValidatingName || !form.formState.isValid}
                className="flex items-center gap-2 min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

        </form>
      </Form>
    </div>
  );
};