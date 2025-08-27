'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRightIcon, ArrowLeftIcon } from 'lucide-react';
import { organizationOverviewSchema, type OrganizationOverview } from '@/lib/validation/onboarding';
import { LogoUpload } from '@/components/ui/file-upload';
import { useState } from 'react';
import { toast } from 'sonner';

interface OrganizationOverviewFormProps {
  data?: Partial<OrganizationOverview>;
  onNext: (data: OrganizationOverview) => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

export function OrganizationOverviewForm({ 
  data, 
  onNext, 
  onPrevious, 
  isLoading = false 
}: OrganizationOverviewFormProps) {
  const [logoUrl, setLogoUrl] = useState<string>(data?.logoUrl || '');

  const form = useForm<OrganizationOverview>({
    resolver: zodResolver(organizationOverviewSchema),
    defaultValues: {
      name: data?.name || '',
      legalName: data?.legalName || '',
      yearEstablished: data?.yearEstablished || undefined,
      overview: data?.overview || '',
      goals: data?.goals || '',
      vision: data?.vision || '',
      mission: data?.mission || '',
      ceoName: data?.ceoName || '',
      logoUrl: data?.logoUrl || '',
      registrationNumber: data?.registrationNumber || '',
    },
  });

  const handleLogoUpload = async (file: File): Promise<{ url: string; id: string }> => {
    // Mock upload function - replace with real upload logic
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTimeout(() => {
          resolve({
            url: result, // In production, this would be the uploaded URL
            id: `logo-${Date.now()}`
          });
        }, 1000);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUploadComplete = (result: { url: string; id: string }) => {
    setLogoUrl(result.url);
    form.setValue('logoUrl', result.url);
    toast.success('Logo uploaded successfully!');
  };

  const handleLogoError = (error: string) => {
    toast.error(error);
  };

  const onSubmit = async (formData: OrganizationOverview) => {
    try {
      // Include the logo URL in form data
      const finalData = {
        ...formData,
        logoUrl: logoUrl
      };
      
      onNext(finalData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save organization overview');
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
              <div className="relative w-fit mt-[-1.00px] font-title-12px-regular font-[number:var(--title-12px-regular-font-weight)] text-on-surface-secondary text-[length:var(--title-12px-regular-font-size)] tracking-[var(--title-12px-regular-letter-spacing)] leading-[var(--title-12px-regular-line-height)] whitespace-nowrap [font-style:var(--title-12px-regular-font-style)]">
                Back to Choosing Plan Page
              </div>
            </div>
            <div className="self-stretch text-[length:var(--h5-22px-bold-font-size)] leading-[var(--h5-22px-bold-line-height)] relative font-h5-22px-bold font-[number:var(--h5-22px-bold-font-weight)] text-on-surface-primary tracking-[var(--h5-22px-bold-letter-spacing)] [font-style:var(--h5-22px-bold-font-style)]">
              Fill in Company Details
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-1 py-0 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex-1 mt-[-1.00px] text-[length:var(--title-14px-semibold-font-size)] leading-[var(--title-14px-semibold-line-height)] relative font-title-14px-semibold font-[number:var(--title-14px-semibold-font-weight)] text-on-surface-primary tracking-[var(--title-14px-semibold-letter-spacing)] [font-style:var(--title-14px-semibold-font-style)]">
            Company Overview
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="relative self-stretch w-full bg-bg-subtle rounded-2xl overflow-hidden border-0">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Logo Upload Section */}
              <div className="flex items-start gap-8">
                <div className="w-40 pt-6">
                  <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                    Logo*
                  </label>
                </div>
                <div className="w-[360px]">
                  <LogoUpload
                    value={logoUrl || ''}
                    onFileUpload={handleLogoUpload}
                    onUploadComplete={handleLogoUploadComplete}
                    onError={handleLogoError}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Company Names */}
              <div className="flex items-start gap-8">
                <div className="w-40">
                  <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                    Company Name*
                  </label>
                </div>
                <div className="flex flex-col w-[360px] items-start gap-6 relative">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            placeholder="Enter Trade Name"
                            className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="legalName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            placeholder="Enter Legal Name"
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

              {/* Year of Establishment */}
              <div className="flex items-center gap-8">
                <div className="w-40">
                  <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                    Year of Establishment
                  </label>
                </div>
                <FormField
                  control={form.control}
                  name="yearEstablished"
                  render={({ field }) => (
                    <FormItem className="w-[360px]">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2020"
                          min="1800"
                          max={new Date().getFullYear()}
                          className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* CEO Name */}
              <div className="flex items-center gap-8">
                <div className="w-40">
                  <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                    CEO Name*
                  </label>
                </div>
                <FormField
                  control={form.control}
                  name="ceoName"
                  render={({ field }) => (
                    <FormItem className="w-[360px]">
                      <FormControl>
                        <Input
                          placeholder="Enter Name"
                          className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Company Overview Text Areas */}
              <div className="space-y-8">
                <h3 className="text-lg font-semibold text-[#000000]">Company Overview</h3>
                
                {/* Overview */}
                <div className="flex items-start gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Overview
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="overview"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <div className="flex flex-col items-start px-4 py-2 relative self-stretch w-full flex-[0_0_auto] bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]">
                            <Textarea
                              placeholder="Enter Overview"
                              className="relative self-stretch h-16 [font-family:'Lato',Helvetica] font-normal text-gray-600 text-base tracking-[0] leading-6 border-0 p-0 resize-none"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Vision */}
                <div className="flex items-start gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Vision
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="vision"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <div className="flex flex-col items-start px-4 py-2 relative self-stretch w-full flex-[0_0_auto] bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]">
                            <Textarea
                              placeholder="Enter Vision"
                              className="relative self-stretch h-16 [font-family:'Lato',Helvetica] font-normal text-gray-600 text-base tracking-[0] leading-6 border-0 p-0 resize-none"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Goals */}
                <div className="flex items-start gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Goals
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <div className="flex flex-col items-start px-4 py-2 relative self-stretch w-full flex-[0_0_auto] bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]">
                            <Textarea
                              placeholder="Enter Goals"
                              className="relative self-stretch h-16 [font-family:'Lato',Helvetica] font-normal text-gray-600 text-base tracking-[0] leading-6 border-0 p-0 resize-none"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Mission */}
                <div className="flex items-start gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Mission
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <div className="flex flex-col items-start px-4 py-2 relative self-stretch w-full flex-[0_0_auto] bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]">
                            <Textarea
                              placeholder="Enter Mission"
                              className="relative self-stretch h-16 [font-family:'Lato',Helvetica] font-normal text-gray-600 text-base tracking-[0] leading-6 border-0 p-0 resize-none"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Registration Number */}
                <div className="flex items-center gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Registration Number
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <Input
                            placeholder="Enter Registration Number"
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