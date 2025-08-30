'use client';

import React, { useState } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, ShieldIcon, FileTextIcon, Hash, Globe, FileText, Shield } from "lucide-react";
import { toast } from 'sonner';
import { OrganizationLegalDto } from '@/types/onboarding';
import { saveOrganizationLegal, validateVatNumber, validateCrNumber } from '@/api/onboardingApiClient';
import { useUniqueValidation, getValidationStatusClass, getValidationMessage } from '@/hooks/useUniqueValidation';

// Form validation schema matching OrganizationLegalDto
const companyLegalSchema = z.object({
  vatNumber: z.string()
    .regex(/^[0-9]{10,15}$/, 'VAT number must be 10-15 digits')
    .optional()
    .or(z.literal('')),
  crNumber: z.string()
    .regex(/^[0-9]{7,12}$/, 'CR number must be 7-12 digits')
    .optional()
    .or(z.literal('')),
  termsConditionsUrl: z.string()
    .optional()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'Please provide a valid terms and conditions URL'
    }),
  privacyPolicyUrl: z.string()
    .optional()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'Please provide a valid privacy policy URL'
    })
});

type CompanyLegalFormData = z.infer<typeof companyLegalSchema>;

interface CompanyLegalFormProps {
  onNext: (data: OrganizationLegalDto) => void;
  onPrevious: () => void;
  initialData?: Partial<OrganizationLegalDto>;
  isLoading?: boolean;
}

