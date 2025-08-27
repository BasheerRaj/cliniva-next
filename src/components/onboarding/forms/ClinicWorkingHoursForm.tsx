'use client';

import React, { useState } from "react";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, ClockIcon } from "lucide-react";
import { toast } from 'sonner';
import { ClinicWorkingHoursDto } from '@/types/onboarding';
import { saveClinicSchedule } from '@/api/onboardingApiClient';

// Working hours validation schema
const workingHourSchema = z.object({
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  isWorkingDay: z.boolean(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional()
});

const clinicWorkingHoursSchema = z.object({
  workingHours: z.array(workingHourSchema)
});

type ClinicWorkingHoursFormData = z.infer<typeof clinicWorkingHoursSchema>;

interface ClinicWorkingHoursFormProps {
  onNext: (data: ClinicWorkingHoursDto[]) => void;
  onPrevious: () => void;
  initialData?: ClinicWorkingHoursDto[];
  parentData?: any;
  isLoading?: boolean;
}

const getDaysOfWeek = () => [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export const ClinicWorkingHoursForm: React.FC<ClinicWorkingHoursFormProps> = ({
  onNext,
  onPrevious,
  initialData = [],
  parentData,
  isLoading = false
}) => {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']));

  const form = useForm<ClinicWorkingHoursFormData>({
    resolver: zodResolver(clinicWorkingHoursSchema),
    defaultValues: {
      workingHours: getDaysOfWeek().map(day => {
        const existing = initialData.find(wh => wh.dayOfWeek === day);
        return existing || {
          dayOfWeek: day as any,
          isWorkingDay: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day),
          openingTime: '09:00',
          closingTime: '17:00',
          breakStartTime: '12:00',
          breakEndTime: '13:00'
        };
      })
    }
  });

  const { fields: workingHoursFields } = useFieldArray({
    control: form.control,
    name: 'workingHours'
  });

  const toggleDay = (index: number, dayOfWeek: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayOfWeek)) {
        newSet.delete(dayOfWeek);
      } else {
        newSet.add(dayOfWeek);
      }
      return newSet;
    });
  };

  const onSubmit = async (data: ClinicWorkingHoursFormData) => {
    try {
      // Filter out non-working days and validate
      const workingDays = data.workingHours.filter(wh => wh.isWorkingDay);
      
      // Basic validation
      const errors: string[] = [];
      workingDays.forEach(day => {
        if (day.openingTime && day.closingTime && day.openingTime >= day.closingTime) {
          errors.push(`${day.dayOfWeek}: Opening time must be before closing time`);
        }
      });

      if (errors.length > 0) {
        toast.error(`Please fix the following errors:\n${errors.join('\n')}`);
        return;
      }

      // Save to backend
      const response = await saveClinicSchedule(data.workingHours);
      
      if (response.success) {
        toast.success('Clinic working hours saved successfully!');
        onNext(data.workingHours);
      } else {
        throw new Error(response.message || 'Failed to save clinic working hours');
      }
    } catch (error: any) {
      console.error('Error saving clinic working hours:', error);
      toast.error(error.message || 'Failed to save clinic working hours');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>Clinic Setup</span>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-primary font-medium">Working Hours</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Clinic Working Hours
        </h1>
        <p className="text-gray-600">
          Set your clinic's operating schedule for each day of the week
        </p>
      </div>

      {/* Validation Warning for Complex/Company Plans */}
      {(parentData?.planType === 'company' || parentData?.planType === 'complex') && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Working Hours Validation</h3>
              <p className="text-sm text-blue-700">
                Please ensure your clinic's working hours are within the operating hours of your {parentData?.planType === 'company' ? 'complex' : 'organization'}.
                Clinic hours cannot extend beyond the parent entity's schedule.
              </p>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {workingHoursFields.map((field, index) => (
            <Card key={field.id}>
              <Collapsible 
                open={expandedDays.has(field.dayOfWeek)} 
                onOpenChange={() => toggleDay(index, field.dayOfWeek)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FormField
                        control={form.control}
                        name={`workingHours.${index}.isWorkingDay`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div>
                        <h3 className="text-lg font-semibold capitalize">
                          {field.dayOfWeek}
                        </h3>
                        <FormField
                          control={form.control}
                          name={`workingHours.${index}.isWorkingDay`}
                          render={({ field }) => (
                            <p className="text-sm text-gray-600">
                              {field.value ? 'Working Day' : 'Closed'}
                            </p>
                          )}
                        />
                      </div>
                    </div>
                    {expandedDays.has(field.dayOfWeek) ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <FormField
                    control={form.control}
                    name={`workingHours.${index}.isWorkingDay`}
                    render={({ field }) => (
                      <>
                        {field.value && (
                          <CardContent className="px-4 pb-4 pt-0 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Opening Time */}
                              <FormField
                                control={form.control}
                                name={`workingHours.${index}.openingTime`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Opening Time</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="time"
                                        {...field}
                                        className="h-10"
                                        disabled={isLoading}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Closing Time */}
                              <FormField
                                control={form.control}
                                name={`workingHours.${index}.closingTime`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Closing Time</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="time"
                                        {...field}
                                        className="h-10"
                                        disabled={isLoading}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Break Start Time */}
                              <FormField
                                control={form.control}
                                name={`workingHours.${index}.breakStartTime`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Break Start (Optional)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="time"
                                        {...field}
                                        className="h-10"
                                        disabled={isLoading}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Break End Time */}
                              <FormField
                                control={form.control}
                                name={`workingHours.${index}.breakEndTime`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Break End (Optional)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="time"
                                        {...field}
                                        className="h-10"
                                        disabled={isLoading}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        )}
                      </>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}

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
                disabled={isLoading || !form.formState.isValid}
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