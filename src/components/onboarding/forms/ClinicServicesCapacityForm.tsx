'use client';

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon, StethoscopeIcon, UsersIcon, ClockIcon } from "lucide-react";
import { toast } from 'sonner';
import { ClinicServicesCapacityDto } from '@/types/onboarding';
import { saveClinicServicesCapacity } from '@/api/onboardingApiClient';

// Service name validation function removed - services don't need to be unique

// Service validation schema
const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  durationMinutes: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  price: z.number().min(0, 'Price cannot be negative').optional()
});

// Capacity validation schema (kept for legacy support but marked as optional)
const capacitySchema = z.object({
  maxStaff: z.number().min(1, 'Max staff must be at least 1').optional(),
  maxDoctors: z.number().min(1, 'Max doctors must be at least 1').optional(),
  maxPatients: z.number().min(1, 'Max patients must be at least 1').optional(),
  sessionDuration: z.number().min(5, 'Session duration must be at least 5 minutes').optional()
});

// Form validation schema matching ClinicServicesCapacityDto
const clinicServicesCapacitySchema = z.object({
  services: z.array(serviceSchema).min(1, 'At least one service is required'),
  capacity: capacitySchema.optional()
});

type ClinicServicesCapacityFormData = z.infer<typeof clinicServicesCapacitySchema>;

interface ClinicServicesCapacityFormProps {
  onNext: (data: ClinicServicesCapacityDto) => void;
  onPrevious: () => void;
  initialData?: Partial<ClinicServicesCapacityDto>;
  complexDepartmentId?: string; // Add complexDepartmentId as optional prop
  isLoading?: boolean;
}

