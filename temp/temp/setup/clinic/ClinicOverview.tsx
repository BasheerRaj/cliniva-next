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
  Stethoscope, 
  Plus, 
  Minus, 
  Check, 
  AlertCircle, 
  Loader2,
  Upload,
  Users,
  Clock,
  Zap,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

// Import validation schema
import { clinicOverviewSchema } from '@/lib/validations/clinic';

// Import types
import { ClinicOverview as ClinicOverviewType } from '@/types/onboarding/clinic';
import { Service } from '@/types/onboarding/common';

// Import hooks
import { useOnboardingStore, useOnboardingNavigation } from '@/hooks/onboarding/useOnboardingStore';
import { useClinicNameValidation } from '@/hooks/onboarding/api/useUniquenessValidation';
import { useLogoUpload } from '@/hooks/onboarding/api/useFileUpload';
import { useSpecialties } from '@/hooks/api/useSpecialties';

interface ClinicOverviewProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: (data: ClinicOverviewType) => void;
  className?: string;
}

const SESSION_DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' }
];

const SPECIALIZATION_OPTIONS = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Oncology',
  'Ophthalmology',
  'ENT (Ear, Nose, Throat)',
  'Gastroenterology',
  'Endocrinology',
  'Pulmonology',
  'Nephrology',
  'Urology',
  'Gynecology',
  'Emergency Medicine',
  'Family Medicine',
  'Other'
];

