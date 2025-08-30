'use client';

import React, { useState } from "react";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon, PhoneIcon, MapPinIcon, UserIcon, GlobeIcon, Mail, Building, Hash, Heart, Facebook, Instagram, Twitter, Linkedin, MessageCircle, Youtube } from "lucide-react";
import { toast } from 'sonner';
import { OrganizationContactDto, PhoneNumberDto, AddressDto, EmergencyContactDto, SocialMediaLinksDto } from '@/types/onboarding';
import { saveOrganizationContact, validateEmail } from '@/api/onboardingApiClient';
import { useUniqueValidation, getValidationStatusClass, getValidationMessage } from '@/hooks/useUniqueValidation';

// Phone number validation schema
const phoneNumberSchema = z.object({
  number: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits'),
  type: z.enum(['primary', 'secondary', 'emergency', 'fax', 'mobile'], {
    message: 'Please select a phone type'
  }),
  label: z.string().optional()
});

// Address validation schema
const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  googleLocation: z.string().optional()
});

// Emergency contact validation schema
const emergencyContactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  relationship: z.string().optional()
});

// Social media links validation schema
const socialMediaLinksSchema = z.object({
  facebook: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, { message: 'Invalid Facebook URL' }),
  instagram: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, { message: 'Invalid Instagram URL' }),
  twitter: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, { message: 'Invalid Twitter URL' }),
  linkedin: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, { message: 'Invalid LinkedIn URL' }),
  whatsapp: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, { message: 'Invalid WhatsApp URL' }),
  youtube: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, { message: 'Invalid YouTube URL' })
});

