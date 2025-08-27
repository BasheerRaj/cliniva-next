'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRightIcon, ArrowLeftIcon, MapPinIcon, PhoneIcon, MailIcon, GlobeIcon } from 'lucide-react';
import { organizationContactSchema, type OrganizationContact } from '@/lib/validation/onboarding';

interface OrganizationContactFormProps {
  data?: Partial<OrganizationContact>;
  onNext: (data: OrganizationContact) => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

export function OrganizationContactForm({ 
  data, 
  onNext, 
  onPrevious, 
  isLoading = false 
}: OrganizationContactFormProps) {
  
  const form = useForm<OrganizationContact>({
    resolver: zodResolver(organizationContactSchema),
    defaultValues: {
      address: data?.address || '',
      googleLocation: data?.googleLocation || '',
      phone: data?.phone || '',
      email: data?.email || '',
      website: data?.website || '',
      emergencyContactName: data?.emergencyContactName || '',
      emergencyContactPhone: data?.emergencyContactPhone || '',
      socialMediaLinks: {
        facebook: data?.socialMediaLinks?.facebook || '',
        instagram: data?.socialMediaLinks?.instagram || '',
        twitter: data?.socialMediaLinks?.twitter || '',
        linkedin: data?.socialMediaLinks?.linkedin || '',
        whatsapp: data?.socialMediaLinks?.whatsapp || '',
      },
    },
  });

  const onSubmit = async (formData: OrganizationContact) => {
    try {
      onNext(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 pl-0 pr-5 py-4 relative flex-1 self-stretch grow">
      {/* Header */}
      <div className="flex flex-col items-start justify-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex items-center justify-between pl-1 pr-0 py-0 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col w-[340px] items-start gap-1.5 px-0 py-0.5 relative">
            <div className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]">
              <ArrowLeftIcon className="relative w-4 h-4" />
              <div className="relative w-fit mt-[-1.00px] font-title-12px-regular text-on-surface-secondary">
                Back to Company Overview
              </div>
            </div>
            <div className="self-stretch text-[length:var(--h5-22px-bold-font-size)] leading-[var(--h5-22px-bold-line-height)] relative font-h5-22px-bold font-[number:var(--h5-22px-bold-font-weight)] text-on-surface-primary tracking-[var(--h5-22px-bold-letter-spacing)]">
              Fill in Company Details
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-1 py-0 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex-1 mt-[-1.00px] text-[length:var(--title-14px-semibold-font-size)] leading-[var(--title-14px-semibold-line-height)] relative font-title-14px-semibold font-[number:var(--title-14px-semibold-font-weight)] text-on-surface-primary tracking-[var(--title-14px-semibold-letter-spacing)]">
            Contact Details
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="relative self-stretch w-full bg-bg-subtle rounded-2xl overflow-hidden border-0">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Address Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#000000] flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5" />
                  Address Information
                </h3>
                
                <div className="flex items-start gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Address
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <Input
                            placeholder="Enter full address"
                            className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-start gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Google Location
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="googleLocation"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <Input
                            placeholder="Google Maps coordinates or place ID"
                            className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#000000] flex items-center gap-2">
                  <PhoneIcon className="w-5 h-5" />
                  Contact Information
                </h3>

                <div className="flex items-center gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Phone
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <Input
                            placeholder="+1 (555) 123-4567"
                            type="tel"
                            className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Email
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <Input
                            placeholder="contact@company.com"
                            type="email"
                            className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Website
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <Input
                            placeholder="https://www.company.com"
                            type="url"
                            className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#000000] flex items-center gap-2">
                  <PhoneIcon className="w-5 h-5 text-red-500" />
                  Emergency Contact
                </h3>

                <div className="flex items-center gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Contact Name
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <Input
                            placeholder="Emergency contact person"
                            className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Contact Phone
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <Input
                            placeholder="+1 (555) 123-4567"
                            type="tel"
                            className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Social Media Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#000000] flex items-center gap-2">
                  <GlobeIcon className="w-5 h-5" />
                  Social Media Links
                </h3>

                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center gap-8">
                    <div className="w-40">
                      <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                        Facebook
                      </label>
                    </div>
                    <FormField
                      control={form.control}
                      name="socialMediaLinks.facebook"
                      render={({ field }) => (
                        <FormItem className="w-[360px]">
                          <FormControl>
                            <Input
                              placeholder="https://facebook.com/yourcompany"
                              type="url"
                              className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="w-40">
                      <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                        Instagram
                      </label>
                    </div>
                    <FormField
                      control={form.control}
                      name="socialMediaLinks.instagram"
                      render={({ field }) => (
                        <FormItem className="w-[360px]">
                          <FormControl>
                            <Input
                              placeholder="https://instagram.com/yourcompany"
                              type="url"
                              className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="w-40">
                      <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                        LinkedIn
                      </label>
                    </div>
                    <FormField
                      control={form.control}
                      name="socialMediaLinks.linkedin"
                      render={({ field }) => (
                        <FormItem className="w-[360px]">
                          <FormControl>
                            <Input
                              placeholder="https://linkedin.com/company/yourcompany"
                              type="url"
                              className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="w-40">
                      <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                        WhatsApp
                      </label>
                    </div>
                    <FormField
                      control={form.control}
                      name="socialMediaLinks.whatsapp"
                      render={({ field }) => (
                        <FormItem className="w-[360px]">
                          <FormControl>
                            <Input
                              placeholder="https://wa.me/1234567890"
                              type="url"
                              className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrevious}
                  className="flex w-[200px] items-center justify-center px-4 py-2.5 relative rounded-[20px] border-2 border-solid border-[#e4e2dd] h-auto"
                >
                  <div className="flex items-center gap-1">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span className="font-btn-14px-medium">Previous</span>
                  </div>
                </Button>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="flex w-[200px] h-10 items-center justify-center gap-1 pl-4 pr-3.5 py-2.5 relative bg-secondary-dark rounded-[20px] h-auto"
                >
                  <span className="font-btn-14px-medium text-surface-default">
                    {isLoading ? 'Saving...' : 'Next'}
                  </span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 