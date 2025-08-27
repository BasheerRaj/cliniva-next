'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  FileText, 
  Upload, 
  Check, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

// Import validation schema
import { companyLegalSchema } from '@/lib/validations/company';

// Import types
import { CompanyLegal as CompanyLegalData } from '@/types/onboarding/company';

// Import hooks
import { useOnboardingStore, useOnboardingNavigation } from '@/hooks/onboarding/useOnboardingStore';
import { useVatNumberValidation, useCrNumberValidation } from '@/hooks/onboarding/api/useUniquenessValidation';
import { useDocumentUpload } from '@/hooks/onboarding/api/useFileUpload';
import { useOnboardingSubmission } from '@/hooks/onboarding/api/useOnboardingSubmission';

// Import components
import { DocumentUpload } from '@/components/ui/file-upload';

interface CompanyLegalProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: (data: CompanyLegalData) => void;
  onComplete?: () => void;
  className?: string;
}

export const CompanyLegal: React.FC<CompanyLegalProps> = ({
  onNext,
  onPrevious,
  onSave,
  onComplete,
  className
}) => {
  const { companyData, updateCompanyData, markSubStepCompleted, markStepCompleted, planType } = useOnboardingStore();
  const { goToNextSubStep, goToPreviousSubStep, goToNextStep } = useOnboardingNavigation();
  
  // Local state for document handling
  const [documentType, setDocumentType] = useState<'terms' | 'privacy' | null>(null);
  
  // Validation hooks
  const vatValidation = useVatNumberValidation();
  const crValidation = useCrNumberValidation();
  
  // Submission hook
  const onboardingSubmission = useOnboardingSubmission({
    onSuccess: (data) => {
      console.log('Onboarding completed successfully:', data);
      // Handle successful completion (redirect to dashboard, etc.)
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error) => {
      console.error('Onboarding submission failed:', error);
    }
  });
  const documentUpload = useDocumentUpload({
    onSuccess: (result) => {
      if (documentType === 'terms') {
        setValue('termsConditionsUrl', result.url);
        toast.success('Terms & Conditions uploaded successfully!');
      } else if (documentType === 'privacy') {
        setValue('privacyPolicyUrl', result.url);
        toast.success('Privacy Policy uploaded successfully!');
      }
      setDocumentType(null);
    },
    onError: (error) => {
      toast.error('Document upload failed', {
        description: error
      });
      setDocumentType(null);
    }
  });

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, dirtyFields }
  } = useForm<CompanyLegalData>({
    resolver: yupResolver(companyLegalSchema) as any,
    defaultValues: {
      vatNumber: companyData.legal?.vatNumber || '',
      crNumber: companyData.legal?.crNumber || '',
      termsConditionsUrl: companyData.legal?.termsConditionsUrl || '',
      privacyPolicyUrl: companyData.legal?.privacyPolicyUrl || ''
    },
    mode: 'onChange'
  });

  // Watch form values
  const watchedVatNumber = watch('vatNumber');
  const watchedCrNumber = watch('crNumber');
  const watchedTermsUrl = watch('termsConditionsUrl');
  const watchedPrivacyUrl = watch('privacyPolicyUrl');

  // Validate VAT number when it changes
  useEffect(() => {
    if (watchedVatNumber && watchedVatNumber.length >= 7) {
      vatValidation.validateVat(watchedVatNumber);
    }
  }, [watchedVatNumber]);

  // Validate CR number when it changes
  useEffect(() => {
    if (watchedCrNumber && watchedCrNumber.length >= 7) {
      crValidation.validateCr(watchedCrNumber);
    }
  }, [watchedCrNumber]);

  // Auto-save form data to store
  useEffect(() => {
    const subscription = watch((value: any) => {
      if (Object.keys(dirtyFields).length > 0) {
        updateCompanyData({
          legal: value as CompanyLegalData
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateCompanyData, dirtyFields]);

  // Handle form submission
  const onSubmit = (data: CompanyLegalData) => {
    // Check VAT validation
    if (data.vatNumber && vatValidation.result && !vatValidation.result.isUnique) {
      toast.error('VAT number is already in use', {
        description: vatValidation.result.message || 'Please use a different VAT number'
      });
      return;
    }

    // Check CR validation
    if (data.crNumber && crValidation.result && !crValidation.result.isUnique) {
      toast.error('CR number is already in use', {
        description: crValidation.result.message || 'Please use a different CR number'
      });
      return;
    }

    // Save data to store
    updateCompanyData({ legal: data });
    
    // Mark step as completed
    markSubStepCompleted('company', 'legal');
    markStepCompleted('company');

    // Call custom save handler
    if (onSave) {
      onSave(data);
    }

    // Show success message
    toast.success('Company legal information saved successfully!', {
      description: 'Company setup is now complete. You can proceed to the next step.'
    });

    // Check if this is the final step for the company plan
    if (planType === 'company' && !onNext && !onComplete) {
      // This is the final step - submit to backend
      // For now, we'll use placeholder user and subscription data
      // In a real app, this would come from previous steps or context
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: companyData.contact?.email || 'admin@company.com',
        password: 'tempPassword123',
        phone: companyData.contact?.phone
      };
      
      const subscriptionData = {
        planType: 'company',
        planId: 'company-basic' // This should come from plan selection
      };
      
      onboardingSubmission.submitOnboarding(userData, subscriptionData);
      return;
    }

    // Navigate to next step or complete
    if (onComplete) {
      onComplete();
    } else if (onNext) {
      onNext();
    } else {
      goToNextStep(); // This will move to complex setup for company plan
    }
  };

  // Handle going back
  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else {
      goToPreviousSubStep();
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (type: 'terms' | 'privacy', file: File): Promise<{ url: string; id: string }> => {
    setDocumentType(type);
    
    try {
      // Use the uploadFiles method which returns a Promise with results
      const results = await documentUpload.uploadFiles([file]);
      const result = results[0]; // Get the first (and only) result
      if (!result) {
        throw new Error('Upload failed - no result returned');
      }
      return { url: result.url, id: result.id };
    } catch (error) {
      // Re-throw the error so the DocumentUpload component can handle it
      throw error;
    }
  };

  // Get validation status
  const getVatValidationStatus = () => {
    if (!watchedVatNumber || watchedVatNumber.length < 7) return null;
    if (vatValidation.isChecking) return 'checking';
    if (vatValidation.result?.isUnique) return 'valid';
    return 'invalid';
  };

  const getCrValidationStatus = () => {
    if (!watchedCrNumber || watchedCrNumber.length < 7) return null;
    if (crValidation.isChecking) return 'checking';
    if (crValidation.result?.isUnique) return 'valid';
    return 'invalid';
  };

  const vatStatus = getVatValidationStatus();
  const crStatus = getCrValidationStatus();
  const isValidating = vatValidation.isChecking || crValidation.isChecking;

  // Check if form can be submitted
  const canSubmit = isValid && 
    (!watchedVatNumber || vatStatus === 'valid') && 
    (!watchedCrNumber || crStatus === 'valid') && 
    !isValidating;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          Company Legal Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Provide legal documentation and compliance information for your company. This ensures regulatory compliance and builds trust.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          
          {/* Registration Numbers */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Registration Numbers</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* VAT Number */}
              <div className="space-y-2">
                <Label htmlFor="vatNumber" className="flex items-center gap-2">
                  VAT Number
                  {vatStatus === 'checking' && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {vatStatus === 'valid' && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {vatStatus === 'invalid' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </Label>
                <Input
                  id="vatNumber"
                  {...register('vatNumber')}
                  placeholder="300012345600003"
                  className={
                    vatStatus === 'valid' ? 'border-green-500' :
                    vatStatus === 'invalid' ? 'border-red-500' : ''
                  }
                />
                {errors.vatNumber && (
                  <p className="text-sm text-red-600">{errors.vatNumber.message}</p>
                )}
                {vatStatus === 'invalid' && vatValidation.result?.message && (
                  <p className="text-sm text-red-600">{vatValidation.result.message}</p>
                )}
                {vatStatus === 'valid' && (
                  <p className="text-sm text-green-600">✓ Valid VAT number</p>
                )}
                <p className="text-xs text-muted-foreground">
                  VAT registration number (10-15 digits) - Optional
                </p>
              </div>

              {/* CR Number */}
              <div className="space-y-2">
                <Label htmlFor="crNumber" className="flex items-center gap-2">
                  CR Number
                  {crStatus === 'checking' && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {crStatus === 'valid' && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {crStatus === 'invalid' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </Label>
                <Input
                  id="crNumber"
                  {...register('crNumber')}
                  placeholder="1010123456"
                  className={
                    crStatus === 'valid' ? 'border-green-500' :
                    crStatus === 'invalid' ? 'border-red-500' : ''
                  }
                />
                {errors.crNumber && (
                  <p className="text-sm text-red-600">{errors.crNumber.message}</p>
                )}
                {crStatus === 'invalid' && crValidation.result?.message && (
                  <p className="text-sm text-red-600">{crValidation.result.message}</p>
                )}
                {crStatus === 'valid' && (
                  <p className="text-sm text-green-600">✓ Valid CR number</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Commercial Registration number (7-12 digits) - Optional
                </p>
              </div>
            </div>
          </div>

          {/* Legal Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Legal Documents</h3>
            
            {/* Terms & Conditions URL */}
            <div className="space-y-2">
              <Label htmlFor="termsConditionsUrl">Terms & Conditions URL</Label>
              {watchedTermsUrl ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Terms & Conditions URL set</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(watchedTermsUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('termsConditionsUrl', '')}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="termsConditionsUrl"
                    {...register('termsConditionsUrl')}
                    placeholder="https://yourcompany.com/terms"
                  />
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium">Alternative: Upload document using file upload below</p>
                      <DocumentUpload
                        onFileUpload={(file) => handleDocumentUpload('terms', file)}
                        disabled={documentUpload.isUploading && documentType === 'terms'}
                      />
                    </div>
                  </div>
                </div>
              )}
              {errors.termsConditionsUrl && (
                <p className="text-sm text-red-600">{errors.termsConditionsUrl.message}</p>
              )}
            </div>

            {/* Privacy Policy URL */}
            <div className="space-y-2">
              <Label htmlFor="privacyPolicyUrl">Privacy Policy URL</Label>
              {watchedPrivacyUrl ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Privacy Policy URL set</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(watchedPrivacyUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('privacyPolicyUrl', '')}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="privacyPolicyUrl"
                    {...register('privacyPolicyUrl')}
                    placeholder="https://yourcompany.com/privacy"
                  />
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium">Alternative: Upload document using file upload below</p>
                      <DocumentUpload
                        onFileUpload={(file) => handleDocumentUpload('privacy', file)}
                        disabled={documentUpload.isUploading && documentType === 'privacy'}
                      />
                    </div>
                  </div>
                </div>
              )}
              {errors.privacyPolicyUrl && (
                <p className="text-sm text-red-600">{errors.privacyPolicyUrl.message}</p>
              )}
            </div>
          </div>

          {/* Form Status & Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button 
              type="button" 
              variant="outline"
              onClick={handlePrevious}
            >
              Previous
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {canSubmit ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Ready to Complete
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {isValidating ? 'Validating...' : 'Complete Form'}
                  </Badge>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={!canSubmit}
                className="min-w-[140px]"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Complete Company Setup'
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
