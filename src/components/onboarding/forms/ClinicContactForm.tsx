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
  StethoscopeIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { clinicContactSchema, type ClinicContact } from '@/lib/validation/onboarding';
import { ClinicContactDto } from '@/types/onboarding';
import { saveClinicContact } from '@/api/onboardingApiClient';

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>Clinic Setup</span>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-primary font-medium">Contact Information</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Contact Information
        </h1>
        <p className="text-gray-600">
          Provide contact details for your clinic including address, phone numbers, and emergency contacts
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Address Information Section */}
          <Card>
            <Collapsible open={isAddressExpanded} onOpenChange={setIsAddressExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Address Information</h2>
                      <p className="text-sm text-gray-600">Physical location and address details</p>
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
                            placeholder="123 Medical Center Street"
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
                              placeholder="Riyadh"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* State/Province */}
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Riyadh Province"
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
                              placeholder="Saudi Arabia"
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
                            placeholder="https://maps.google.com/... or coordinates"
                            className="h-12"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          You can paste a Google Maps link or enter coordinates
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Contact Information Section */}
          <Card>
            <Collapsible open={isContactExpanded} onOpenChange={setIsContactExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
                      <p className="text-sm text-gray-600">Phone numbers and email address</p>
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

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="clinic@example.com"
                            className="h-12"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Numbers */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-medium">Phone Numbers</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendPhone({ number: '', type: 'secondary', label: '' })}
                        disabled={isLoading}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Phone
                      </Button>
                    </div>

                    {phoneFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg bg-gray-50">
                        {/* Phone Number */}
                        <FormField
                          control={form.control}
                          name={`phoneNumbers.${index}.number`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="+966 11 123 4567"
                                  className="h-10"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Phone Type */}
                        <FormField
                          control={form.control}
                          name={`phoneNumbers.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Select type" />
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

                        {/* Label */}
                        <FormField
                          control={form.control}
                          name={`phoneNumbers.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Label</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Main office"
                                  className="h-10"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Remove Button */}
                        <div className="flex items-end">
                          {phoneFields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removePhone(index)}
                              disabled={isLoading}
                              className="h-10 w-full"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Emergency Contact Section */}
          <Card>
            <Collapsible open={isEmergencyExpanded} onOpenChange={setIsEmergencyExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-red-500" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Emergency Contact</h2>
                      <p className="text-sm text-gray-600">Emergency contact person for the clinic</p>
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
                              placeholder="Dr. John Smith"
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
                              placeholder="Head Doctor, Manager, etc."
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
                    {/* Emergency Contact Phone */}
                    <FormField
                      control={form.control}
                      name="emergencyContact.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              placeholder="+966 50 123 4567"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Emergency Contact Email */}
                    <FormField
                      control={form.control}
                      name="emergencyContact.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="emergency@clinic.com"
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

          {/* Social Media Section */}
          <Card>
            <Collapsible open={isSocialMediaExpanded} onOpenChange={setIsSocialMediaExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <GlobeIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Social Media & Web Presence</h2>
                      <p className="text-sm text-gray-600">Social media links and online presence</p>
                    </div>
                  </div>
                  {isSocialMediaExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Website */}
                    <FormField
                      control={form.control}
                      name="socialMediaLinks.website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://www.yourclinic.com"
                              className="h-12"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              placeholder="https://facebook.com/yourclinic"
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
                              placeholder="https://instagram.com/yourclinic"
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
                              placeholder="https://linkedin.com/company/yourclinic"
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
                              placeholder="https://wa.me/966501234567"
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
                              placeholder="https://youtube.com/c/yourclinic"
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

          {/* Information Card */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <StethoscopeIcon className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900 mb-2">Contact Information Guidelines</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>• <strong>Required:</strong> At least one phone number is recommended for patient contact.</p>
                    <p>• <strong>Emergency Contact:</strong> Designate a person available for urgent clinic matters.</p>
                    <p>• <strong>Social Media:</strong> Optional but helps patients find and connect with your clinic.</p>
                    <p>• <strong>Privacy:</strong> All contact information can be updated later in clinic settings.</p>
                  </div>
                </div>
              </div>
            </CardContent>
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
                disabled={isLoading || !form.formState.isDirty}
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