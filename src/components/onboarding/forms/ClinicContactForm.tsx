'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  MapPinIcon, 
  PhoneIcon, 
  MailIcon, 
  GlobeIcon,
  PlusIcon,
  TrashIcon,
  StethoscopeIcon,
  Building,
  Hash,
  User,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MessageCircle,
  Youtube
} from 'lucide-react';
import { toast } from 'sonner';
import { clinicContactSchema, type ClinicContact } from '@/lib/validation/onboarding';
import { ClinicContactDto } from '@/types/onboarding';
import { saveClinicContact } from '@/api/onboardingApiClient';
import { useClivinaTheme } from "@/hooks/useClivinaTheme";

interface ClinicContactFormProps {
  onNext: (data: ClinicContactDto) => void;
  onPrevious: () => void;
  initialData?: Partial<ClinicContactDto>;
  isLoading?: boolean;
  planType?: 'company' | 'complex' | 'clinic';
  formData?: any;
  currentStep?: number;
}

export const ClinicContactForm: React.FC<ClinicContactFormProps> = ({
  onNext,
  onPrevious,
  initialData = {},
  isLoading = false,
  planType,
  formData,
  currentStep
}) => {
  const [isAddressExpanded, setIsAddressExpanded] = useState(true);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [isEmergencyExpanded, setIsEmergencyExpanded] = useState(false);
  const [isSocialMediaExpanded, setIsSocialMediaExpanded] = useState(false);

  const form = useForm<ClinicContact>({
    resolver: zodResolver(clinicContactSchema),
    defaultValues: {
      address: initialData.address || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        googleLocation: ''
      },
      email: initialData.email || '',
      phoneNumbers: initialData.phoneNumbers?.map(phone => ({
        ...phone,
        type: phone.type || 'primary'
      })) || [{ number: '', type: 'primary' as const, label: '' }],
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

  const addPhoneNumber = () => {
    appendPhone({ number: '', type: 'secondary', label: '' });
  };

  const onSubmit = async (data: ClinicContact) => {
    try {
      // Transform form data to ClinicContactDto
      const contactData: ClinicContactDto = {
        address: data.address,
        email: data.email || undefined,
        phoneNumbers: data.phoneNumbers?.filter(phone => phone.number.trim() !== ''),
        emergencyContact: data.emergencyContact,
        socialMediaLinks: data.socialMediaLinks
      };

      // Save to backend
      const response = await saveClinicContact(contactData);
      
      if (response.success) {
        toast.success('Clinic contact information saved successfully!');
        onNext(contactData);
      } else {
        throw new Error(response.message || 'Failed to save clinic contact information');
      }
    } catch (error: any) {
      console.error('Error saving clinic contact information:', error);
      toast.error('Failed to save clinic contact information', {
        description: error.message || 'An unexpected error occurred'
      });
    }
  };

  const { colors } = useClivinaTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="p-8 bg-background">
        {/* Header */}
        <div className="mb-8">
          <button
            className="flex items-center gap-2 text-sm mb-4 text-muted-foreground hover:text-primary transition-colors font-lato"
            onClick={onPrevious}
            type="button"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back to Previous Step
          </button>
          <h1 className="text-2xl font-bold mb-2 text-primary font-lato">
            Contact Information
          </h1>
          <p className="text-muted-foreground font-lato">
            Provide contact details for your clinic including address, phone numbers, and emergency contacts
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
            
            {/* Address Information Section */}
            <Card className="bg-background border-border shadow-sm">
              <div className="p-6">
                <div 
                  className="flex items-center justify-between mb-6 cursor-pointer"
                  onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                >
                  <h3 className="text-lg font-bold text-primary font-lato">
                    Address Information
                  </h3>
                  {isAddressExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-primary" />
                  )}
                </div>

                {isAddressExpanded && (
                  <div className="space-y-6">
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
                                  placeholder="123 Medical Center Street"
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

                    {/* City and State Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                    {/* Postal Code and Country Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  </div>
                )}
              </div>
            </Card>

            {/* Contact Information Section */}
            <Card className="bg-background border-border shadow-sm">
              <div className="p-6">
                <div 
                  className="flex items-center justify-between mb-6 cursor-pointer"
                  onClick={() => setIsContactExpanded(!isContactExpanded)}
                >
                  <h3 className="text-lg font-bold text-primary font-lato">
                    Contact Information
                  </h3>
                  {isContactExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-primary" />
                  )}
                </div>

                {isContactExpanded && (
                  <div className="space-y-6">
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
                                  <MailIcon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                </div>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="clinic@example.com"
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

                    {/* Phone Numbers */}
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-primary font-lato">Phone Numbers</label>
                      
                      <div className="space-y-3">
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
                      </div>
                      
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
                  </div>
                )}
              </div>
            </Card>

            {/* Emergency Contact Section */}
            <Card className="bg-background border-border shadow-sm">
              <div className="p-6">
                <div 
                  className="flex items-center justify-between mb-6 cursor-pointer"
                  onClick={() => setIsEmergencyExpanded(!isEmergencyExpanded)}
                >
                  <h3 className="text-lg font-bold text-primary font-lato">
                    Emergency Contact
                  </h3>
                  {isEmergencyExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-primary" />
                  )}
                </div>

                {isEmergencyExpanded && (
                  <div className="space-y-6">
                    {/* Contact Name and Relationship Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                    <User className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                  </div>
                                  <Input
                                    {...field}
                                    placeholder="Dr. John Smith"
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
                                    <User className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                  </div>
                                  <Input
                                    {...field}
                                    placeholder="Head Doctor, Manager, etc."
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

                    {/* Contact Phone and Email Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                    placeholder="+966501234567"
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
                                    <MailIcon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
                                  </div>
                                  <Input
                                    {...field}
                                    type="email"
                                    placeholder="emergency@clinic.com"
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
                  </div>
                )}
              </div>
            </Card>

            {/* Social Media Section */}
            <Card className="bg-background border-border shadow-sm">
              <div className="p-6">
                <div 
                  className="flex items-center justify-between mb-6 cursor-pointer"
                  onClick={() => setIsSocialMediaExpanded(!isSocialMediaExpanded)}
                >
                  <h3 className="text-lg font-bold text-primary font-lato">
                    Social Media & Web Presence
                  </h3>
                  {isSocialMediaExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-primary" />
                  )}
                </div>

                {isSocialMediaExpanded && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                    placeholder="https://facebook.com/yourclinic"
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
                                    placeholder="https://instagram.com/yourclinic"
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
                                    placeholder="https://twitter.com/yourclinic"
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
                                    placeholder="https://linkedin.com/company/yourclinic"
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
                                    placeholder="https://wa.me/966501234567"
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
                                    placeholder="https://youtube.com/@yourclinic"
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
                  </div>
                )}
              </div>
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
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button
                type="submit"
                disabled={isLoading || !form.formState.isDirty}
                className="w-full sm:w-auto h-[48px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-lato disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-2" />
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