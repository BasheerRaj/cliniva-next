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
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, ShieldIcon, FileTextIcon, BuildingIcon } from "lucide-react";
import { toast } from 'sonner';
import { ComplexLegalInfoDto } from '@/types/onboarding';
import { saveComplexLegal, validateVatNumber, validateCrNumber } from '@/api/onboardingApiClient';
import { useUniqueValidation, getValidationStatusClass, getValidationMessage } from '@/hooks/useUniqueValidation';

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
  const [useInheritance, setUseInheritance] = useState(false);

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

  const handleInheritanceToggle = () => {
    const newUseInheritance = !useInheritance;
    setUseInheritance(newUseInheritance);
    
    if (newUseInheritance && organizationData) {
      // Apply inheritance by updating form values
      const currentValues = form.getValues();
      form.reset({
        vatNumber: currentValues.vatNumber || organizationData.vatNumber || '',
        crNumber: currentValues.crNumber || organizationData.crNumber || '',
        termsConditionsUrl: currentValues.termsConditionsUrl || organizationData.termsConditionsUrl || '',
        privacyPolicyUrl: currentValues.privacyPolicyUrl || organizationData.privacyPolicyUrl || ''
      });
      
      toast.success('Inherited legal data from organization');
    }
  };

  const onSubmit = async (data: ComplexLegalFormData) => {
    try {
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
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>Complex Setup</span>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-primary font-medium">Legal Information</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Complex Legal Information
        </h1>
        <p className="text-gray-600">
          Provide legal registration details and compliance documentation for your complex
        </p>
      </div>

      {/* Data Inheritance Option */}
      {organizationData && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BuildingIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Inherit from Organization</h3>
                  <p className="text-sm text-blue-700">
                    Copy legal information from "{organizationData.name}"
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={useInheritance ? "default" : "outline"}
                size="sm"
                onClick={handleInheritanceToggle}
              >
                {useInheritance ? 'Using Inherited Data' : 'Use Organization Data'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Registration Information */}
          <Card>
            <Collapsible open={isRegistrationExpanded} onOpenChange={setIsRegistrationExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <ShieldIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Registration Numbers</h2>
                      <p className="text-sm text-gray-600">VAT and commercial registration details</p>
                    </div>
                  </div>
                  {isRegistrationExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* VAT Number */}
                    <FormField
                      control={form.control}
                      name="vatNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VAT Registration Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="1234567890"
                              className="h-12"
                              disabled={isLoading || vatValidation.isChecking}
                            />
                          </FormControl>
                          <div className="text-xs text-gray-500">
                            Enter 10-15 digits for VAT registration number
                          </div>
                          {useInheritance && organizationData?.vatNumber && (
                            <div className="text-xs text-blue-600">
                              Inherited: {organizationData.vatNumber}
                            </div>
                          )}
                          <FormMessage />
                          {vatValidation.isChecking && (
                            <p className="text-sm text-blue-600">Validating VAT number...</p>
                          )}
                          {vatValidation.hasChecked && !vatValidation.isAvailable && (
                            <p className="text-sm text-red-600">{vatValidation.message}</p>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* CR Number */}
                    <FormField
                      control={form.control}
                      name="crNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commercial Registration Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="1234567"
                              className="h-12"
                              disabled={isLoading || crValidation.isChecking}
                            />
                          </FormControl>
                          <div className="text-xs text-gray-500">
                            Enter 7-12 digits for commercial registration number
                          </div>
                          {useInheritance && organizationData?.crNumber && (
                            <div className="text-xs text-blue-600">
                              Inherited: {organizationData.crNumber}
                            </div>
                          )}
                          <FormMessage />
                          {crValidation.isChecking && (
                            <p className="text-sm text-blue-600">Validating CR number...</p>
                          )}
                          {crValidation.hasChecked && !crValidation.isAvailable && (
                            <p className="text-sm text-red-600">{crValidation.message}</p>
                          )}
                        </FormItem>
                      )}
                    />

                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <ShieldIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-900 mb-1">Registration Information</h3>
                        <p className="text-sm text-blue-700">
                          These registration numbers are used for tax and legal compliance for your complex. 
                          You can inherit these from your organization or provide specific numbers for this complex.
                        </p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Legal Documents */}
          <Card>
            <Collapsible open={isDocumentsExpanded} onOpenChange={setIsDocumentsExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileTextIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Legal Documents</h2>
                      <p className="text-sm text-gray-600">Terms of service and privacy policy URLs</p>
                    </div>
                  </div>
                  {isDocumentsExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  {/* Terms and Conditions URL */}
                  <FormField
                    control={form.control}
                    name="termsConditionsUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms and Conditions URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            placeholder="https://yourcomplex.com/terms"
                            className="h-12"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          Link to your complex's terms and conditions document
                        </div>
                        {useInheritance && organizationData?.termsConditionsUrl && (
                          <div className="text-xs text-blue-600">
                            Inherited: {organizationData.termsConditionsUrl}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Privacy Policy URL */}
                  <FormField
                    control={form.control}
                    name="privacyPolicyUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Privacy Policy URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            placeholder="https://yourcomplex.com/privacy"
                            className="h-12"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          Link to your complex's privacy policy document
                        </div>
                        {useInheritance && organizationData?.privacyPolicyUrl && (
                          <div className="text-xs text-blue-600">
                            Inherited: {organizationData.privacyPolicyUrl}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileTextIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-900 mb-1">Legal Compliance</h3>
                        <p className="text-sm text-amber-700">
                          Providing terms and conditions and privacy policy URLs helps ensure 
                          legal compliance for your complex. These can be specific to your complex 
                          or inherited from your organization.
                        </p>
                      </div>
                    </div>
                  </div>

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
                disabled={isLoading || vatValidation.isChecking || crValidation.isChecking}
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