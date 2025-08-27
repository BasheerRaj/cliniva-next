'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Minus, 
  Check, 
  AlertCircle,
  Shield,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

// Import validation schema
import { complexContactSchema } from '@/lib/validations/complex';

// Import types
import { ComplexContact as ComplexContactType } from '@/types/onboarding/complex';
import { LocationCoords } from '@/types/onboarding/common';

// Import hooks
import { useOnboardingStore, useOnboardingNavigation } from '@/hooks/onboarding/useOnboardingStore';
import { useEmailValidation } from '@/hooks/onboarding/api/useUniquenessValidation';

// Import components
import { GoogleMapsLocation } from '@/components/ui/google-maps-location';

interface ComplexContactProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: (data: ComplexContactType) => void;
  className?: string;
}

export const ComplexContact: React.FC<ComplexContactProps> = ({
  onNext,
  onPrevious,
  onSave,
  className
}) => {
  const { complexData, updateComplexData, markSubStepCompleted } = useOnboardingStore();
  const { goToNextSubStep, goToPreviousSubStep } = useOnboardingNavigation();
  
  // Validation hooks
  const emailValidation = useEmailValidation();

  // Form setup with guaranteed phone numbers array
  const getDefaultPhoneNumbers = () => {
    if (complexData.contact?.phoneNumbers && complexData.contact.phoneNumbers.length > 0) {
      return complexData.contact.phoneNumbers;
    }
    return [''];  // Always ensure at least one phone field
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    trigger,
    formState: { errors, isValid, dirtyFields, isValidating, isDirty, isSubmitted, touchedFields }
  } = useForm<ComplexContactType>({
    resolver: yupResolver(complexContactSchema) as any,
    defaultValues: {
      phoneNumbers: getDefaultPhoneNumbers(),
      email: complexData.contact?.email || '',
      website: complexData.contact?.website || '',
      address: complexData.contact?.address || '',
      googleLocation: complexData.contact?.googleLocation || undefined,
      emergencyContactName: complexData.contact?.emergencyContactName || '',
      emergencyContactPhone: complexData.contact?.emergencyContactPhone || '',
      receptionPhone: complexData.contact?.receptionPhone || '',
      emergencyPhone: complexData.contact?.emergencyPhone || '',
      administrativeEmail: complexData.contact?.administrativeEmail || '',
      maintenanceEmail: complexData.contact?.maintenanceEmail || '',
      securityPhone: complexData.contact?.securityPhone || ''
    },
    mode: 'onChange'
  });

  // Field arrays for dynamic fields
  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control,
    name: 'phoneNumbers'
  }) as any;

  // Watch form values
  const watchedEmail = watch('email');
  const watchedLocation = watch('googleLocation');
  const watchedAddress = watch('address');
  const watchedPhoneNumbers = watch('phoneNumbers');

  // Force initialize phone fields if empty
  useEffect(() => {
    if (phoneFields.length === 0) {
      console.log('🚨 phoneFields is empty, forcing initialization...');
      (appendPhone as any)(''); // Force add one phone field
    }
  }, [phoneFields.length, appendPhone]);

  // Force validation on form mount to ensure isValid is properly set
  useEffect(() => {
    const initializeValidation = async () => {
      console.log('🔧 Initializing form validation on mount...');
      const result = await trigger();
      console.log('🔧 Initial validation result:', result);
    };
    
    // Add a small delay to ensure all fields are properly initialized
    const timer = setTimeout(initializeValidation, 500);
    return () => clearTimeout(timer);
  }, [trigger]);

  // Validate email uniqueness when email changes
  useEffect(() => {
    if (watchedEmail && watchedEmail.includes('@') && watchedEmail.length >= 3) {
      emailValidation.validateEmail(watchedEmail);
    }
  }, [watchedEmail]); // Remove emailValidation from dependencies to prevent excessive re-renders

  // Auto-save form data to store
  useEffect(() => {
    const subscription = watch((value) => {
      if (Object.keys(dirtyFields).length > 0) {
        updateComplexData({
          contact: value as ComplexContactType
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateComplexData, dirtyFields]);

  // Handle form submission
  const onSubmit = (data: ComplexContactType) => {
    // Check email validation
    if (emailValidation.result && !emailValidation.result.isUnique) {
      toast.error('Email is already in use', {
        description: emailValidation.result.message || 'Please use a different email address'
      });
      return;
    }

    // Save data to store
    updateComplexData({ contact: data });
    
    // Mark step as completed
    markSubStepCompleted('complex', 'contact');

    // Call custom save handler
    if (onSave) {
      onSave(data);
    }

    // Show success message
    toast.success('Complex contact information saved successfully!');

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

  // Handle location change
  const handleLocationChange = (location: LocationCoords) => {
    setValue('googleLocation', location, { shouldDirty: true });
  };

  // Handle address change from location picker
  const handleAddressChange = (address: string) => {
    setValue('address', address, { shouldDirty: true });
  };

  // Get email validation status
  const getEmailValidationStatus = () => {
    if (!watchedEmail || !watchedEmail.includes('@')) return null;
    if (emailValidation.isChecking) return 'checking';
    if (emailValidation.result?.isUnique) return 'valid';
    return 'invalid';
  };

  const emailStatus = getEmailValidationStatus();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-6 w-6 text-green-600" />
          Complex Contact Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Provide comprehensive contact details for your medical complex. This includes general contact information and specialized emergency contacts.
        </p>
      </CardHeader>

      <CardContent>
        {/* 🐛 DEBUG PANEL - Form Validation Status */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-blue-800">🐛 DEBUG: Form Validation Status</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-medium text-blue-700 mb-1">Form Status: {isValid && emailStatus === 'valid' ? '✅ Can Submit' : '❌ Cannot Submit'}</p>
              <p className="text-blue-600">• isValid: {isValid ? '✅ True' : '❌ False'}</p>
              <p className="text-blue-600">• emailStatus: {emailStatus || 'null'} {emailStatus === 'valid' ? '✅' : emailStatus === 'invalid' ? '❌' : emailStatus === 'checking' ? '⏳' : '⭕'}</p>
              <p className="text-blue-600">• emailValidation.isChecking: {emailValidation.isChecking ? '⏳ True' : '✅ False'}</p>
              <p className="text-blue-600">• Can Submit: {(!isValid || emailStatus !== 'valid' || emailValidation.isChecking) ? '❌ NO' : '✅ YES'}</p>
              
              {/* Additional Form States */}
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="font-medium text-green-700">📊 FORM STATE DETAILS:</p>
                <p className="text-green-600 text-xs">• isValidating: {isValidating ? '⏳ True' : '✅ False'}</p>
                <p className="text-green-600 text-xs">• isDirty: {isDirty ? '✅ True' : '❌ False'}</p>
                <p className="text-green-600 text-xs">• isSubmitted: {isSubmitted ? '✅ True' : '❌ False'}</p>
                <p className="text-green-600 text-xs">• touchedFields: {Object.keys(touchedFields).length} fields</p>
                <p className="text-green-600 text-xs">• dirtyFields: {Object.keys(dirtyFields).length} fields</p>
              </div>

              {/* Manual Validation Trigger */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={async () => {
                    console.log('🔧 Manual validation triggered');
                    const result = await trigger();
                    console.log('🔧 Manual validation result:', result);
                  }}
                  className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                  🔧 Force Validation Check
                </button>
              </div>
              
              {/* Show ALL form errors with detailed breakdown */}
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="font-medium text-red-700">🔍 ALL FORM ERRORS ({Object.keys(errors).length}):</p>
                {Object.keys(errors).length === 0 ? (
                  <p className="text-green-600 text-xs">✅ No validation errors detected!</p>
                ) : (
                  Object.entries(errors).map(([key, error]: [string, any]) => (
                    <div key={key} className="text-red-600 text-xs border-l-2 border-red-300 pl-2 my-1">
                      <p className="font-bold">❌ {key}:</p>
                      <p>• Message: {error?.message || 'No message'}</p>
                      <p>• Type: {error?.type || 'No type'}</p>
                      {error?.ref?.name && <p>• Field: {error.ref.name}</p>}
                      <p>• Keys: {typeof error === 'object' ? Object.keys(error).join(', ') : 'Not an object'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div>
              <p className="font-medium text-blue-700 mb-1">ALL FIELD VALUES & VALIDATION:</p>
              
              {/* Required Fields */}
              <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="font-bold text-blue-800 text-xs">REQUIRED FIELDS:</p>
                <p className="text-blue-600">phoneNumbers {watchedPhoneNumbers && watchedPhoneNumbers.length >= 1 && watchedPhoneNumbers[0] && watchedPhoneNumbers[0].length >= 10 ? '✅ Valid' : '❌ Invalid'} Current: {JSON.stringify(watchedPhoneNumbers)}</p>
                <p className="text-blue-600">email {watchedEmail && watchedEmail.includes('@') && watchedEmail.length >= 5 ? '✅ Valid' : '❌ Invalid'} Current: {JSON.stringify(watchedEmail)}</p>
                <p className="text-blue-600">address {watchedAddress && watchedAddress.length >= 10 ? '✅ Valid' : '❌ Invalid'} Current: {JSON.stringify(watchedAddress)}</p>
                <p className="text-blue-600">googleLocation {watchedLocation && watchedLocation.lat && watchedLocation.lng ? '✅ Valid' : '❌ Invalid'} Current: {watchedLocation ? `lat:${watchedLocation.lat}, lng:${watchedLocation.lng}` : 'null'}</p>
              </div>

              {/* Optional Fields That Might Cause Validation Issues */}
              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-bold text-yellow-800 text-xs">OPTIONAL FIELDS (might have validation errors):</p>
                <p className="text-yellow-700">website: {JSON.stringify(watch('website'))}</p>
                <p className="text-yellow-700">receptionPhone: {JSON.stringify(watch('receptionPhone'))}</p>
                <p className="text-yellow-700">emergencyPhone: {JSON.stringify(watch('emergencyPhone'))}</p>
                <p className="text-yellow-700">securityPhone: {JSON.stringify(watch('securityPhone'))}</p>
                <p className="text-yellow-700">administrativeEmail: {JSON.stringify(watch('administrativeEmail'))}</p>
                <p className="text-yellow-700">maintenanceEmail: {JSON.stringify(watch('maintenanceEmail'))}</p>
                <p className="text-yellow-700">emergencyContactName: {JSON.stringify(watch('emergencyContactName'))}</p>
                <p className="text-yellow-700">emergencyContactPhone: {JSON.stringify(watch('emergencyContactPhone'))}</p>
              </div>

              {/* Phone Number Regex Test */}
              <div className="mb-2 p-2 bg-purple-50 border border-purple-200 rounded">
                <p className="font-bold text-purple-800 text-xs">PHONE NUMBER REGEX VALIDATION:</p>
                <p className="text-purple-700">Regex Pattern: /^[\+]?[1-9][\d]{'{0,15}'}$/</p>
                {watchedPhoneNumbers && watchedPhoneNumbers[0] && (
                  <p className="text-purple-700">Main Phone "{watchedPhoneNumbers[0]}" matches: {/^[\+]?[1-9][\d]{0,15}$/.test(watchedPhoneNumbers[0]) ? '✅ YES' : '❌ NO'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Email validation details */}
          {emailValidation.result && (
            <div className="mt-2 text-xs">
              <p className="font-medium text-blue-700">Email Validation Details:</p>
              <p className="text-blue-600">• isUnique: {emailValidation.result.isUnique ? '✅ True' : '❌ False'}</p>
              <p className="text-blue-600">• message: {emailValidation.result.message}</p>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          
          {/* Primary Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">General Contact Information</h3>
            
            {/* Main Phone Numbers */}
            <div className="space-y-2">
              <Label>Main Phone Numbers *</Label>
              
              {/* 🐛 DEBUG: Phone Fields Status */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs space-y-1">
                <p className="font-bold">🐛 COMPREHENSIVE DEBUG INFO:</p>
                <p>phoneFields.length = {phoneFields.length}</p>
                <p>phoneFields data: {JSON.stringify(phoneFields)}</p>
                <p>watchedPhoneNumbers: {JSON.stringify(watchedPhoneNumbers)}</p>
                <p>complexData.contact?.phoneNumbers: {JSON.stringify(complexData.contact?.phoneNumbers)}</p>
                <p>getDefaultPhoneNumbers(): {JSON.stringify(getDefaultPhoneNumbers())}</p>
                {phoneFields.length > 0 ? (
                  <p className="text-green-600 font-bold">✅ phoneFields found! Rendering {phoneFields.length} field(s)</p>
                ) : (
                  <div className="text-red-600">
                    <p className="font-bold">❌ No phoneFields found!</p>
                    <button 
                      onClick={() => {
                        console.log('Manual appendPhone triggered');
                        (appendPhone as any)('');
                      }}
                      className="mt-1 px-2 py-1 bg-red-200 rounded text-red-800 hover:bg-red-300"
                    >
                      🔧 Force Add Phone Field
                    </button>
                  </div>
                )}
              </div>
              
              {phoneFields.map((field: any, index: number) => (
                <div key={field.id} className="space-y-1">
                  {/* 🐛 DEBUG: Individual phone field */}
                  <div className="p-1 bg-gray-50 border rounded text-xs">
                    <p>🐛 Field #{index + 1} - ID: {field.id}</p>
                    <p>Current value: {watch(`phoneNumbers.${index}`)}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      {...register(`phoneNumbers.${index}` as const)}
                      placeholder="+966 XX XXX XXXX"
                      className="flex-1"
                      style={{ backgroundColor: '#f0f8ff', border: '2px solid #007bff' }}
                    />
                    {phoneFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePhone(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                    {index === phoneFields.length - 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => (appendPhone as any)('')}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* 🚨 FALLBACK: If no phoneFields, render direct inputs */}
              {phoneFields.length === 0 && (
                <div className="space-y-2">
                  <div className="p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-700 text-xs font-bold">🚨 FALLBACK MODE: phoneFields array is empty!</p>
                    <p className="text-red-600 text-xs">Using direct phone input as backup...</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      {...register('phoneNumbers.0')}
                      placeholder="+966 XX XXX XXXX"
                      className="flex-1"
                      style={{ backgroundColor: '#ffe6e6', border: '2px solid #ff4444' }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => (appendPhone as any)('')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {errors.phoneNumbers && (
                <p className="text-sm text-red-600">At least one phone number is required</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                Email Address *
                {emailStatus === 'checking' && (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                )}
                {emailStatus === 'valid' && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {emailStatus === 'invalid' && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="info@complex.com"
                className={
                  emailStatus === 'valid' ? 'border-green-500' :
                  emailStatus === 'invalid' ? 'border-red-500' : ''
                }
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
              {emailStatus === 'invalid' && emailValidation.result?.message && (
                <p className="text-sm text-red-600">{emailValidation.result.message}</p>
              )}
              {emailStatus === 'valid' && (
                <p className="text-sm text-green-600">✓ Email is available</p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                placeholder="https://www.complex.com"
              />
              {errors.website && (
                <p className="text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location & Address</h3>
            
            {/* Google Maps Location */}
            <GoogleMapsLocation
              initialCoords={watchedLocation}
              onChange={handleLocationChange}
              onAddressChange={handleAddressChange}
              initialAddress={watchedAddress}
              label="Complex Location"
              placeholder="Enter your medical complex address"
              required
            />

            {/* Address Input */}
            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Street address, city, postal code"
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Specialized Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Specialized Contacts</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reception Phone */}
              <div className="space-y-2">
                <Label htmlFor="receptionPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Reception Phone
                </Label>
                <Input
                  id="receptionPhone"
                  {...register('receptionPhone')}
                  placeholder="+966 XX XXX XXXX"
                />
                {errors.receptionPhone && (
                  <p className="text-sm text-red-600">{errors.receptionPhone.message}</p>
                )}
              </div>

              {/* Emergency Phone */}
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Emergency Phone
                </Label>
                <Input
                  id="emergencyPhone"
                  {...register('emergencyPhone')}
                  placeholder="+966 XX XXX XXXX"
                />
                {errors.emergencyPhone && (
                  <p className="text-sm text-red-600">{errors.emergencyPhone.message}</p>
                )}
              </div>

              {/* Security Phone */}
              <div className="space-y-2">
                <Label htmlFor="securityPhone" className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Security Phone
                </Label>
                <Input
                  id="securityPhone"
                  {...register('securityPhone')}
                  placeholder="+966 XX XXX XXXX"
                />
                {errors.securityPhone && (
                  <p className="text-sm text-red-600">{errors.securityPhone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Email Contacts */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Email Contacts</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="administrativeEmail">Administrative Email</Label>
                <Input
                  id="administrativeEmail"
                  type="email"
                  {...register('administrativeEmail')}
                  placeholder="admin@complex.com"
                />
                {errors.administrativeEmail && (
                  <p className="text-sm text-red-600">{errors.administrativeEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceEmail">Maintenance Email</Label>
                <Input
                  id="maintenanceEmail"
                  type="email"
                  {...register('maintenanceEmail')}
                  placeholder="maintenance@complex.com"
                />
                {errors.maintenanceEmail && (
                  <p className="text-sm text-red-600">{errors.maintenanceEmail.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emergency Contact Person</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  {...register('emergencyContactName')}
                  placeholder="Emergency contact person"
                />
                {errors.emergencyContactName && (
                  <p className="text-sm text-red-600">{errors.emergencyContactName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  {...register('emergencyContactPhone')}
                  placeholder="+966 XX XXX XXXX"
                />
                {errors.emergencyContactPhone && (
                  <p className="text-sm text-red-600">{errors.emergencyContactPhone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Guidelines */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Contact Information Guidelines</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Main phone numbers will be used for general inquiries and appointments</li>
              <li>• Emergency phone should be monitored 24/7 for urgent medical situations</li>
              <li>• Security phone is for facility safety and access control issues</li>
              <li>• Specialized emails help route inquiries to the appropriate departments</li>
            </ul>
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
                {isValid && emailStatus === 'valid' ? (
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
                disabled={!isValid || emailStatus !== 'valid' || emailValidation.isChecking}
                className="min-w-[120px]"
              >
                {emailValidation.isChecking ? 'Validating...' : 'Save & Continue'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
