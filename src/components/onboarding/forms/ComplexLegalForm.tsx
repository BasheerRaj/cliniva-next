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
import { ChevronLeft, ChevronRight, Shield, FileText, Building, Hash, Globe } from "lucide-react";
import { toast } from 'sonner';
import { ComplexLegalInfoDto } from '@/types/onboarding';
import { saveComplexLegal } from '@/api/onboardingApiClient';
import { useUniqueValidation } from '@/hooks/useUniqueValidation';
import { FormFieldWithIcon } from '@/components/ui/form-field-with-icon';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { ValidationMessage } from '@/components/ui/validation-message';

// Form validation schema matching ComplexLegalInfoDto
const complexLegalSchema = z.object({
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

type ComplexLegalFormData = z.infer<typeof complexLegalSchema>;

interface ComplexLegalFormProps {
  onNext: (data: ComplexLegalInfoDto) => void;
  onPrevious: () => void;
  initialData?: Partial<ComplexLegalInfoDto>;
  organizationData?: any; // For inheritance
  isLoading?: boolean;
}

export const ComplexLegalForm: React.FC<ComplexLegalFormProps> = ({
  onNext,
  onPrevious,
  initialData = {},
  organizationData,
  isLoading = false
}) => {
  const [isRegistrationExpanded, setIsRegistrationExpanded] = useState(true);
  const [isDocumentsExpanded, setIsDocumentsExpanded] = useState(false);
  const [useInheritance] = useState(true); // Always inherit from organization data
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ComplexLegalFormData>({
    resolver: zodResolver(complexLegalSchema),
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



  const onSubmit = async (data: ComplexLegalFormData) => {
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
      ) as ComplexLegalFormData;

      // Check unique validation before submitting
      if (vatValidation.hasChecked && (!vatValidation.isValid || !vatValidation.isAvailable)) {
        toast.error('Please fix the VAT number issue before continuing');
        setIsSubmitting(false);
        return;
      }

      if (crValidation.hasChecked && (!crValidation.isValid || !crValidation.isAvailable)) {
        toast.error('Please fix the CR number issue before continuing');
        setIsSubmitting(false);
        return;
      }

      // If validation is still in progress, wait for it
      if (vatValidation.isChecking || crValidation.isChecking) {
        toast.info('Please wait for validation to complete');
        setIsSubmitting(false);
        return;
      }

      // Transform form data to ComplexLegalInfoDto
      const legalData: ComplexLegalInfoDto = {
        vatNumber: data.vatNumber || undefined,
        crNumber: data.crNumber || undefined,
        termsConditionsUrl: data.termsConditionsUrl || undefined,
        privacyPolicyUrl: data.privacyPolicyUrl || undefined
      };

      console.log('📤 Submitting complex legal:', legalData);

      // Save to backend
      const response = await saveComplexLegal(legalData);
      
      if (response.success) {
        console.log('✅ Complex legal saved successfully:', response);
        toast.success('Complex legal information saved successfully!');
        
        // Pass the response data including entityId to the parent
        onNext({
          ...legalData,
          entityId: response.entityId
        } as any);
      } else {
        throw new Error(response.message || 'Failed to save complex legal information');
      }
    } catch (error: any) {
      console.error('❌ Error saving complex legal info:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('Complex not found')) {
        toast.error('Please complete the complex overview step first before adding legal information.');
      } else if (error.validationError && error.errors) {
        // Handle field-specific validation errors
        error.errors.forEach((err: any) => {
          form.setError(err.field, {
            type: 'manual',
            message: err.message
          });
        });
        toast.error('Please check the form for errors');
      } else {
        toast.error(error.message || 'Failed to save complex legal information');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar would go here if needed */}
      <div className="flex-1 p-8 bg-background">
        {/* Header */}
        <div className="mb-8">
          <button
            className="flex items-center gap-2 text-sm mb-4 text-muted-foreground hover:text-primary transition-colors font-lato"
            onClick={onPrevious}
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Previous Step
          </button>
          <h1 className="text-2xl font-bold mb-2 text-primary font-lato">
            Complex Legal Information
          </h1>
          <p className="text-muted-foreground font-lato">
            Provide legal registration details and compliance documentation for your complex
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
            
            {/* Registration Information */}
            <CollapsibleCard
              title="Registration Numbers"
              isOpen={isRegistrationExpanded}
              onToggle={() => setIsRegistrationExpanded(!isRegistrationExpanded)}
            >
              <div className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* VAT Number */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">
                        VAT Registration Number
                      </label>
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
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isSubmitting || vatValidation.isChecking}
                                />
                              </div>
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              Enter 10-15 digits for VAT registration number
                            </div>
                            <FormMessage />
                            <ValidationMessage validation={vatValidation} />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* CR Number */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">
                        Commercial Registration Number
                      </label>
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
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isSubmitting || crValidation.isChecking}
                                />
                              </div>
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              Enter 7-12 digits for commercial registration number
                            </div>
                            <FormMessage />
                            <ValidationMessage validation={crValidation} />
                          </FormItem>
                        )}
                      />
                    </div>

                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium text-foreground mb-1">Registration Information</h3>
                        <p className="text-sm text-muted-foreground">
                          These registration numbers are used for tax and legal compliance for your complex. 
                          You can inherit these from your organization or provide specific numbers for this complex.
                        </p>
                      </div>
                    </div>
                  </div>

              </div>
            </CollapsibleCard>

            {/* Legal Documents */}
            <CollapsibleCard
              title="Legal Documents"
              isOpen={isDocumentsExpanded}
              onToggle={() => setIsDocumentsExpanded(!isDocumentsExpanded)}
            >
              <div className="space-y-6">

                  {/* Terms and Conditions URL */}
                  <FormFieldWithIcon
                    control={form.control}
                    name="termsConditionsUrl"
                    label="Terms and Conditions URL"
                    placeholder="https://yourcomplex.com/terms"
                    icon={Globe}
                    type="url"
                    disabled={isSubmitting}
                  />

                  {/* Privacy Policy URL */}
                  <FormFieldWithIcon
                    control={form.control}
                    name="privacyPolicyUrl"
                    label="Privacy Policy URL"
                    placeholder="https://yourcomplex.com/privacy"
                    icon={FileText}
                    type="url"
                    disabled={isSubmitting}
                  />

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-yellow-900 mb-1">Legal Compliance</h3>
                        <p className="text-sm text-yellow-700">
                          Providing terms and conditions and privacy policy URLs helps ensure 
                          legal compliance for your complex. These can be specific to your complex 
                          or inherited from your organization.
                        </p>
                      </div>
                    </div>
                  </div>

              </div>
            </CollapsibleCard>

            {/* Bottom Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isSubmitting}
                className="w-full sm:w-auto h-[48px] px-8 font-lato text-primary border-border hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || vatValidation.isChecking || crValidation.isChecking || !form.formState.isValid}
                className="w-full sm:w-auto h-[48px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-lato disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
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