'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Check, 
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { toast } from 'sonner';

// Import validation schema
import { companyContactSchema } from '@/lib/validations/company';

// Import types
import { OrganizationContactDto, SocialMediaLinksDto } from '@/types/onboarding';

// Import hooks
import { useOnboardingStore, useOnboardingNavigation } from '@/hooks/onboarding/useOnboardingStore';
import { useEmailValidation } from '@/hooks/onboarding/api/useUniquenessValidation';

// Import components
import { GoogleMapsLocation } from '@/components/ui/google-maps-location';

interface CompanyContactProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: (data: OrganizationContactDto) => void;
  className?: string;
}

export const CompanyContact: React.FC<CompanyContactProps> = ({
  onNext,
  onPrevious,
  onSave,
  className
}) => {
  const { companyData, updateCompanyData, markSubStepCompleted } = useOnboardingStore();
  const { goToNextSubStep, goToPreviousSubStep } = useOnboardingNavigation();
  
  // Validation hooks
  const emailValidation = useEmailValidation();

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, dirtyFields }
  } = useForm<OrganizationContactDto>({
    resolver: yupResolver(companyContactSchema) as any,
    defaultValues: {
      address: companyData.contact?.address || '',
      googleLocation: companyData.contact?.googleLocation || '',
      phone: companyData.contact?.phone || '',
      email: companyData.contact?.email || '',
      website: companyData.contact?.website || '',
      emergencyContactName: companyData.contact?.emergencyContactName || '',
      emergencyContactPhone: companyData.contact?.emergencyContactPhone || '',
      socialMediaLinks: {
        facebook: companyData.contact?.socialMediaLinks?.facebook || '',
        instagram: companyData.contact?.socialMediaLinks?.instagram || '',
        twitter: companyData.contact?.socialMediaLinks?.twitter || '',
        linkedin: companyData.contact?.socialMediaLinks?.linkedin || '',
        whatsapp: companyData.contact?.socialMediaLinks?.whatsapp || ''
      }
    },
    mode: 'onChange'
  });

  // Watch form values
  const watchedEmail = watch('email');
  const watchedAddress = watch('address');

  // Validate email uniqueness when email changes
  useEffect(() => {
    if (watchedEmail && watchedEmail.includes('@') && watchedEmail.length >= 3) {
      emailValidation.validateEmail(watchedEmail);
    }
  }, [watchedEmail]);

  // Auto-save form data to store
  useEffect(() => {
    const subscription = watch((value: any) => {
      if (Object.keys(dirtyFields).length > 0) {
        updateCompanyData({
          contact: value as OrganizationContactDto
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateCompanyData, dirtyFields]);

  // Handle form submission
  const onSubmit = (data: OrganizationContactDto) => {
    // Check email validation
    if (emailValidation.result && !emailValidation.result.isUnique) {
      toast.error('Email is already in use', {
        description: emailValidation.result.message || 'Please use a different email address'
      });
      return;
    }

    // Save data to store
    updateCompanyData({ contact: data });
    
    // Mark step as completed
    markSubStepCompleted('company', 'contact');

    // Call custom save handler
    if (onSave) {
      onSave(data);
    }

    // Show success message
    toast.success('Company contact information saved successfully!');

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
  const handleLocationChange = (location: { lat: number; lng: number }) => {
    // Convert coordinates to string format expected by backend
    setValue('googleLocation', `${location.lat},${location.lng}`, { shouldDirty: true });
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
          <Phone className="h-6 w-6 text-blue-600" />
          Company Contact Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Provide contact details for your organization. This information will be used for communication and directory listings.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          
          {/* Primary Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Primary Contact</h3>
            
            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+966 XX XXX XXXX"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                Email Address
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
                placeholder="info@company.com"
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
                placeholder="https://www.company.com"
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
              initialCoords={
                watchedAddress ? 
                { lat: 0, lng: 0 } : // Parse from googleLocation string if needed
                undefined
              }
              onChange={handleLocationChange}
              onAddressChange={handleAddressChange}
              initialAddress={watchedAddress}
              label="Company Location"
              placeholder="Enter your company's address"
              required={false}
            />

            {/* Address Input */}
            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
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

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emergency Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  {...register('emergencyContactName')}
                  placeholder="Contact person name"
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

          {/* Social Media Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Media Presence</h3>
            <p className="text-sm text-muted-foreground">
              Add your company's social media profiles (optional)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="socialMediaLinks.facebook" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  Facebook
                </Label>
                <Input
                  id="socialMediaLinks.facebook"
                  {...register('socialMediaLinks.facebook')}
                  placeholder="https://facebook.com/yourcompany"
                />
                {errors.socialMediaLinks?.facebook && (
                  <p className="text-sm text-red-600">{errors.socialMediaLinks.facebook.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialMediaLinks.twitter" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-blue-400" />
                  Twitter
                </Label>
                <Input
                  id="socialMediaLinks.twitter"
                  {...register('socialMediaLinks.twitter')}
                  placeholder="https://twitter.com/yourcompany"
                />
                {errors.socialMediaLinks?.twitter && (
                  <p className="text-sm text-red-600">{errors.socialMediaLinks.twitter.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialMediaLinks.instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  Instagram
                </Label>
                <Input
                  id="socialMediaLinks.instagram"
                  {...register('socialMediaLinks.instagram')}
                  placeholder="https://instagram.com/yourcompany"
                />
                {errors.socialMediaLinks?.instagram && (
                  <p className="text-sm text-red-600">{errors.socialMediaLinks.instagram.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialMediaLinks.linkedin" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  LinkedIn
                </Label>
                <Input
                  id="socialMediaLinks.linkedin"
                  {...register('socialMediaLinks.linkedin')}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
                {errors.socialMediaLinks?.linkedin && (
                  <p className="text-sm text-red-600">{errors.socialMediaLinks.linkedin.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialMediaLinks.whatsapp" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  WhatsApp
                </Label>
                <Input
                  id="socialMediaLinks.whatsapp"
                  {...register('socialMediaLinks.whatsapp')}
                  placeholder="https://wa.me/966XXXXXXXXX"
                />
                {errors.socialMediaLinks?.whatsapp && (
                  <p className="text-sm text-red-600">{errors.socialMediaLinks.whatsapp.message}</p>
                )}
              </div>
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
                {isValid && (emailStatus === 'valid' || !watchedEmail) ? (
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
                disabled={!isValid || (watchedEmail && emailStatus !== 'valid') || emailValidation.isChecking}
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
