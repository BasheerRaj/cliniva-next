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
  Calendar,
  Users,
  FileText,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

// Import validation schema
import { clinicContactSchema } from '@/lib/validations/clinic';

// Import types
import { ClinicContact as ClinicContactType } from '@/types/onboarding/clinic';
import { LocationCoords } from '@/types/onboarding/common';

// Import hooks
import { useOnboardingStore, useOnboardingNavigation } from '@/hooks/onboarding/useOnboardingStore';
import { useEmailValidation } from '@/hooks/onboarding/api/useUniquenessValidation';

// Import components
import { GoogleMapsLocation } from '@/components/ui/google-maps-location';

interface ClinicContactProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: (data: ClinicContactType) => void;
  className?: string;
}

export const ClinicContact: React.FC<ClinicContactProps> = ({
  onNext,
  onPrevious,
  onSave,
  className
}) => {
  const { 
    clinicData, 
    updateClinicData, 
    markSubStepCompleted,
    complexData, 
    planType 
  } = useOnboardingStore();
  const { goToNextSubStep, goToPreviousSubStep } = useOnboardingNavigation();
  
  // Validation hooks
  const emailValidation = useEmailValidation();

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid, dirtyFields }
  } = useForm<ClinicContactType>({
    resolver: yupResolver(clinicContactSchema) as any,
    defaultValues: {
      phoneNumbers: clinicData.contact?.phoneNumbers?.length ? clinicData.contact.phoneNumbers : [''],
      email: clinicData.contact?.email || '',
      website: clinicData.contact?.website || '',
      address: clinicData.contact?.address || '',
      googleLocation: clinicData.contact?.googleLocation || undefined,
      emergencyContactName: clinicData.contact?.emergencyContactName || '',
      emergencyContactPhone: clinicData.contact?.emergencyContactPhone || '',
      appointmentPhone: clinicData.contact?.appointmentPhone || '',
      faxNumber: clinicData.contact?.faxNumber || '',
      afterHoursPhone: clinicData.contact?.afterHoursPhone || '',
      billingEmail: clinicData.contact?.billingEmail || '',
      medicalRecordsEmail: clinicData.contact?.medicalRecordsEmail || '',
      patientPortalUrl: clinicData.contact?.patientPortalUrl || ''
    },
    mode: 'onChange'
  });

  // Field arrays for dynamic fields
  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control: control as any,
    name: 'phoneNumbers'
  });

  // Watch form values
  const watchedEmail = watch('email');
  const watchedLocation = watch('googleLocation');
  const watchedAddress = watch('address');

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
        updateClinicData({
          contact: value as ClinicContactType
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateClinicData, dirtyFields]);

  // Handle form submission
  const onSubmit = (data: ClinicContactType) => {
    // Check email validation
    if (emailValidation.result && !emailValidation.result.isUnique) {
      toast.error('Email is already in use', {
        description: emailValidation.result.message || 'Please use a different email address'
      });
      return;
    }

    // Save data to store
    updateClinicData({ contact: data });
    
    // Mark step as completed
    markSubStepCompleted('clinic', 'contact');

    // Call custom save handler
    if (onSave) {
      onSave(data);
    }

    // Show success message
    toast.success('Clinic contact information saved successfully!');

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

  // Get location constraints from complex data (if applicable)
  const getLocationConstraints = () => {
    if (planType === 'complex' || planType === 'company') {
      const complexLocation = complexData.contact?.googleLocation;
      if (complexLocation) {
        return {
          message: `Clinic should be located within or near the complex at: ${complexData.contact?.address}`,
          complexLocation
        };
      }
    }
    return null;
  };

  const locationConstraints = getLocationConstraints();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-6 w-6 text-purple-600" />
          Clinic Contact Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure contact details for your clinic including patient communication channels and location information.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          
          {/* Primary Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Primary Contact Information</h3>
            
            {/* Main Phone Numbers */}
            <div className="space-y-2">
              <Label>Main Phone Numbers *</Label>
              {phoneFields.map((field: any, index: number) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`phoneNumbers.${index}` as const)}
                    placeholder="+966 XX XXX XXXX"
                    className="flex-1"
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
                      onClick={() => appendPhone('')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
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
                placeholder="clinic@example.com"
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
                placeholder="https://www.clinic.com"
              />
              {errors.website && (
                <p className="text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location & Address</h3>
            
            {/* Location Constraints Info */}
            {locationConstraints && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Location Guidelines</p>
                    <p>{locationConstraints.message}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Google Maps Location */}
            <GoogleMapsLocation
              value={watchedLocation}
              onChange={handleLocationChange}
              onAddressChange={handleAddressChange}
              address={watchedAddress}
              label="Clinic Location"
              placeholder="Enter your clinic address"
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

          {/* Specialized Contact Numbers */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Specialized Contact Numbers</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Appointment Phone */}
              <div className="space-y-2">
                <Label htmlFor="appointmentPhone" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Appointment Phone
                </Label>
                <Input
                  id="appointmentPhone"
                  {...register('appointmentPhone')}
                  placeholder="+966 XX XXX XXXX"
                />
                {errors.appointmentPhone && (
                  <p className="text-sm text-red-600">{errors.appointmentPhone.message}</p>
                )}
              </div>

              {/* After Hours Phone */}
              <div className="space-y-2">
                <Label htmlFor="afterHoursPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  After Hours Phone
                </Label>
                <Input
                  id="afterHoursPhone"
                  {...register('afterHoursPhone')}
                  placeholder="+966 XX XXX XXXX"
                />
                {errors.afterHoursPhone && (
                  <p className="text-sm text-red-600">{errors.afterHoursPhone.message}</p>
                )}
              </div>

              {/* Fax Number */}
              <div className="space-y-2">
                <Label htmlFor="faxNumber" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Fax Number
                </Label>
                <Input
                  id="faxNumber"
                  {...register('faxNumber')}
                  placeholder="+966 XX XXX XXXX"
                />
                {errors.faxNumber && (
                  <p className="text-sm text-red-600">{errors.faxNumber.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Email Contacts */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Email Contacts</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingEmail">Billing Email</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  {...register('billingEmail')}
                  placeholder="billing@clinic.com"
                />
                {errors.billingEmail && (
                  <p className="text-sm text-red-600">{errors.billingEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalRecordsEmail">Medical Records Email</Label>
                <Input
                  id="medicalRecordsEmail"
                  type="email"
                  {...register('medicalRecordsEmail')}
                  placeholder="records@clinic.com"
                />
                {errors.medicalRecordsEmail && (
                  <p className="text-sm text-red-600">{errors.medicalRecordsEmail.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Patient Portal & Digital Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Digital Services</h3>
            
            <div className="space-y-2">
              <Label htmlFor="patientPortalUrl" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Patient Portal URL
              </Label>
              <Input
                id="patientPortalUrl"
                {...register('patientPortalUrl')}
                placeholder="https://portal.clinic.com"
              />
              {errors.patientPortalUrl && (
                <p className="text-sm text-red-600">{errors.patientPortalUrl.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                URL where patients can access their medical records and book appointments
              </p>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emergency Contact</h3>
            
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
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Clinic Contact Guidelines</h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Main phone should be answered during business hours for general inquiries</li>
              <li>• Appointment phone should be dedicated for scheduling and rescheduling</li>
              <li>• After hours phone for urgent medical questions outside business hours</li>
              <li>• Billing email for insurance and payment related communications</li>
              <li>• Medical records email for patient record requests and transfers</li>
              <li>• Patient portal enhances patient engagement and reduces call volume</li>
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
