'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRightIcon, ArrowLeftIcon, FileTextIcon, ShieldIcon } from 'lucide-react';
import { organizationLegalSchema, type OrganizationLegal } from '@/lib/validation/onboarding';

interface OrganizationLegalFormProps {
  data?: Partial<OrganizationLegal>;
  onNext: (data: OrganizationLegal) => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

export function OrganizationLegalForm({ 
  data, 
  onNext, 
  onPrevious, 
  isLoading = false 
}: OrganizationLegalFormProps) {
  
  const form = useForm<OrganizationLegal>({
    resolver: zodResolver(organizationLegalSchema),
    defaultValues: {
      vatNumber: data?.vatNumber || '',
      crNumber: data?.crNumber || '',
      termsConditionsUrl: data?.termsConditionsUrl || '',
      privacyPolicyUrl: data?.privacyPolicyUrl || '',
    },
  });

  const onSubmit = async (formData: OrganizationLegal) => {
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
                Back to Contact Details
              </div>
            </div>
            <div className="self-stretch text-[length:var(--h5-22px-bold-font-size)] leading-[var(--h5-22px-bold-line-height)] relative font-h5-22px-bold font-[number:var(--h5-22px-bold-font-weight)] text-on-surface-primary tracking-[var(--h5-22px-bold-letter-spacing)]">
              Fill in Company Details
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-1 py-0 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex-1 mt-[-1.00px] text-[length:var(--title-14px-semibold-font-size)] leading-[var(--title-14px-semibold-line-height)] relative font-title-14px-semibold font-[number:var(--title-14px-semibold-font-weight)] text-on-surface-primary tracking-[var(--title-14px-semibold-letter-spacing)]">
            Legal Information
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="relative self-stretch w-full bg-bg-subtle rounded-2xl overflow-hidden border-0">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Registration Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#000000] flex items-center gap-2">
                  <ShieldIcon className="w-5 h-5" />
                  Registration Information
                </h3>
                
                <div className="flex items-center gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      VAT Number
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="vatNumber"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <Input
                            placeholder="Enter VAT registration number"
                            className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500 mt-1">
                          Your Value Added Tax registration number
                        </p>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      CR Number
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="crNumber"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <Input
                            placeholder="Enter Commercial Registration number"
                            className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500 mt-1">
                          Your Commercial Registration certificate number
                        </p>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Legal Documents Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#000000] flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5" />
                  Legal Documents
                </h3>

                <div className="flex items-center gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Terms & Conditions
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="termsConditionsUrl"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <Input
                            placeholder="https://yourcompany.com/terms"
                            type="url"
                            className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500 mt-1">
                          URL link to your Terms and Conditions document
                        </p>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-8">
                  <div className="w-40">
                    <label className="relative [font-family:'Lato',Helvetica] font-medium text-on-surface-primary text-base tracking-[0] leading-4">
                      Privacy Policy
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="privacyPolicyUrl"
                    render={({ field }) => (
                      <FormItem className="w-[360px]">
                        <FormControl>
                          <Input
                            placeholder="https://yourcompany.com/privacy"
                            type="url"
                            className="flex h-12 px-4 py-2 self-stretch w-full bg-white rounded overflow-hidden border border-solid border-[#e4e2dd]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500 mt-1">
                          URL link to your Privacy Policy document
                        </p>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Information Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShieldIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Legal Compliance</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      Please ensure all legal information is accurate and up-to-date. This information will be used for:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Tax reporting and compliance</li>
                      <li>• Commercial registration verification</li>
                      <li>• Legal document accessibility for users</li>
                      <li>• Regulatory compliance requirements</li>
                    </ul>
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
                    {isLoading ? 'Saving...' : 'Complete Company Setup'}
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