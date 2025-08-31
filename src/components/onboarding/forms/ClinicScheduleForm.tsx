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
import { useClivinaTheme } from "@/hooks/useClivinaTheme";

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
  const { colors } = useClivinaTheme();

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
            Back to Services & Capacity
          </button>
          <h1 className="text-2xl font-bold mb-2 text-primary font-lato">
            Fill in Clinic Details
          </h1>
          <p className="text-muted-foreground font-lato">Schedule & Working Hours</p>
        </div>

        {/* Complex Schedule Constraint Notice */}
        {planType === 'company' && complexSchedule && (
          <Card className="mb-6 border-primary/20" style={{ backgroundColor: colors.primary.light }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <BuildingIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-primary mb-1 font-lato">Complex Schedule Constraints</h3>
                  <p className="text-sm text-primary/80 font-lato">
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
          <Card className="mb-6 border-destructive/20" style={{ backgroundColor: colors.surface.secondary }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangleIcon className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-medium text-destructive mb-2 font-lato">Schedule Conflicts</h3>
                  <ul className="text-sm text-destructive/80 space-y-1 font-lato">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
          
          {/* Working Hours Section */}
          <Card className="border-border bg-card">
            <Collapsible open={isScheduleExpanded} onOpenChange={setIsScheduleExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-hover">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-xl font-semibold text-foreground font-lato">Weekly Schedule</h2>
                      <p className="text-sm text-muted-foreground font-lato">Set working hours for each day</p>
                    </div>
                  </div>
                  {isScheduleExpanded ? (
                    <ChevronUpIcon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">

                  <div className="space-y-4">
                    {daysOfWeek.map((day, index) => (
                      <Card key={day.key} className="border-border bg-surface-tertiary">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            
                            {/* Day and Working Day Toggle */}
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-foreground font-lato">{day.label}</h3>
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
                                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal text-muted-foreground font-lato">
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
                                      <FormLabel className="text-sm font-bold text-primary font-lato">Opening Time</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="time"
                                          {...field}
                                          className="h-[48px] text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm"
                                          style={{
                                            boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                            borderRadius: '8px'
                                          }}
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
                                      <FormLabel className="text-sm font-bold text-primary font-lato">Closing Time</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="time"
                                          {...field}
                                          className="h-[48px] text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm"
                                          style={{
                                            boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                            borderRadius: '8px'
                                          }}
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
                                      <FormLabel className="text-sm font-bold text-primary font-lato">Break Start</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="time"
                                          {...field}
                                          className="h-[48px] text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm"
                                          style={{
                                            boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                            borderRadius: '8px'
                                          }}
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
                                      <FormLabel className="text-sm font-bold text-primary font-lato">Break End</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="time"
                                          {...field}
                                          className="h-[48px] text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm"
                                          style={{
                                            boxShadow: '0px 0px 1px 1px rgba(21, 197, 206, 0.16)',
                                            borderRadius: '8px'
                                          }}
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
                                    <div className="text-xs text-primary p-2 rounded font-lato" style={{ backgroundColor: colors.primary.light }}>
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

                  <Card className="border-primary/20" style={{ backgroundColor: colors.surface.secondary }}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <ClockIcon className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium text-foreground mb-1 font-lato">Schedule Guidelines</h3>
                          <div className="text-sm text-muted-foreground space-y-1 font-lato">
                            <p>• Select at least one working day for your clinic</p>
                            <p>• Break times are optional but help manage staff scheduling</p>
                            <p>• Use 24-hour format (e.g., 09:00, 17:30)</p>
                            {planType === 'company' && <p>• Clinic hours must be within your complex's operating hours</p>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Schedule Summary */}
          <Card className="border-primary/20" style={{ backgroundColor: colors.primary.light }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium text-primary mb-2 font-lato">Schedule Summary</h3>
                  <div className="text-sm text-primary/80 font-lato">
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
              className="flex items-center gap-2 h-[48px] border-border hover:bg-surface-hover font-lato"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 min-w-[120px] h-[48px] bg-primary hover:bg-primary-dark text-white font-lato"
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
    </div>
  );
};