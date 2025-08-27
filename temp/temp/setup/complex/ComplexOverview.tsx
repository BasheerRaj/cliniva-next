'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Plus, 
  Minus, 
  Check, 
  AlertCircle, 
  Loader2,
  Upload,
  Users,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

// Import validation schema
import { complexOverviewSchema } from '@/lib/validations/complex';

// Import types
import { ComplexOverview as ComplexOverviewType } from '@/types/onboarding/complex';
import { Department } from '@/types/onboarding/common';

// Import hooks
import { useOnboardingStore, useOnboardingNavigation } from '@/hooks/onboarding/useOnboardingStore';
import { useComplexNameValidation } from '@/hooks/onboarding/api/useUniquenessValidation';
import { useLogoUpload } from '@/hooks/onboarding/api/useFileUpload';

interface ComplexOverviewProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: (data: ComplexOverviewType) => void;
  className?: string;
}

export const ComplexOverview: React.FC<ComplexOverviewProps> = ({
  onNext,
  onPrevious,
  onSave,
  className
}) => {
  const { complexData, updateComplexData, markSubStepCompleted, planType, companyData } = useOnboardingStore();
  const { goToNextSubStep, goToPreviousSubStep } = useOnboardingNavigation();
  
  // Validation hooks
  const complexNameValidation = useComplexNameValidation();
  const logoUpload = useLogoUpload({
    onSuccess: (result) => {
      setValue('logo', result.url);
      toast.success('Logo uploaded successfully!');
    }
  });

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid, dirtyFields }
  } = useForm<ComplexOverviewType>({
    resolver: yupResolver(complexOverviewSchema) as any,
    defaultValues: {
      logo: typeof complexData.overview?.logo === 'string' ? complexData.overview.logo : '',
      name: complexData.overview?.name || '',
      yearEstablished: complexData.overview?.yearEstablished || new Date().getFullYear(),
      managerName: complexData.overview?.managerName || '',
      description: complexData.overview?.description || '',
      departments: complexData.overview?.departments || [],
      totalArea: complexData.overview?.totalArea || undefined,
      parkingSpaces: complexData.overview?.parkingSpaces || undefined,
      emergencyServices: complexData.overview?.emergencyServices || false,
      laboratoryServices: complexData.overview?.laboratoryServices || false,
      pharmacyServices: complexData.overview?.pharmacyServices || false
    },
    mode: 'onChange'
  });

  // Field array for departments
  const { fields: departmentFields, append: appendDepartment, remove: removeDepartment } = useFieldArray({
    control,
    name: 'departments'
  }) as any;

  // Watch form values
  const watchedName = watch('name');
  const watchedLogo = watch('logo');

  // Validate complex name uniqueness
  useEffect(() => {
    if (watchedName && watchedName.length >= 2) {
      // For company plan, pass organization ID for scoped validation
      const organizationId = planType === 'company' ? companyData.overview?.tradeName : undefined;
      complexNameValidation.validateName(watchedName, organizationId);
    }
  }, [watchedName, planType, companyData]); // Remove complexNameValidation from dependencies to prevent excessive re-renders

  // Auto-save form data to store
  useEffect(() => {
    const subscription = watch((value) => {
      if (Object.keys(dirtyFields).length > 0) {
        updateComplexData({
          overview: value as ComplexOverviewType
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateComplexData, dirtyFields]);

  // Handle form submission
  const onSubmit = (data: ComplexOverviewType) => {
    // Check complex name uniqueness
    if (!complexNameValidation.result?.isUnique) {
      toast.error('Complex name must be unique', {
        description: complexNameValidation.result?.message || 'Please choose a different name'
      });
      return;
    }

    // Save data to store
    updateComplexData({ overview: data });
    
    // Mark step as completed
    markSubStepCompleted('complex', 'overview');

    // Call custom save handler
    if (onSave) {
      onSave(data);
    }

    // Show success message
    toast.success('Complex overview saved successfully!');

    // Navigate to next step or call custom handler
    if (onNext) {
      onNext();
    } else {
      goToNextSubStep();
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

  // Handle logo file selection
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      logoUpload.uploadImage(file);
    }
  };

  // Add department
  const addDepartment = () => {
    appendDepartment({ name: '', description: '' });
  };

  // Get validation status for complex name
  const getNameValidationStatus = () => {
    if (!watchedName || watchedName.length < 2) return null;
    if (complexNameValidation.isChecking) return 'checking';
    if (complexNameValidation.result?.isUnique) return 'valid';
    return 'invalid';
  };

  const nameStatus = getNameValidationStatus();



  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-6 w-6 text-green-600" />
          Complex Overview
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {planType === 'company' 
            ? 'Set up a medical complex within your organization.' 
            : 'Configure your medical complex details and departments.'
          }
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          
          {/* Logo Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="complexLogo">Complex Logo</Label>
            <div className="flex items-start gap-4">
              
              {/* Logo Preview */}
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                {watchedLogo && typeof watchedLogo === 'string' ? (
                  <img 
                    src={watchedLogo} 
                    alt="Complex logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <input
                  id="complexLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('complexLogo')?.click()}
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
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Complex Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Complex Name *
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
                placeholder="Medical complex name"
                className={
                  nameStatus === 'valid' ? 'border-green-500' :
                  nameStatus === 'invalid' ? 'border-red-500' : ''
                }
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
              {nameStatus === 'invalid' && complexNameValidation.result?.message && (
                <p className="text-sm text-red-600">{complexNameValidation.result.message}</p>
              )}
              {nameStatus === 'valid' && (
                <p className="text-sm text-green-600">✓ Name is available</p>
              )}
            </div>

            {/* Year Established */}
            <div className="space-y-2">
              <Label htmlFor="yearEstablished">Year Established *</Label>
              <Input
                id="yearEstablished"
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                {...register('yearEstablished', { valueAsNumber: true })}
                placeholder="e.g. 2015"
              />
              {errors.yearEstablished && (
                <p className="text-sm text-red-600">{errors.yearEstablished.message}</p>
              )}
            </div>

            {/* Manager Name */}
            <div className="space-y-2">
              <Label htmlFor="managerName">Manager/Director Name *</Label>
              <Input
                id="managerName"
                {...register('managerName')}
                placeholder="Person in charge of this complex"
              />
              {errors.managerName && (
                <p className="text-sm text-red-600">{errors.managerName.message}</p>
              )}
            </div>

            {/* Total Area */}
            <div className="space-y-2">
              <Label htmlFor="totalArea">Total Area (sqm)</Label>
              <Input
                id="totalArea"
                type="number"
                min="0"
                {...register('totalArea', { valueAsNumber: true })}
                placeholder="Total area in square meters"
              />
              {errors.totalArea && (
                <p className="text-sm text-red-600">{errors.totalArea.message}</p>
              )}
            </div>

            {/* Parking Spaces */}
            <div className="space-y-2">
              <Label htmlFor="parkingSpaces">Parking Spaces</Label>
              <Input
                id="parkingSpaces"
                type="number"
                min="0"
                {...register('parkingSpaces', { valueAsNumber: true })}
                placeholder="Number of parking spaces"
              />
              {errors.parkingSpaces && (
                <p className="text-sm text-red-600">{errors.parkingSpaces.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Complex Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the medical complex, its purpose, and specializations..."
              rows={4}
              className="resize-none"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Services & Facilities */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Services & Facilities
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emergencyServices"
                  {...register('emergencyServices')}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <Label htmlFor="emergencyServices">Emergency Services</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="laboratoryServices"
                  {...register('laboratoryServices')}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <Label htmlFor="laboratoryServices">Laboratory Services</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pharmacyServices"
                  {...register('pharmacyServices')}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <Label htmlFor="pharmacyServices">Pharmacy Services</Label>
              </div>
            </div>
          </div>

          {/* Departments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5" />
                Medical Departments
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDepartment}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </div>

            {departmentFields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No departments added yet</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDepartment}
                  className="mt-2"
                >
                  Add First Department
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {departmentFields.map((field: any, index: number) => (
                  <div key={field.id} className="flex gap-3 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Department Name</Label>
                        <Input
                          {...register(`departments.${index}.name` as const)}
                          placeholder="e.g. Cardiology"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          {...register(`departments.${index}.description` as const)}
                          placeholder="Brief description"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDepartment(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Status & Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            {planType === 'company' && (
              <Button 
                type="button" 
                variant="outline"
                onClick={handlePrevious}
              >
                Previous
              </Button>
            )}

            <div className="flex items-center gap-4 ml-auto">
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
                disabled={!isValid || nameStatus !== 'valid' || complexNameValidation.isChecking}
                className="min-w-[120px]"
              >
                {complexNameValidation.isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Save & Continue'
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
