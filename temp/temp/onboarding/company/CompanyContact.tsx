'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Globe, MapPin, User, Users, Linkedin, Twitter, Facebook, Instagram, Info } from 'lucide-react';
import * as yup from 'yup';
import { useOnboardingStore } from '@/hooks/onboarding/useOnboardingStore';
import { CompanyContact as CompanyContactData } from '@/types/onboarding/company';

interface CompanyContactProps {
  onNext: () => void;
  onPrevious: () => void;
}

const companyContactSchema = yup.object({
  phone: yup.string().optional(),
  email: yup.string().email('Invalid email format').required('Email is required'),
  website: yup.string().url('Invalid website URL').optional(),
  address: yup.string().optional(),
  googleLocation: yup.string().optional(),
  emergencyContactName: yup.string().optional(),
  emergencyContactPhone: yup.string().optional(),
  socialMediaLinks: yup.object({
    facebook: yup.string().url('Invalid Facebook URL').optional(),
    twitter: yup.string().url('Invalid Twitter URL').optional(),
    instagram: yup.string().url('Invalid Instagram URL').optional(),
    linkedin: yup.string().url('Invalid LinkedIn URL').optional(),
    whatsapp: yup.string().optional(),
  }).optional(),
});

export const CompanyContact: React.FC<CompanyContactProps> = ({ 
  onNext, 
  onPrevious 
}) => {
  const { companyData, updateCompanyData } = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CompanyContactData>({
    resolver: yupResolver(companyContactSchema) as any,
    defaultValues: {
      phone: companyData.contact?.phone || '',
      email: companyData.contact?.email || '',
      website: companyData.contact?.website || '',
      address: companyData.contact?.address || '',
      googleLocation: companyData.contact?.googleLocation || '',
      emergencyContactName: companyData.contact?.emergencyContactName || '',
      emergencyContactPhone: companyData.contact?.emergencyContactPhone || '',
      socialMediaLinks: {
        facebook: companyData.contact?.socialMediaLinks?.facebook || '',
        twitter: companyData.contact?.socialMediaLinks?.twitter || '',
        instagram: companyData.contact?.socialMediaLinks?.instagram || '',
        linkedin: companyData.contact?.socialMediaLinks?.linkedin || '',
        whatsapp: companyData.contact?.socialMediaLinks?.whatsapp || '',
      }
    }
  });

  const onSubmit = async (data: CompanyContactData) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateCompanyData({ contact: data });
      onNext();
    } catch (error) {
      console.error('Error saving company contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFill = () => {
    const sampleData: CompanyContactData = {
      phone: '+966501234567',
      email: 'info@healthcaresolutions.com',
      website: 'https://www.healthcaresolutions.com',
      address: '123 King Fahd Road, Central Region, Saudi Arabia',
      googleLocation: '24.7136,46.6753',
      emergencyContactName: 'Dr. Ahmed Al-Rashid',
      emergencyContactPhone: '+966509876543',
      socialMediaLinks: {
        facebook: 'https://facebook.com/healthcaresolutions',
        twitter: 'https://twitter.com/healthcaresolns',
        instagram: 'https://instagram.com/healthcaresolutions',
        linkedin: 'https://linkedin.com/company/healthcare-solutions',
      }
    };
    
    Object.entries(sampleData).forEach(([key, value]) => {
      form.setValue(key as keyof CompanyContactData, value as any);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Phone className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Company Contact Information</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Provide comprehensive contact details for your healthcare organization.
          This information will be used for official communications and emergency contacts.
        </p>
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoFill}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Info className="w-4 h-4 mr-1" />
            Fill with sample data
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Primary Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Primary Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          placeholder="+966501234567" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email Address
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="info@company.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="url"
                        placeholder="https://www.company.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street, City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="googleLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Maps Coordinates</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="24.7136,46.6753 or Google Maps Place ID" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Enter coordinates (lat,lng) or Google Maps Place ID for precise location
                    </p>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+966501234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Social Media Presence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="socialMediaLinks.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Facebook className="w-4 h-4" />
                        Facebook Page
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com/company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialMediaLinks.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Twitter className="w-4 h-4" />
                        Twitter/X Profile
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://twitter.com/company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialMediaLinks.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Instagram className="w-4 h-4" />
                        Instagram Profile
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://instagram.com/company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialMediaLinks.linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn Company Page
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/company/company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Progress Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Contact Information Progress</h3>
                  <p className="text-sm text-blue-700">
                    Complete required fields to continue to legal details
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={form.formState.isValid ? "default" : "secondary"}>
                    {form.formState.isValid ? "Complete" : "In Progress"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onPrevious}
              disabled={isLoading}
            >
              Previous
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !form.formState.isValid}
              className="min-w-[160px]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Next: Legal Details'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}; 