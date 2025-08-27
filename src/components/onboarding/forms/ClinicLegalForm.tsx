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
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, ShieldIcon, FileTextIcon, BuildingIcon, StethoscopeIcon } from "lucide-react";
import { toast } from 'sonner';
import { ClinicLegalInfoDto } from '@/types/onboarding';
import { saveClinicLegal, validateVatNumber, validateCrNumber } from '@/api/onboardingApiClient';

// Form validation schema matching ClinicLegalInfoDto
const clinicLegalSchema = z.object({
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

type ClinicLegalFormData = z.infer<typeof clinicLegalSchema>;

interface ClinicLegalFormProps {
  onNext: (data: ClinicLegalInfoDto) => void;
  onPrevious: () => void;
  initialData?: Partial<ClinicLegalInfoDto>;
  parentData?: any; // Complex or Organization data for inheritance
  isLoading?: boolean;
  planType?: 'company' | 'complex' | 'clinic';
  formData?: any;
  currentStep?: number;
}

export const ClinicLegalForm: React.FC<ClinicLegalFormProps> = ({
  onNext,
  onPrevious,
  initialData = {},
  parentData,
  isLoading = false
}) => {
  const [isRegistrationExpanded, setIsRegistrationExpanded] = useState(true);
  const [isDocumentsExpanded, setIsDocumentsExpanded] = useState(false);
  const [isValidatingVat, setIsValidatingVat] = useState(false);
  const [isValidatingCr, setIsValidatingCr] = useState(false);
  const [useInheritance, setUseInheritance] = useState(false);

  const form = useForm<ClinicLegalFormData>({
    resolver: zodResolver(clinicLegalSchema),
    defaultValues: {
      vatNumber: initialData.vatNumber || '',
      crNumber: initialData.crNumber || '',
      termsConditionsUrl: initialData.termsConditionsUrl || '',
      privacyPolicyUrl: initialData.privacyPolicyUrl || ''
    }
  });

  const handleInheritanceToggle = () => {
    const newUseInheritance = !useInheritance;
    setUseInheritance(newUseInheritance);
    
    if (newUseInheritance && parentData) {
      // Apply inheritance by updating form values
      const currentValues = form.getValues();
      form.reset({
        vatNumber: currentValues.vatNumber || parentData.vatNumber || '',
        crNumber: currentValues.crNumber || parentData.crNumber || '',
        termsConditionsUrl: currentValues.termsConditionsUrl || parentData.termsConditionsUrl || '',
        privacyPolicyUrl: currentValues.privacyPolicyUrl || parentData.privacyPolicyUrl || ''
      });
      
      toast.success(`Inherited legal data from ${parentData.type === 'complex' ? 'complex' : 'organization'}`);
    }
  };

  const validateVatNumberField = async (vatNumber: string) => {
    if (!vatNumber || vatNumber.length < 10) return;
    
    setIsValidatingVat(true);
    try {
      const result = await validateVatNumber(vatNumber);
      if (!result.isUnique) {
        form.setError('vatNumber', {
          type: 'manual',
          message: 'This VAT number is already registered'
        });
      } else {
        form.clearErrors('vatNumber');
      }
    } catch (error) {
      console.error('VAT validation failed:', error);
    } finally {
      setIsValidatingVat(false);
    }
  };

  const validateCrNumberField = async (crNumber: string) => {
    if (!crNumber || crNumber.length < 7) return;
    
    setIsValidatingCr(true);
    try {
      const result = await validateCrNumber(crNumber);
      if (!result.isUnique) {
        form.setError('crNumber', {
          type: 'manual',
          message: 'This CR number is already registered'
        });
      } else {
        form.clearErrors('crNumber');
      }
    } catch (error) {
      console.error('CR validation failed:', error);
    } finally {
      setIsValidatingCr(false);
    }
  };

  const onSubmit = async (data: ClinicLegalFormData) => {
    try {
      // Transform form data to ClinicLegalInfoDto
      const legalData: ClinicLegalInfoDto = {
        vatNumber: data.vatNumber || undefined,
        crNumber: data.crNumber || undefined,
        termsConditionsUrl: data.termsConditionsUrl || undefined,
        privacyPolicyUrl: data.privacyPolicyUrl || undefined
      };

      // Save to backend
      const response = await saveClinicLegal(legalData);
      
      if (response.success) {
        toast.success('Clinic legal information saved successfully!');
        onNext(legalData);
      } else {
        throw new Error(response.message || 'Failed to save clinic legal information');
      }
    } catch (error: any) {
      console.error('Error saving clinic legal info:', error);
      
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
        toast.error(error.message || 'Failed to save clinic legal information');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>Clinic Setup</span>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-primary font-medium">Legal Information</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Clinic Legal Information
        </h1>
        <p className="text-gray-600">
          Provide legal registration details and compliance documentation for your clinic
        </p>
      </div>

      {/* Data Inheritance Option */}
      {parentData && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BuildingIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">
                    Inherit from {parentData.type === 'complex' ? 'Complex' : 'Organization'}
                  </h3>
                  <p className="text-sm text-blue-700">
                    Copy legal information from "{parentData.name}"
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={useInheritance ? "default" : "outline"}
                size="sm"
                onClick={handleInheritanceToggle}
              >
                {useInheritance ? 'Using Inherited Data' : `Use ${parentData.type === 'complex' ? 'Complex' : 'Organization'} Data`}
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
                              onBlur={() => validateVatNumberField(field.value || '')}
                              disabled={isLoading || isValidatingVat}
                            />
                          </FormControl>
                          <div className="text-xs text-gray-500">
                            Enter 10-15 digits for VAT registration number
                          </div>
                          {useInheritance && parentData?.vatNumber && (
                            <div className="text-xs text-blue-600">
                              Inherited: {parentData.vatNumber}
                            </div>
                          )}
                          <FormMessage />
                          {isValidatingVat && (
                            <p className="text-sm text-blue-600">Validating VAT number...</p>
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
                              onBlur={() => validateCrNumberField(field.value || '')}
                              disabled={isLoading || isValidatingCr}
                            />
                          </FormControl>
                          <div className="text-xs text-gray-500">
                            Enter 7-12 digits for commercial registration number
                          </div>
                          {useInheritance && parentData?.crNumber && (
                            <div className="text-xs text-blue-600">
                              Inherited: {parentData.crNumber}
                            </div>
                          )}
                          <FormMessage />
                          {isValidatingCr && (
                            <p className="text-sm text-blue-600">Validating CR number...</p>
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
                          These registration numbers are used for tax and legal compliance for your clinic. 
                          You can inherit these from your parent entity or provide specific numbers for this clinic.
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
                            placeholder="https://yourclinic.com/terms"
                            className="h-12"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          Link to your clinic's terms and conditions document
                        </div>
                        {useInheritance && parentData?.termsConditionsUrl && (
                          <div className="text-xs text-blue-600">
                            Inherited: {parentData.termsConditionsUrl}
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
                            placeholder="https://yourclinic.com/privacy"
                            className="h-12"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          Link to your clinic's privacy policy document
                        </div>
                        {useInheritance && parentData?.privacyPolicyUrl && (
                          <div className="text-xs text-blue-600">
                            Inherited: {parentData.privacyPolicyUrl}
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
                          legal compliance for your clinic. These can be specific to your clinic 
                          or inherited from your parent organization/complex.
                        </p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Medical License Information */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <StethoscopeIcon className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900 mb-1">Medical License</h3>
                  <p className="text-sm text-green-700">
                    Medical license information was captured in the clinic overview step. 
                    You can update license details in the clinic settings after setup is complete.
                  </p>
                </div>
              </div>
            </CardContent>
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
                disabled={isLoading || isValidatingVat || isValidatingCr}
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