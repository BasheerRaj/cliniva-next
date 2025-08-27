'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, Building2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Import validation schema
import { companyOverviewSchema } from '@/lib/validations/company';

// Import types
import { CompanyOverview as CompanyOverviewData } from '@/types/onboarding/company';

// Import hooks
import { useOnboardingStore, useOnboardingNavigation } from '@/hooks/onboarding/useOnboardingStore';
import { useOrganizationNameValidation } from '@/hooks/onboarding/api/useUniquenessValidation';
import { useLogoUpload } from '@/hooks/onboarding/api/useFileUpload';

interface CompanyOverviewProps {
  onNext?: () => void;
  onSave?: (data: CompanyOverviewData) => void;
  className?: string;
}

export const CompanyOverview: React.FC<CompanyOverviewProps> = ({
  onNext,
  onSave,
  className
}) => {
  const { companyData, updateCompanyData, markSubStepCompleted } = useOnboardingStore();
  const { goToNextSubStep } = useOnboardingNavigation();
  
  // Validation hooks
  const organizationNameValidation = useOrganizationNameValidation();
  const logoUpload = useLogoUpload({
    onSuccess: (result) => {
      setValue('logoUrl', result.url);
      toast.success('Logo uploaded successfully!');
    }
  });

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, dirtyFields }
  } = useForm<CompanyOverviewData>({
    resolver: yupResolver(companyOverviewSchema) as any,
    defaultValues: {
      name: companyData.overview?.name || '',
      legalName: companyData.overview?.legalName || '',
      yearEstablished: companyData.overview?.yearEstablished || new Date().getFullYear(),
      overview: companyData.overview?.overview || '',
      goals: companyData.overview?.goals || '',
      vision: companyData.overview?.vision || '',
      mission: companyData.overview?.mission || '',
      ceoName: companyData.overview?.ceoName || '',
      logoUrl: companyData.overview?.logoUrl || '',
      registrationNumber: companyData.overview?.registrationNumber || ''
    },
    mode: 'onChange'
  });

  // Watch form values for auto-save and validation
  const watchedName = watch('name');
  const watchedLogoUrl = watch('logoUrl');

  // Validate organization name uniqueness when name changes
  useEffect(() => {
    if (watchedName && watchedName.length >= 2) {
      organizationNameValidation.validateName(watchedName);
    }
  }, [watchedName]);

  // Auto-save form data to store
  useEffect(() => {
    const subscription = watch((value: any) => {
      // Only update if there are actual changes
      if (Object.keys(dirtyFields).length > 0) {
        updateCompanyData({
          overview: value as CompanyOverviewData
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateCompanyData, dirtyFields]);

  // Handle form submission
  const onSubmit = (data: CompanyOverviewData) => {
    // Check organization name uniqueness
    if (!organizationNameValidation.result?.isUnique) {
      toast.error('Organization name must be unique', {
        description: organizationNameValidation.result?.message || 'Please choose a different name'
      });
      return;
    }

    // Save data to store
    updateCompanyData({ overview: data });
    
    // Mark step as completed
    markSubStepCompleted('company', 'overview');

    // Call custom save handler
    if (onSave) {
      onSave(data);
    }

    // Show success message
    toast.success('Company overview saved successfully!');

    // Navigate to next step or call custom handler
    if (onNext) {
      onNext();
    } else {
      goToNextSubStep();
    }
  };

  // Handle logo file selection
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      logoUpload.uploadImage(file);
    }
  };

  // Get validation status for organization name
  const getNameValidationStatus = () => {
    if (!watchedName || watchedName.length < 2) return null;
    if (organizationNameValidation.isChecking) return 'checking';
    if (organizationNameValidation.result?.isUnique) return 'valid';
    return 'invalid';
  };

  const nameStatus = getNameValidationStatus();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          Company Overview
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tell us about your organization. This information will be used to set up your company profile.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          
          {/* Logo Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo</Label>
            <div className="flex items-start gap-4">
              
              {/* Logo Preview */}
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                {watchedLogoUrl ? (
                  <img 
                    src={watchedLogoUrl} 
                    alt="Company logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo')?.click()}
                  disabled={logoUpload.isUploading || logoUpload.isCompressing}
                >
                  {logoUpload.isUploading || logoUpload.isCompressing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {logoUpload.isCompressing ? 'Compressing...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  SVG, PNG, JPG or WebP (max. 1MB)
                </p>
                {logoUpload.error && (
                  <p className="text-xs text-red-600">
                    {logoUpload.error.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Organization Name *
                {nameStatus === 'checking' && (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin text-blue-500 inline" />
                )}
                {nameStatus === 'valid' && (
                  <Check className="h-4 w-4 ml-2 text-green-500 inline" />
                )}
                {nameStatus === 'invalid' && (
                  <AlertCircle className="h-4 w-4 ml-2 text-red-500 inline" />
                )}
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Your organization's name"
                className={
                  nameStatus === 'valid' ? 'border-green-500' :
                  nameStatus === 'invalid' ? 'border-red-500' : ''
                }
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
              {nameStatus === 'invalid' && organizationNameValidation.result?.message && (
                <p className="text-sm text-red-600">{organizationNameValidation.result.message}</p>
              )}
              {nameStatus === 'valid' && (
                <p className="text-sm text-green-600">✓ Name is available</p>
              )}
            </div>

            {/* Legal Name */}
            <div className="space-y-2">
              <Label htmlFor="legalName">Legal Name</Label>
              <Input
                id="legalName"
                {...register('legalName')}
                placeholder="Official legal company name"
              />
              {errors.legalName && (
                <p className="text-sm text-red-600">{errors.legalName.message}</p>
              )}
            </div>

            {/* Year Established */}
            <div className="space-y-2">
              <Label htmlFor="yearEstablished">Year Established</Label>
              <Input
                id="yearEstablished"
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                {...register('yearEstablished', { valueAsNumber: true })}
                placeholder="e.g. 2010"
              />
              {errors.yearEstablished && (
                <p className="text-sm text-red-600">{errors.yearEstablished.message}</p>
              )}
            </div>

            {/* CEO Name */}
            <div className="space-y-2">
              <Label htmlFor="ceoName">CEO/Founder Name</Label>
              <Input
                id="ceoName"
                {...register('ceoName')}
                placeholder="Chief Executive Officer name"
              />
              {errors.ceoName && (
                <p className="text-sm text-red-600">{errors.ceoName.message}</p>
              )}
            </div>
          </div>

          {/* Registration Number */}
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              {...register('registrationNumber')}
              placeholder="Company registration number"
            />
            {errors.registrationNumber && (
              <p className="text-sm text-red-600">{errors.registrationNumber.message}</p>
            )}
          </div>

          {/* Text Areas */}
          <div className="space-y-4">
            
            {/* Company Overview */}
            <div className="space-y-2">
              <Label htmlFor="overview">Company Overview</Label>
              <Textarea
                id="overview"
                {...register('overview')}
                placeholder="Describe your company, its purpose, and what makes it unique..."
                rows={4}
                className="resize-none"
              />
              {errors.overview && (
                <p className="text-sm text-red-600">{errors.overview.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Describe your company's background and services.
              </p>
            </div>

            {/* Goals */}
            <div className="space-y-2">
              <Label htmlFor="goals">Goals & Objectives</Label>
              <Textarea
                id="goals"
                {...register('goals')}
                placeholder="Your company's main goals and objectives..."
                rows={3}
                className="resize-none"
              />
              {errors.goals && (
                <p className="text-sm text-red-600">{errors.goals.message}</p>
              )}
            </div>

            {/* Vision */}
            <div className="space-y-2">
              <Label htmlFor="vision">Vision Statement</Label>
              <Textarea
                id="vision"
                {...register('vision')}
                placeholder="Your company's long-term vision and aspirations..."
                rows={3}
                className="resize-none"
              />
              {errors.vision && (
                <p className="text-sm text-red-600">{errors.vision.message}</p>
              )}
            </div>

            {/* Mission */}
            <div className="space-y-2">
              <Label htmlFor="mission">Mission Statement</Label>
              <Textarea
                id="mission"
                {...register('mission')}
                placeholder="Your company's mission and core purpose..."
                rows={3}
                className="resize-none"
              />
              {errors.mission && (
                <p className="text-sm text-red-600">{errors.mission.message}</p>
              )}
            </div>
          </div>

          {/* Form Status */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {isValid && nameStatus === 'valid' ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Ready to Continue
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Please Complete Required Fields
                </Badge>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={!isValid || nameStatus !== 'valid' || organizationNameValidation.isChecking}
              className="min-w-[120px]"
            >
              {organizationNameValidation.isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                'Save & Continue'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
