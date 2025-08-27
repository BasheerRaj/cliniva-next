'use client';

import React, { useState } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, ClockIcon, CalendarIcon, CheckCircle, BuildingIcon, AlertTriangleIcon } from "lucide-react";
import { toast } from 'sonner';
import { ClinicWorkingHoursDto } from '@/types/onboarding';
import { saveClinicSchedule } from '@/api/onboardingApiClient';

// Working hours schema based on ClinicWorkingHoursDto
const workingDaySchema = z.object({
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  isWorkingDay: z.boolean(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional()
}).refine((data) => {
  if (data.isWorkingDay) {
    return data.openingTime && data.closingTime;
  }
  return true;
}, {
  message: "Opening and closing times are required for working days",
  path: ["openingTime"]
}).refine((data) => {
  if (data.breakStartTime && data.breakEndTime) {
    return data.breakStartTime < data.breakEndTime;
  }
  return true;
}, {
  message: "Break start time must be before break end time",
  path: ["breakStartTime"]
});

const clinicScheduleSchema = z.object({
  workingHours: z.array(workingDaySchema)
}).refine((data) => {
  const workingDays = data.workingHours.filter(day => day.isWorkingDay);
  return workingDays.length > 0;
}, {
  message: "At least one working day must be selected",
  path: ["workingHours"]
});

type ClinicScheduleFormData = z.infer<typeof clinicScheduleSchema>;

interface ClinicScheduleFormProps {
  onNext: (data: ClinicWorkingHoursDto[]) => void;
  onPrevious: () => void;
  initialData?: ClinicWorkingHoursDto[];
  complexSchedule?: any; // Complex working hours for validation
  planType?: 'company' | 'complex' | 'clinic';
  isLoading?: boolean;
  formData?: any;
  currentStep?: number;
}

export const ClinicScheduleForm: React.FC<ClinicScheduleFormProps> = ({
  onNext,
  onPrevious,
  initialData = [],
  complexSchedule,
  planType = 'clinic',
  isLoading = false
}) => {
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const defaultWorkingHours: ClinicWorkingHoursDto[] = initialData.length > 0 ? initialData : daysOfWeek.map(day => ({
    dayOfWeek: day.key as ClinicWorkingHoursDto['dayOfWeek'],
    isWorkingDay: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day.key),
    openingTime: '09:00',
    closingTime: '17:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00'
  }));

  const form = useForm<ClinicScheduleFormData>({
    resolver: zodResolver(clinicScheduleSchema),
    defaultValues: {
      workingHours: defaultWorkingHours
    }
  });

  // Validate clinic hours against complex hours
  const validateAgainstComplexHours = (clinicHours: ClinicWorkingHoursDto[]): string[] => {
    const errors: string[] = [];
    
    if (planType === 'company' && complexSchedule && complexSchedule.length > 0) {
      clinicHours.forEach((clinicDay) => {
        if (!clinicDay.isWorkingDay) return;
        
        const complexDay = complexSchedule.find((cd: any) => cd.dayOfWeek === clinicDay.dayOfWeek);
        if (!complexDay || !complexDay.isWorkingDay) {
          errors.push(`${getDayLabel(clinicDay.dayOfWeek)}: Clinic is open but complex is closed on this day`);
          return;
        }
        
        if (clinicDay.openingTime && complexDay.openingTime && clinicDay.openingTime < complexDay.openingTime) {
          errors.push(`${getDayLabel(clinicDay.dayOfWeek)}: Clinic opening time (${clinicDay.openingTime}) cannot be before complex opening time (${complexDay.openingTime})`);
        }
        
        if (clinicDay.closingTime && complexDay.closingTime && clinicDay.closingTime > complexDay.closingTime) {
          errors.push(`${getDayLabel(clinicDay.dayOfWeek)}: Clinic closing time (${clinicDay.closingTime}) cannot be after complex closing time (${complexDay.closingTime})`);
        }
      });
    }
    
    return errors;
  };

  const getDayLabel = (dayOfWeek: string): string => {
    return daysOfWeek.find(d => d.key === dayOfWeek)?.label || dayOfWeek;
  };

  const onSubmit = async (data: ClinicScheduleFormData) => {
    try {
      // Validate against complex schedule if needed
      const errors = validateAgainstComplexHours(data.workingHours);
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast.error('Schedule conflicts with complex hours. Please review the errors below.');
        return;
      }
      
      setValidationErrors([]);

      // Save to backend
      const response = await saveClinicSchedule(data.workingHours);
      
      if (response.success) {
        toast.success('Clinic schedule saved successfully!');
        onNext(data.workingHours);
      } else {
        throw new Error(response.message || 'Failed to save clinic schedule');
      }
    } catch (error: any) {
      console.error('Error saving clinic schedule:', error);
      
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
        toast.error(error.message || 'Failed to save clinic schedule');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span>Clinic Setup</span>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-primary font-medium">Schedule & Hours</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Clinic Working Hours
        </h1>
        <p className="text-gray-600">
          Set your clinic's operating hours and break times
        </p>
      </div>

      {/* Complex Schedule Constraint Notice */}
      {planType === 'company' && complexSchedule && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <BuildingIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Complex Schedule Constraints</h3>
                <p className="text-sm text-blue-700">
                  Your clinic hours must be within your complex's operating hours. 
                  The complex schedule will be used to validate your clinic's availability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 mb-2">Schedule Conflicts</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Working Hours Section */}
          <Card>
            <Collapsible open={isScheduleExpanded} onOpenChange={setIsScheduleExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Weekly Schedule</h2>
                      <p className="text-sm text-gray-600">Set working hours for each day</p>
                    </div>
                  </div>
                  {isScheduleExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  <div className="space-y-4">
                    {daysOfWeek.map((day, index) => (
                      <Card key={day.key} className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            
                            {/* Day and Working Day Toggle */}
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">{day.label}</h3>
                              <FormField
                                control={form.control}
                                name={`workingHours.${index}.isWorkingDay`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoading}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      Open on {day.label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Working Hours Fields */}
                            {form.watch(`workingHours.${index}.isWorkingDay`) && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t">
                                
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

                                {/* Break Start Time */}
                                <FormField
                                  control={form.control}
                                  name={`workingHours.${index}.breakStartTime`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Break Start</FormLabel>
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
                                      <FormLabel>Break End</FormLabel>
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
                            )}

                            {/* Complex Hours Reference */}
                            {planType === 'company' && complexSchedule && (
                              (() => {
                                const complexDay = complexSchedule.find((cd: any) => cd.dayOfWeek === day.key);
                                if (complexDay && complexDay.isWorkingDay) {
                                  return (
                                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                      Complex hours: {complexDay.openingTime} - {complexDay.closingTime}
                                      {complexDay.breakStartTime && complexDay.breakEndTime && 
                                        ` (Break: ${complexDay.breakStartTime} - ${complexDay.breakEndTime})`
                                      }
                                    </div>
                                  );
                                }
                                return null;
                              })()
                            )}

                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-900 mb-1">Schedule Guidelines</h3>
                        <div className="text-sm text-amber-700 space-y-1">
                          <p>• Select at least one working day for your clinic</p>
                          <p>• Break times are optional but help manage staff scheduling</p>
                          <p>• Use 24-hour format (e.g., 09:00, 17:30)</p>
                          {planType === 'company' && <p>• Clinic hours must be within your complex's operating hours</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Schedule Summary */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900 mb-2">Schedule Summary</h3>
                  <div className="text-sm text-green-700">
                    {form.watch('workingHours')?.filter(day => day.isWorkingDay).length > 0 ? (
                      <div className="space-y-1">
                        <p className="font-medium">Working Days:</p>
                        {form.watch('workingHours')?.filter(day => day.isWorkingDay).map(day => (
                          <p key={day.dayOfWeek}>
                            • <span className="capitalize">{day.dayOfWeek}</span>: {day.openingTime} - {day.closingTime}
                            {day.breakStartTime && day.breakEndTime && ` (Break: ${day.breakStartTime} - ${day.breakEndTime})`}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p>Please select at least one working day</p>
                    )}
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
                    Complete Setup
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