export const CompanyLegalForm: React.FC<CompanyLegalFormProps> = ({
  onNext,
  onPrevious,
  initialData = {},
  isLoading = false
}) => {
  const [isRegistrationExpanded, setIsRegistrationExpanded] = useState(true);
  const [isDocumentsExpanded, setIsDocumentsExpanded] = useState(false);

  const form = useForm<CompanyLegalFormData>({
    resolver: zodResolver(companyLegalSchema),
    defaultValues: {
      vatNumber: initialData.vatNumber || '',
      crNumber: initialData.crNumber || '',
      termsConditionsUrl: initialData.termsConditionsUrl || '',
      privacyPolicyUrl: initialData.privacyPolicyUrl || ''
    }
  });

  // Real-time validation for VAT number uniqueness
  const currentVatNumber = form.watch('vatNumber') || '';
  const isEditingExistingVat = Boolean(
    initialData?.vatNumber && 
    initialData.vatNumber.trim().length > 0 && 
    currentVatNumber.trim() === initialData.vatNumber.trim()
  );
  
  const vatValidation = useUniqueValidation(
    currentVatNumber,
    'vatNumber',
    800, // 800ms debounce delay
    undefined,
    isEditingExistingVat // Skip validation if editing existing VAT
  );

  // Real-time validation for CR number uniqueness
  const currentCrNumber = form.watch('crNumber') || '';
  const isEditingExistingCr = Boolean(
    initialData?.crNumber && 
    initialData.crNumber.trim().length > 0 && 
    currentCrNumber.trim() === initialData.crNumber.trim()
  );
  
  const crValidation = useUniqueValidation(
    currentCrNumber,
    'crNumber',
    800, // 800ms debounce delay
    undefined,
    isEditingExistingCr // Skip validation if editing existing CR
  );

  const onSubmit = async (data: CompanyLegalFormData) => {
    try {
      // Transform form data to OrganizationLegalDto
      const legalData: OrganizationLegalDto = {
        vatNumber: data.vatNumber || undefined,
        crNumber: data.crNumber || undefined,
        termsConditionsUrl: data.termsConditionsUrl || undefined,
        privacyPolicyUrl: data.privacyPolicyUrl || undefined
      };

      // Save to backend
      const response = await saveOrganizationLegal(legalData);
      
      if (response.success) {
        toast.success('Legal information saved successfully!');
        onNext(legalData);
      } else {
        throw new Error(response.message || 'Failed to save legal information');
      }
    } catch (error: any) {
      console.error('Error saving company legal info:', error);
      
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
        toast.error(error.message || 'Failed to save legal information');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Main Content */}
      <div className="flex-1 p-8 bg-background">
        {/* Header */}
        <div className="mb-8">
          <button
            className="flex items-center gap-2 text-sm mb-4 text-muted-foreground hover:text-primary transition-colors font-lato"
            onClick={onPrevious}
            type="button"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back to Contact Information
          </button>
          <h1 className="text-2xl font-bold mb-2 text-primary font-lato">
            Legal Information
          </h1>
          <p className="text-muted-foreground font-lato">
            Provide legal registration details and compliance documentation
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
          
            {/* Registration Information */}
            <Card className="bg-background border-border shadow-sm">
              <Collapsible open={isRegistrationExpanded} onOpenChange={setIsRegistrationExpanded}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <ShieldIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-bold text-primary font-lato">Registration Numbers</h2>
                        <p className="text-sm text-muted-foreground font-lato">VAT and commercial registration details</p>
                      </div>
                    </div>
                    {isRegistrationExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* VAT Number */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">VAT Registration Number</label>
                      <FormField
                        control={form.control}
                        name="vatNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <Hash className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="1234567890"
                                  className={`h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground ${getValidationStatusClass(vatValidation)}`}
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading || vatValidation.isChecking}
                                />
                              </div>
                            </FormControl>
                            <div className="text-xs text-muted-foreground font-lato">
                              Enter 10-15 digits for VAT registration number
                            </div>
                            <FormMessage />
                            {/* VAT validation messages */}
                            {(() => {
                              const { message, className } = getValidationMessage(vatValidation);
                              return message ? (
                                <div className={className}>
                                  {vatValidation.isChecking && (
                                    <span className="inline-flex items-center gap-1">
                                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeLinecap="round"/>
                                      </svg>
                                      {message}
                                    </span>
                                  )}
                                  {!vatValidation.isChecking && (
                                    <span className="inline-flex items-center gap-1">
                                      {vatValidation.isValid && vatValidation.isAvailable && (
                                        <svg className="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                        </svg>
                                      )}
                                      {(!vatValidation.isValid || !vatValidation.isAvailable) && (
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

                    {/* CR Number */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">Commercial Registration Number</label>
                      <FormField
                        control={form.control}
                        name="crNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <Shield className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="1234567"
                                  className={`h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground ${getValidationStatusClass(crValidation)}`}
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading || crValidation.isChecking}
                                />
                              </div>
                            </FormControl>
                            <div className="text-xs text-muted-foreground font-lato">
                              Enter 7-12 digits for commercial registration number
                            </div>
                            <FormMessage />
                            {/* CR validation messages */}
                            {(() => {
                              const { message, className } = getValidationMessage(crValidation);
                              return message ? (
                                <div className={className}>
                                  {crValidation.isChecking && (
                                    <span className="inline-flex items-center gap-1">
                                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeLinecap="round"/>
                                      </svg>
                                      {message}
                                    </span>
                                  )}
                                  {!crValidation.isChecking && (
                                    <span className="inline-flex items-center gap-1">
                                      {crValidation.isValid && crValidation.isAvailable && (
                                        <svg className="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                        </svg>
                                      )}
                                      {(!crValidation.isValid || !crValidation.isAvailable) && (
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

                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <ShieldIcon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium text-primary mb-1 font-lato">Registration Information</h3>
                        <p className="text-sm text-primary/80 font-lato">
                          These registration numbers are used for tax and legal compliance. 
                          Make sure to enter accurate information as it will be used for 
                          official documentation and reporting.
                        </p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

            {/* Legal Documents */}
            <Card className="bg-background border-border shadow-sm">
              <Collapsible open={isDocumentsExpanded} onOpenChange={setIsDocumentsExpanded}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <FileTextIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-bold text-primary font-lato">Legal Documents</h2>
                        <p className="text-sm text-muted-foreground font-lato">Terms of service and privacy policy URLs</p>
                      </div>
                    </div>
                    {isDocumentsExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  {/* Terms and Conditions URL */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-primary font-lato">Terms and Conditions URL</label>
                    <FormField
                      control={form.control}
                      name="termsConditionsUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                <FileText className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                              </div>
                              <Input
                                {...field}
                                type="url"
                                placeholder="https://yourcompany.com/terms"
                                className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                style={{
                                  boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                  borderRadius: '8px'
                                }}
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <div className="text-xs text-muted-foreground font-lato">
                            Link to your terms and conditions document
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Privacy Policy URL */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-primary font-lato">Privacy Policy URL</label>
                    <FormField
                      control={form.control}
                      name="privacyPolicyUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                <Globe className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                              </div>
                              <Input
                                {...field}
                                type="url"
                                placeholder="https://yourcompany.com/privacy"
                                className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                style={{
                                  boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                  borderRadius: '8px'
                                }}
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <div className="text-xs text-muted-foreground font-lato">
                            Link to your privacy policy document
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileTextIcon className="h-5 w-5 text-secondary mt-0.5" />
                      <div>
                        <h3 className="font-medium text-secondary mb-1 font-lato">Legal Compliance</h3>
                        <p className="text-sm text-secondary/80 font-lato">
                          Providing terms and conditions and privacy policy URLs helps ensure 
                          legal compliance and builds trust with your patients and partners. 
                          These documents should be publicly accessible.
                        </p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isLoading}
                className="w-full sm:w-auto h-[48px] px-8 font-lato text-primary border-border hover:bg-muted"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button
                type="submit"
                disabled={isLoading || vatValidation.isChecking || crValidation.isChecking}
                className="w-full sm:w-auto h-[48px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-lato disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRightIcon className="h-4 w-4 ml-2" />
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