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
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon, PhoneIcon, MapPinIcon, UserIcon, GlobeIcon, BuildingIcon } from "lucide-react";
import { toast } from 'sonner';
import { ComplexContactDto, PhoneNumberDto, AddressDto, EmergencyContactDto, SocialMediaLinksDto } from '@/types/onboarding';
import { saveComplexContact } from '@/api/onboardingApiClient';
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

// Form validation schema matching ComplexContactDto
const complexContactSchema = z.object({
  phoneNumbers: z.array(phoneNumberSchema).min(1, 'At least one phone number is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  address: addressSchema.optional(),
  emergencyContact: emergencyContactSchema.optional(),
  socialMediaLinks: socialMediaLinksSchema.optional()
});

type ComplexContactFormData = z.infer<typeof complexContactSchema>;

interface ComplexContactFormProps {
  onNext: (data: ComplexContactDto) => void;
  onPrevious: () => void;
  initialData?: Partial<ComplexContactDto>;
  organizationData?: any; // For inheritance
  isLoading?: boolean;
}

export const ComplexContactForm: React.FC<ComplexContactFormProps> = ({
  onNext,
  onPrevious,
  initialData = {},
  organizationData,
  isLoading = false
}) => {
  const [isContactExpanded, setIsContactExpanded] = useState(true);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [isEmergencyExpanded, setIsEmergencyExpanded] = useState(false);
  const [isSocialExpanded, setIsSocialExpanded] = useState(false);
  const [useInheritance, setUseInheritance] = useState(Boolean(organizationData));

  // Apply data inheritance from organization if available and requested
  const getInheritedContactValue = (field: string, currentValue?: any) => {
    if (!useInheritance || !organizationData || currentValue) return currentValue;
    
    // Handle nested objects
    if (field.includes('.')) {
      const [parentField, childField] = field.split('.');
      return organizationData.contact?.[parentField]?.[childField];
    }
    
    return organizationData.contact?.[field];
  };

  const form = useForm<ComplexContactFormData>({
    resolver: zodResolver(complexContactSchema),
    defaultValues: {
      phoneNumbers: initialData.phoneNumbers || (organizationData?.contact?.phoneNumbers?.length ? organizationData.contact.phoneNumbers : [{ number: '', type: 'primary' }]),
      email: initialData.email || getInheritedContactValue('email') || '',
      address: initialData.address || {
        street: getInheritedContactValue('address.street') || '',
        city: getInheritedContactValue('address.city') || '',
        state: getInheritedContactValue('address.state') || '',
        postalCode: getInheritedContactValue('address.postalCode') || '',
        country: getInheritedContactValue('address.country') || '',
        googleLocation: getInheritedContactValue('address.googleLocation') || ''
      },
      emergencyContact: initialData.emergencyContact || {
        name: '',
        phone: '',
        email: '',
        relationship: ''
      },
      socialMediaLinks: {
        facebook: initialData.socialMediaLinks?.facebook || getInheritedContactValue('socialMediaLinks.facebook') || '',
        instagram: initialData.socialMediaLinks?.instagram || getInheritedContactValue('socialMediaLinks.instagram') || '',
        twitter: initialData.socialMediaLinks?.twitter || getInheritedContactValue('socialMediaLinks.twitter') || '',
        linkedin: initialData.socialMediaLinks?.linkedin || getInheritedContactValue('socialMediaLinks.linkedin') || '',
        whatsapp: initialData.socialMediaLinks?.whatsapp || getInheritedContactValue('socialMediaLinks.whatsapp') || '',
        youtube: initialData.socialMediaLinks?.youtube || getInheritedContactValue('socialMediaLinks.youtube') || ''
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

  const handleInheritanceToggle = () => {
    const newUseInheritance = !useInheritance;
    setUseInheritance(newUseInheritance);
    
    if (newUseInheritance && organizationData) {
      // Apply inheritance by updating form values
      const currentValues = form.getValues();
      
      // Inherit contact information
      form.reset({
        phoneNumbers: currentValues.phoneNumbers?.length ? 
          currentValues.phoneNumbers : 
          organizationData.contact?.phoneNumbers || [{ number: '', type: 'primary' }],
        email: currentValues.email || organizationData.contact?.email || '',
        address: {
          street: currentValues.address?.street || organizationData.contact?.address?.street || '',
          city: currentValues.address?.city || organizationData.contact?.address?.city || '',
          state: currentValues.address?.state || organizationData.contact?.address?.state || '',
          postalCode: currentValues.address?.postalCode || organizationData.contact?.address?.postalCode || '',
          country: currentValues.address?.country || organizationData.contact?.address?.country || '',
          googleLocation: currentValues.address?.googleLocation || organizationData.contact?.address?.googleLocation || ''
        },
        emergencyContact: {
          name: currentValues.emergencyContact?.name || organizationData.contact?.emergencyContact?.name || '',
          phone: currentValues.emergencyContact?.phone || organizationData.contact?.emergencyContact?.phone || '',
          email: currentValues.emergencyContact?.email || organizationData.contact?.emergencyContact?.email || '',
          relationship: currentValues.emergencyContact?.relationship || organizationData.contact?.emergencyContact?.relationship || ''
        },
        socialMediaLinks: {
          facebook: currentValues.socialMediaLinks?.facebook || organizationData.contact?.socialMediaLinks?.facebook || '',
          instagram: currentValues.socialMediaLinks?.instagram || organizationData.contact?.socialMediaLinks?.instagram || '',
          twitter: currentValues.socialMediaLinks?.twitter || organizationData.contact?.socialMediaLinks?.twitter || '',
          linkedin: currentValues.socialMediaLinks?.linkedin || organizationData.contact?.socialMediaLinks?.linkedin || '',
          whatsapp: currentValues.socialMediaLinks?.whatsapp || organizationData.contact?.socialMediaLinks?.whatsapp || '',
          youtube: currentValues.socialMediaLinks?.youtube || organizationData.contact?.socialMediaLinks?.youtube || ''
        }
      });
      
      toast.success('Inherited contact data from organization');
    }
  };

  const addPhoneNumber = () => {
    appendPhone({ number: '', type: 'secondary', label: '' });
  };

  const onSubmit = async (data: ComplexContactFormData) => {
    try {
      // Transform form data to ComplexContactDto
      const contactData: ComplexContactDto = {
        phoneNumbers: data.phoneNumbers?.filter(phone => phone.number.trim() !== ''),
        email: data.email || undefined,
        address: data.address,
        emergencyContact: data.emergencyContact,
        socialMediaLinks: data.socialMediaLinks
      };

      console.log('📤 Submitting complex contact:', contactData);

      // Save to backend
      const response = await saveComplexContact(contactData);
      
      if (response.success) {
        console.log('✅ Complex contact saved successfully:', response);
        toast.success('Complex contact information saved successfully!');
        
        // Pass the response data including entityId to the parent
        onNext({
          ...contactData,
          entityId: response.entityId
        } as any);
      } else {
        throw new Error(response.message || 'Failed to save complex contact information');
      }
    } catch (error: any) {
      console.error('❌ Error saving complex contact:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('Complex not found')) {
        toast.error('Please complete the complex overview step first before adding contact information.');
      } else if (error.validationError && error.errors) {
        // Handle field-specific validation errors
        error.errors.forEach((err: any) => {
          form.setError(err.field, {
            type: 'manual',
            message: err.message
          });
        });
        toast.error('Please check the form for errors');
      } else {
        toast.error(error.message || 'Failed to save complex contact information');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>Complex Setup</span>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-primary font-medium">Contact Information</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Complex Contact Information
        </h1>
        <p className="text-gray-600">
          Provide contact details for your medical complex
        </p>
      </div>

      {/* Data Inheritance Option */}
      {organizationData && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BuildingIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Inherit from Organization</h3>
                  <p className="text-sm text-blue-700">
                    Copy contact information from "{organizationData.overview?.name || 'Organization'}"
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={useInheritance ? "default" : "outline"}
                size="sm"
                onClick={handleInheritanceToggle}
              >
                {useInheritance ? 'Using Inherited Data' : 'Use Organization Data'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Contact Information */}
          <Card>
            <Collapsible open={isContactExpanded} onOpenChange={setIsContactExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Basic Contact</h2>
                      <p className="text-sm text-gray-600">Phone numbers and email</p>
                    </div>
                  </div>
                  {isContactExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">
                  
                  {/* Phone Numbers */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Phone Numbers</Label>
                    
                    {phoneFields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-3">
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`phoneNumbers.${index}.number`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Phone number"
                                    className="h-12"
                                    disabled={isLoading}
                                  />
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
                                  <SelectTrigger className="h-12">
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
                                  <Input
                                    {...field}
                                    placeholder="Label"
                                    className="h-12"
                                    disabled={isLoading}
                                  />
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
                            className="h-12 w-12 shrink-0"
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
                        className="w-full h-12 border-dashed"
                        disabled={isLoading}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Phone Number
                      </Button>
                    )}
                  </div>

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="complex@example.com"
                            className="h-12"
                            disabled={isLoading || emailValidation.isChecking}
                          />
                        </FormControl>
                        {useInheritance && organizationData?.email && (
                          <div className="text-xs text-blue-600">
                            Inherited: {organizationData.email}
                          </div>
                        )}
                        {emailValidation.isChecking && (
                          <p className="text-sm text-blue-600">Validating email...</p>
                        )}
                        {emailValidation.hasChecked && !emailValidation.isAvailable && (
                          <p className="text-sm text-red-600">{emailValidation.message}</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Address Information */}
          <Card>
            <Collapsible open={isAddressExpanded} onOpenChange={setIsAddressExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Address</h2>
                      <p className="text-sm text-gray-600">Physical location details</p>
                    </div>
                  </div>
                  {isAddressExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">
                  
                  {/* Street Address */}
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="123 Medical Center Drive"
                            className="h-12"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* City */}
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="City name"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* State */}
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="State or Province"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Postal Code */}
                    <FormField
                      control={form.control}
                      name="address.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="12345"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Country */}
                    <FormField
                      control={form.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Country name"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Google Location */}
                  <FormField
                    control={form.control}
                    name="address.googleLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Maps Location</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Google Maps URL or Place ID"
                            className="h-12"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <Collapsible open={isEmergencyExpanded} onOpenChange={setIsEmergencyExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Emergency Contact</h2>
                      <p className="text-sm text-gray-600">Primary emergency contact person</p>
                    </div>
                  </div>
                  {isEmergencyExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Emergency Contact Name */}
                    <FormField
                      control={form.control}
                      name="emergencyContact.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="John Doe"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Emergency Contact Phone */}
                    <FormField
                      control={form.control}
                      name="emergencyContact.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="+1234567890"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Emergency Contact Email */}
                    <FormField
                      control={form.control}
                      name="emergencyContact.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="emergency@example.com"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Relationship */}
                    <FormField
                      control={form.control}
                      name="emergencyContact.relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Manager, Director, etc."
                              className="h-12"
                              disabled={isLoading}
                            />
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

          {/* Social Media Links */}
          <Card>
            <Collapsible open={isSocialExpanded} onOpenChange={setIsSocialExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <GlobeIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Social Media & Web</h2>
                      <p className="text-sm text-gray-600">Online presence and social profiles</p>
                    </div>
                  </div>
                  {isSocialExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Facebook */}
                    <FormField
                      control={form.control}
                      name="socialMediaLinks.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://facebook.com/yourcomplex"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Instagram */}
                    <FormField
                      control={form.control}
                      name="socialMediaLinks.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://instagram.com/yourcomplex"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Twitter */}
                    <FormField
                      control={form.control}
                      name="socialMediaLinks.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://twitter.com/yourcomplex"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* LinkedIn */}
                    <FormField
                      control={form.control}
                      name="socialMediaLinks.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://linkedin.com/company/yourcomplex"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* WhatsApp */}
                    <FormField
                      control={form.control}
                      name="socialMediaLinks.whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://wa.me/1234567890"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* YouTube */}
                    <FormField
                      control={form.control}
                      name="socialMediaLinks.youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://youtube.com/@yourcomplex"
                              className="h-12"
                              disabled={isLoading}
                            />
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
                disabled={isLoading}
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