export const ClinicServicesCapacityForm: React.FC<ClinicServicesCapacityFormProps> = ({
  onNext,
  onPrevious,
  initialData = {},
  complexDepartmentId, // Add to destructured props
  isLoading = false
}) => {
  const [isServicesExpanded, setIsServicesExpanded] = useState(true);
  const [isCapacityExpanded, setIsCapacityExpanded] = useState(false);

  const form = useForm<ClinicServicesCapacityFormData>({
    resolver: zodResolver(clinicServicesCapacitySchema),
    defaultValues: {
      services: initialData.services || [{ name: '', description: '', durationMinutes: 30, price: 0 }],
      capacity: initialData.capacity || {
        maxStaff: 50,
        maxDoctors: 10,
        maxPatients: 500,
        sessionDuration: 30
      }
    }
  });

  // Trigger validation when form values change
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change' && name) {
        form.trigger(name);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: 'services'
  });

  const addService = () => {
    appendService({ name: '', description: '', durationMinutes: 30, price: 0 });
  };

  const onSubmit = async (data: ClinicServicesCapacityFormData) => {
    try {
      // Check for existing services from overview form
      const existingServices = initialData?.services || [];
      const newServices = data.services?.filter(service => service.name.trim() !== '') || [];
      
      // Note: Service uniqueness validation removed as per requirements
      // Services don't need to be unique across the system
      
      if (existingServices.length > 0) {
        toast.info('Services detected from overview form', {
          description: 'This form is for capacity management. Services were already configured in the overview step.'
        });
      }

      // Transform form data to ClinicServicesCapacityDto
      const servicesCapacityData: ClinicServicesCapacityDto = {
        services: data.services?.filter(service => service.name.trim() !== ''),
        capacity: data.capacity
      };

      // Save to backend
      const response = await saveClinicServicesCapacity(servicesCapacityData);
      
      if (response.success) {
        toast.success('Clinic services and capacity saved successfully!');
        onNext(servicesCapacityData);
      } else {
        throw new Error(response.message || 'Failed to save clinic services and capacity');
      }
    } catch (error: any) {
      console.error('Error saving clinic services and capacity:', error);
      
      if (error.validationError && error.errors) {
        // Handle field-specific validation errors
        error.errors.forEach((err: any) => {
          form.setError(err.field, {
            type: 'manual',
            message: err.message
          });
        });
      } else {
        toast.error('Failed to save clinic services and capacity', {
          description: error.message || 'An unexpected error occurred'
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>Clinic Setup</span>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-primary font-medium">Services & Capacity</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Services & Capacity
        </h1>
        <p className="text-gray-600">
          Configure the medical services offered and clinic capacity settings
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Medical Services Section */}
          <Card>
            <Collapsible open={isServicesExpanded} onOpenChange={setIsServicesExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <StethoscopeIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Medical Services</h2>
                      <p className="text-sm text-gray-600">Services offered by your clinic</p>
                    </div>
                  </div>
                  {isServicesExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  <div className="space-y-4">
                    {serviceFields.map((field, index) => (
                      <Card key={field.id} className="border-gray-200 bg-gray-50">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">Service #{index + 1}</h4>
                            {serviceFields.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeService(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Service Name */}
                            <FormField
                              control={form.control}
                              name={`services.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Service Name *</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., General Consultation"
                                      className="h-10"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {/* Duration */}
                            <FormField
                              control={form.control}
                              name={`services.${index}.durationMinutes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration (minutes)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="30"
                                      className="h-10"
                                      disabled={isLoading}
                                      {...field}
                                      value={field.value || ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(value ? parseInt(value) : undefined);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Description */}
                            <FormField
                              control={form.control}
                              name={`services.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      placeholder="Brief description of the service"
                                      className="min-h-[80px] resize-none"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {/* Price */}
                            <FormField
                              control={form.control}
                              name={`services.${index}.price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      className="h-10"
                                      disabled={isLoading}
                                      {...field}
                                      value={field.value || ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        field.onChange(value ? parseFloat(value) : undefined);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {serviceFields.length < 20 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addService}
                        className="w-full h-12 border-dashed"
                        disabled={isLoading}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Medical Service
                      </Button>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <StethoscopeIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-900 mb-1">Service Information</h3>
                        <p className="text-sm text-blue-700">
                          Add all the medical services your clinic offers. You can always add more services 
                          or modify existing ones later through the clinic management dashboard.
                        </p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Capacity Settings Section */}
          <Card>
            <Collapsible open={isCapacityExpanded} onOpenChange={setIsCapacityExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <UsersIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Capacity Settings</h2>
                      <p className="text-sm text-gray-600">Optional capacity configuration</p>
                    </div>
                  </div>
                  {isCapacityExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Max Staff */}
                    <FormField
                      control={form.control}
                      name="capacity.maxStaff"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Staff</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50"
                              className="h-12"
                              disabled={isLoading}
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value ? parseInt(value) : undefined);
                              }}
                            />
                          </FormControl>
                          <div className="text-xs text-gray-500">
                            Maximum number of staff members
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Max Doctors */}
                    <FormField
                      control={form.control}
                      name="capacity.maxDoctors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Doctors</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10"
                              className="h-12"
                              disabled={isLoading}
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value ? parseInt(value) : undefined);
                              }}
                            />
                          </FormControl>
                          <div className="text-xs text-gray-500">
                            Maximum number of doctors
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Max Patients */}
                    <FormField
                      control={form.control}
                      name="capacity.maxPatients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Patients</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="500"
                              className="h-12"
                              disabled={isLoading}
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value ? parseInt(value) : undefined);
                              }}
                            />
                          </FormControl>
                          <div className="text-xs text-gray-500">
                            Maximum number of patients
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Session Duration */}
                    <FormField
                      control={form.control}
                      name="capacity.sessionDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Session Duration</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="30"
                              className="h-12"
                              disabled={isLoading}
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value ? parseInt(value) : undefined);
                              }}
                            />
                          </FormControl>
                          <div className="text-xs text-gray-500">
                            Default session duration in minutes
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-900 mb-1">Optional Configuration</h3>
                        <p className="text-sm text-amber-700">
                          Capacity settings are optional and have been set to reasonable defaults. 
                          You can adjust these values later in the clinic settings. These limits 
                          help manage system resources and ensure optimal performance.
                        </p>
                      </div>
                    </div>
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
                  <h3 className="font-medium text-green-900 mb-2">Services & Capacity Management</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>• <strong>Services:</strong> Define all medical services your clinic provides with descriptions, durations, and pricing.</p>
                    <p>• <strong>Capacity:</strong> Set operational limits to ensure smooth clinic management and system performance.</p>
                    <p>• <strong>Flexibility:</strong> All settings can be modified later through the clinic management dashboard.</p>
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