// Form validation schema matching OrganizationContactDto
const companyContactSchema = z.object({
  phoneNumbers: z.array(phoneNumberSchema).min(1, 'At least one phone number is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  address: addressSchema.optional(),
  emergencyContact: emergencyContactSchema.optional(),
  socialMediaLinks: socialMediaLinksSchema.optional()
});

type CompanyContactFormData = z.infer<typeof companyContactSchema>;

interface CompanyContactFormProps {
  onNext: (data: OrganizationContactDto) => void;
  onPrevious: () => void;
  initialData?: Partial<OrganizationContactDto>;
  isLoading?: boolean;
}

export const CompanyContactForm: React.FC<CompanyContactFormProps> = ({
  onNext,
  onPrevious,
  initialData = {},
  isLoading = false
}) => {
  const [isContactExpanded, setIsContactExpanded] = useState(true);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [isEmergencyExpanded, setIsEmergencyExpanded] = useState(false);
  const [isSocialExpanded, setIsSocialExpanded] = useState(false);

  const form = useForm<CompanyContactFormData>({
    resolver: zodResolver(companyContactSchema),
    defaultValues: {
      phoneNumbers: initialData.phoneNumbers || [{ number: '', type: 'primary' }],
      email: initialData.email || '',
      address: initialData.address || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        googleLocation: ''
      },
      emergencyContact: initialData.emergencyContact || {
        name: '',
        phone: '',
        email: '',
        relationship: ''
      },
      socialMediaLinks: initialData.socialMediaLinks || {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        whatsapp: '',
        youtube: ''
      }
    }
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control: form.control,
    name: 'phoneNumbers'
  });

  // Real-time validation for email uniqueness
  const currentEmail = form.watch('email') || '';
  const isEditingExistingEmail = Boolean(
    initialData?.email && 
    initialData.email.trim().length > 0 && 
    currentEmail.trim().toLowerCase() === initialData.email.trim().toLowerCase()
  );
  
  const emailValidation = useUniqueValidation(
    currentEmail,
    'email',
    800, // 800ms debounce delay
    undefined,
    isEditingExistingEmail // Skip validation if editing existing email
  );

  const addPhoneNumber = () => {
    appendPhone({ number: '', type: 'secondary', label: '' });
  };

  const onSubmit = async (data: CompanyContactFormData) => {
    try {
      // Transform form data to OrganizationContactDto
      const contactData: OrganizationContactDto = {
        phoneNumbers: data.phoneNumbers?.filter(phone => phone.number.trim() !== ''),
        email: data.email || undefined,
        address: data.address,
        emergencyContact: data.emergencyContact,
        socialMediaLinks: data.socialMediaLinks
      };

      // Save to backend
      const response = await saveOrganizationContact(contactData);
      
      if (response.success) {
        toast.success('Contact information saved successfully!');
        onNext(contactData);
      } else {
        throw new Error(response.message || 'Failed to save contact information');
      }
    } catch (error: any) {
      console.error('Error saving company contact:', error);
      
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
        toast.error(error.message || 'Failed to save contact information');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Main Content */}
      <div className="flex-1 p-8 bg-background">
        {/* Header */}
        <div className="mb-8">
          <button
            className="flex items-center gap-2 text-sm mb-4 text-muted-foreground hover:text-primary transition-colors font-lato"
            onClick={onPrevious}
            type="button"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back to Company Overview
          </button>
          <h1 className="text-2xl font-bold mb-2 text-primary font-lato">
            Contact Information
          </h1>
          <p className="text-muted-foreground font-lato">
            Provide contact details for your organization
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
          
            {/* Basic Contact Information */}
            <Card className="bg-background border-border shadow-sm">
              <Collapsible open={isContactExpanded} onOpenChange={setIsContactExpanded}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-bold text-primary font-lato">Basic Contact</h2>
                        <p className="text-sm text-muted-foreground font-lato">Phone numbers and email</p>
                      </div>
                    </div>
                    {isContactExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">
                  
                  {/* Phone Numbers */}
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-primary font-lato">Phone Numbers</label>
                    
                    {phoneFields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-3">
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`phoneNumbers.${index}.number`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                      <PhoneIcon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                    </div>
                                    <Input
                                      {...field}
                                      placeholder="Phone number"
                                      className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                      style={{
                                        boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                        borderRadius: '8px'
                                      }}
                                      disabled={isLoading}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="w-32">
                          <FormField
                            control={form.control}
                            name={`phoneNumbers.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="h-[48px] border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm font-lato"
                                    style={{
                                      boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                      borderRadius: '8px'
                                    }}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="primary">Primary</SelectItem>
                                    <SelectItem value="secondary">Secondary</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                    <SelectItem value="fax">Fax</SelectItem>
                                    <SelectItem value="mobile">Mobile</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="w-24">
                          <FormField
                            control={form.control}
                            name={`phoneNumbers.${index}.label`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                      <Hash className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                    </div>
                                    <Input
                                      {...field}
                                      placeholder="Label"
                                      className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                      style={{
                                        boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                        borderRadius: '8px'
                                      }}
                                      disabled={isLoading}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {phoneFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removePhone(index)}
                            className="h-[48px] w-[48px] shrink-0 border-border hover:bg-surface-hover"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {phoneFields.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addPhoneNumber}
                        className="w-full h-[48px] border-dashed border-border text-primary hover:bg-surface-hover font-lato"
                        disabled={isLoading}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Phone Number
                      </Button>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-primary font-lato">Email Address</label>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                <Mail className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                              </div>
                              <Input
                                {...field}
                                type="email"
                                placeholder="company@example.com"
                                className={`h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground ${getValidationStatusClass(emailValidation)}`}
                                style={{
                                  boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                  borderRadius: '8px'
                                }}
                                disabled={isLoading || emailValidation.isChecking}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                          {/* Email validation messages */}
                          {(() => {
                            const { message, className } = getValidationMessage(emailValidation);
                            return message ? (
                              <div className={className}>
                                {emailValidation.isChecking && (
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeLinecap="round"/>
                                    </svg>
                                    {message}
                                  </span>
                                )}
                                {!emailValidation.isChecking && (
                                  <span className="inline-flex items-center gap-1">
                                    {emailValidation.isValid && emailValidation.isAvailable && (
                                      <svg className="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                      </svg>
                                    )}
                                    {(!emailValidation.isValid || !emailValidation.isAvailable) && (
                                      <svg className="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                      </svg>
                                    )}
                                    {message}
                                  </span>
                                )}
                              </div>
                            ) : null;
                          })()}
                        </FormItem>
                      )}
                    />
                  </div>

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

            {/* Address Information */}
            <Card className="bg-background border-border shadow-sm">
              <Collapsible open={isAddressExpanded} onOpenChange={setIsAddressExpanded}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-bold text-primary font-lato">Address</h2>
                        <p className="text-sm text-muted-foreground font-lato">Physical location details</p>
                      </div>
                    </div>
                    {isAddressExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">
                  
                  {/* Street Address */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-primary font-lato">Street Address</label>
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                <Building className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                              </div>
                              <Input
                                {...field}
                                placeholder="123 Main Street"
                                className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                style={{
                                  boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                  borderRadius: '8px'
                                }}
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* City */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">City</label>
                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <MapPinIcon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="City name"
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* State */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">State/Province</label>
                      <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <MapPinIcon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="State or Province"
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Postal Code */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">Postal Code</label>
                      <FormField
                        control={form.control}
                        name="address.postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <Hash className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="12345"
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">Country</label>
                      <FormField
                        control={form.control}
                        name="address.country"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <GlobeIcon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="Country name"
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Google Location */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-primary font-lato">Google Maps Location</label>
                    <FormField
                      control={form.control}
                      name="address.googleLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                <GlobeIcon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                              </div>
                              <Input
                                {...field}
                                placeholder="Google Maps URL or Place ID"
                                className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                style={{
                                  boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                  borderRadius: '8px'
                                }}
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

            {/* Emergency Contact */}
            <Card className="bg-background border-border shadow-sm">
              <Collapsible open={isEmergencyExpanded} onOpenChange={setIsEmergencyExpanded}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <UserIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-bold text-primary font-lato">Emergency Contact</h2>
                        <p className="text-sm text-muted-foreground font-lato">Primary emergency contact person</p>
                      </div>
                    </div>
                    {isEmergencyExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Emergency Contact Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">Contact Name</label>
                      <FormField
                        control={form.control}
                        name="emergencyContact.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <UserIcon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="John Doe"
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Emergency Contact Phone */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">Contact Phone</label>
                      <FormField
                        control={form.control}
                        name="emergencyContact.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <PhoneIcon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="+1234567890"
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Emergency Contact Email */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">Contact Email</label>
                      <FormField
                        control={form.control}
                        name="emergencyContact.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <Mail className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="emergency@example.com"
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Relationship */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">Relationship</label>
                      <FormField
                        control={form.control}
                        name="emergencyContact.relationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <Heart className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="Manager, Owner, etc."
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

            {/* Social Media Links */}
            <Card className="bg-background border-border shadow-sm">
              <Collapsible open={isSocialExpanded} onOpenChange={setIsSocialExpanded}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <GlobeIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-bold text-primary font-lato">Social Media & Web</h2>
                        <p className="text-sm text-muted-foreground font-lato">Online presence and social profiles</p>
                      </div>
                    </div>
                    {isSocialExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Facebook */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">Facebook</label>
                      <FormField
                        control={form.control}
                        name="socialMediaLinks.facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <Facebook className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="https://facebook.com/yourcompany"
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Instagram */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">Instagram</label>
                      <FormField
                        control={form.control}
                        name="socialMediaLinks.instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <Instagram className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="https://instagram.com/yourcompany"
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Twitter */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">Twitter</label>
                      <FormField
                        control={form.control}
                        name="socialMediaLinks.twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <Twitter className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="https://twitter.com/yourcompany"
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">LinkedIn</label>
                      <FormField
                        control={form.control}
                        name="socialMediaLinks.linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <Linkedin className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="https://linkedin.com/company/yourcompany"
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">WhatsApp</label>
                      <FormField
                        control={form.control}
                        name="socialMediaLinks.whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <MessageCircle className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="https://wa.me/1234567890"
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* YouTube */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-primary font-lato">YouTube</label>
                      <FormField
                        control={form.control}
                        name="socialMediaLinks.youtube"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                  <Youtube className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  value={field.value || ''}
                                  placeholder="https://youtube.com/@yourcompany"
                                  className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                                  style={{
                                    boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                    borderRadius: '8px'
                                  }}
                                  disabled={isLoading}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isLoading}
                className="w-full sm:w-auto h-[48px] px-8 font-lato text-primary border-border hover:bg-muted"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button
                type="submit"
                disabled={isLoading || emailValidation.isChecking}
                className="w-full sm:w-auto h-[48px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-lato disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRightIcon className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
};