export const ClinicOverview: React.FC<ClinicOverviewProps> = ({
  onNext,
  onPrevious,
  onSave,
  className
}) => {
  const { 
    clinicData, 
    updateClinicData, 
    markSubStepCompleted, 
    planType, 
    complexData,
    companyData 
  } = useOnboardingStore();
  const { goToNextSubStep, goToPreviousSubStep } = useOnboardingNavigation();
  
  // Validation hooks
  const clinicNameValidation = useClinicNameValidation();
  const logoUpload = useLogoUpload({
    onSuccess: (result) => {
      setValue('logo', result.url);
      toast.success('Logo uploaded successfully!');
    }
  });
  
  // Fetch specialties from API
  const { data: specialties = [], isLoading: isLoadingSpecialties } = useSpecialties();

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid, dirtyFields }
  } = useForm<ClinicOverviewType>({
    resolver: yupResolver(clinicOverviewSchema) as any,
    defaultValues: {
      logo: typeof clinicData.overview?.logo === 'string' ? clinicData.overview.logo : '',
      name: clinicData.overview?.name || '',
      yearEstablished: clinicData.overview?.yearEstablished || new Date().getFullYear(),
      headDoctorName: clinicData.overview?.headDoctorName || '',
      specialization: clinicData.overview?.specialization || '',
      sessionDuration: clinicData.overview?.sessionDuration || 30,
      maxStaff: clinicData.overview?.maxStaff || 5,
      maxDoctors: clinicData.overview?.maxDoctors || 2,
      maxPatients: clinicData.overview?.maxPatients || 50,
      services: clinicData.overview?.services || [],
      emergencyServices: clinicData.overview?.emergencyServices || false,
      onlineBooking: clinicData.overview?.onlineBooking || true,
      telemedicine: clinicData.overview?.telemedicine || false
    },
    mode: 'onChange'
  });

  // Field array for services
  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: 'services'
  }) as any;

  // Watch form values
  const watchedName = watch('name');
  const watchedSpecialization = watch('specialization');
  const watchedLogo = watch('logo');

  // Validate clinic name uniqueness
  useEffect(() => {
    if (watchedName && watchedName.length >= 2) {
      // For company plan, pass organization ID; for complex plan, pass complex ID
      let parentId: string | undefined;
      if (planType === 'company') {
        parentId = companyData.overview?.tradeName;
      } else if (planType === 'complex') {
        parentId = complexData.overview?.name;
      }
      clinicNameValidation.validateName(watchedName, parentId);
    }
  }, [watchedName, planType, companyData, complexData]); // Remove clinicNameValidation from dependencies to prevent excessive re-renders

  // Auto-save form data to store
  useEffect(() => {
    const subscription = watch((value) => {
      if (Object.keys(dirtyFields).length > 0) {
        updateClinicData({
          overview: value as ClinicOverviewType
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateClinicData, dirtyFields]);

  // Handle form submission
  const onSubmit = (data: ClinicOverviewType) => {
    // Check clinic name uniqueness
    if (!clinicNameValidation.result?.isUnique) {
      toast.error('Clinic name must be unique', {
        description: clinicNameValidation.result?.message || 'Please choose a different name'
      });
      return;
    }

    // Save data to store
    updateClinicData({ overview: data });
    
    // Mark step as completed
    markSubStepCompleted('clinic', 'overview');

    // Call custom save handler
    if (onSave) {
      onSave(data);
    }

    // Show success message
    toast.success('Clinic overview saved successfully!');

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
      logoUpload.uploadFile(file);
    }
  };

  // Add service
  const addService = () => {
    appendService({ 
      name: '', 
      description: '', 
      durationMinutes: 30, 
      price: undefined 
    });
  };

  // Get validation status for clinic name
  const getNameValidationStatus = () => {
    if (!watchedName || watchedName.length < 2) return null;
    if (clinicNameValidation.isChecking) return 'checking';
    if (clinicNameValidation.result?.isUnique) return 'valid';
    return 'invalid';
  };

  const nameStatus = getNameValidationStatus();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-purple-600" />
          Clinic Overview
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {planType === 'clinic' 
            ? 'Configure your independent clinic details and services.' 
            : 'Set up a clinic within your medical complex.'
          }
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          
          {/* Logo Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="clinicLogo">Clinic Logo</Label>
            <div className="flex items-start gap-4">
              
              {/* Logo Preview */}
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                {watchedLogo && typeof watchedLogo === 'string' ? (
                  <img 
                    src={watchedLogo} 
                    alt="Clinic logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <input
                  id="clinicLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('clinicLogo')?.click()}
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
            
            {/* Clinic Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Clinic Name *
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
                placeholder="Clinic name"
                className={
                  nameStatus === 'valid' ? 'border-green-500' :
                  nameStatus === 'invalid' ? 'border-red-500' : ''
                }
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
              {nameStatus === 'invalid' && clinicNameValidation.result?.message && (
                <p className="text-sm text-red-600">{clinicNameValidation.result.message}</p>
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
                placeholder="e.g. 2020"
              />
              {errors.yearEstablished && (
                <p className="text-sm text-red-600">{errors.yearEstablished.message}</p>
              )}
            </div>

            {/* Head Doctor */}
            <div className="space-y-2">
              <Label htmlFor="headDoctorName">Head Doctor/Manager *</Label>
              <Input
                id="headDoctorName"
                {...register('headDoctorName')}
                placeholder="Doctor in charge of this clinic"
              />
              {errors.headDoctorName && (
                <p className="text-sm text-red-600">{errors.headDoctorName.message}</p>
              )}
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <Label htmlFor="specialization">Medical Specialization *</Label>
              <select
                id="specialization"
                {...register('specialization')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select specialization</option>
                {isLoadingSpecialties ? (
                  <option disabled>Loading specialties...</option>
                ) : (
                  specialties.map(specialty => (
                    <option key={specialty._id} value={specialty.name}>
                      {specialty.name}
                    </option>
                  ))
                )}
              </select>
              {errors.specialization && (
                <p className="text-sm text-red-600">{errors.specialization.message}</p>
              )}
            </div>
          </div>

          {/* Operational Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Operational Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Session Duration */}
              <div className="space-y-2">
                <Label htmlFor="sessionDuration">Session Duration *</Label>
                <select
                  id="sessionDuration"
                  {...register('sessionDuration', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SESSION_DURATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {errors.sessionDuration && (
                  <p className="text-sm text-red-600">{errors.sessionDuration.message}</p>
                )}
              </div>

              {/* Max Staff */}
              <div className="space-y-2">
                <Label htmlFor="maxStaff">Max Staff Count *</Label>
                <Input
                  id="maxStaff"
                  type="number"
                  min="1"
                  max="100"
                  {...register('maxStaff', { valueAsNumber: true })}
                  placeholder="5"
                />
                {errors.maxStaff && (
                  <p className="text-sm text-red-600">{errors.maxStaff.message}</p>
                )}
              </div>

              {/* Max Doctors */}
              <div className="space-y-2">
                <Label htmlFor="maxDoctors">Max Doctors *</Label>
                <Input
                  id="maxDoctors"
                  type="number"
                  min="1"
                  max="50"
                  {...register('maxDoctors', { valueAsNumber: true })}
                  placeholder="2"
                />
                {errors.maxDoctors && (
                  <p className="text-sm text-red-600">{errors.maxDoctors.message}</p>
                )}
              </div>

              {/* Max Patients */}
              <div className="space-y-2">
                <Label htmlFor="maxPatients">Max Patients/Day *</Label>
                <Input
                  id="maxPatients"
                  type="number"
                  min="1"
                  max="1000"
                  {...register('maxPatients', { valueAsNumber: true })}
                  placeholder="50"
                />
                {errors.maxPatients && (
                  <p className="text-sm text-red-600">{errors.maxPatients.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Services & Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Services & Features
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
                  id="onlineBooking"
                  {...register('onlineBooking')}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <Label htmlFor="onlineBooking">Online Booking</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="telemedicine"
                  {...register('telemedicine')}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <Label htmlFor="telemedicine">Telemedicine</Label>
              </div>
            </div>
          </div>

          {/* Medical Services */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Package className="h-5 w-5" />
                Medical Services
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addService}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>

            {serviceFields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No services added yet</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addService}
                  className="mt-2"
                >
                  Add First Service
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {serviceFields.map((field: any, index: number) => (
                  <div key={field.id} className="flex gap-3 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Service Name *</Label>
                        <Input
                          {...register(`services.${index}.name` as const)}
                          placeholder="e.g. Consultation"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          {...register(`services.${index}.description` as const)}
                          placeholder="Brief description"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Duration (min)</Label>
                        <Input
                          type="number"
                          min="5"
                          max="480"
                          {...register(`services.${index}.durationMinutes` as const, { valueAsNumber: true })}
                          placeholder="30"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Price (SAR)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...register(`services.${index}.price` as const, { valueAsNumber: true })}
                          placeholder="100.00"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeService(index)}
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
            {(planType === 'company' || planType === 'complex') && (
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
                disabled={!isValid || nameStatus !== 'valid' || clinicNameValidation.isChecking}
                className="min-w-[120px]"
              >
                {clinicNameValidation.isChecking ? (
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
