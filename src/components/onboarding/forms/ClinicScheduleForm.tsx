'use client';

import React, { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, ClockIcon, CalendarIcon, CheckCircle, BuildingIcon, AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import { toast } from 'sonner';
import { ClinicWorkingHoursDto } from '@/types/onboarding';
import { saveClinicSchedule, getComplexWorkingHours } from '@/api/onboardingApiClient';
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
  complexId?: string;
}

export const ClinicScheduleForm: React.FC<ClinicScheduleFormProps> = ({
  onNext,
  onPrevious,
  initialData = [],
  complexSchedule,
  planType = 'clinic',
  isLoading = false,
  formData,
  currentStep,
  complexId
}) => {
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [complexWorkingHours, setComplexWorkingHours] = useState<ClinicWorkingHoursDto[]>([]);
  const [isLoadingComplexHours, setIsLoadingComplexHours] = useState(false);
  const [complexValidationErrors, setComplexValidationErrors] = useState<Record<string, string[]>>({});
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
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

  // Create default working hours based on complex data or fallback defaults
  const createDefaultWorkingHours = (): ClinicWorkingHoursDto[] => {
    if (initialData.length > 0) return initialData;
    
    return daysOfWeek.map(day => {
      const complexDay = complexWorkingHours.find(ch => ch.dayOfWeek === day.key);
      
      if (complexDay && complexDay.isWorkingDay) {
        // Inherit from complex hours - use exact complex times
        return {
          dayOfWeek: day.key as ClinicWorkingHoursDto['dayOfWeek'],
          isWorkingDay: true,
          openingTime: complexDay.openingTime || '09:00',
          closingTime: complexDay.closingTime || '17:00',
          breakStartTime: complexDay.breakStartTime || '',
          breakEndTime: complexDay.breakEndTime || ''
        };
      } else {
        // Complex is closed or no complex data - clinic should be closed too
        return {
          dayOfWeek: day.key as ClinicWorkingHoursDto['dayOfWeek'],
          isWorkingDay: false,
          openingTime: '09:00',
          closingTime: '17:00',
          breakStartTime: '',
          breakEndTime: ''
        };
      }
    });
  };

  const form = useForm<ClinicScheduleFormData>({
    resolver: zodResolver(clinicScheduleSchema),
    defaultValues: {
      workingHours: createDefaultWorkingHours()
    }
  });

  // Fetch complex working hours for validation
  useEffect(() => {
    const fetchComplexHours = async () => {
      if (!complexId || planType === 'clinic') return;
      
      setIsLoadingComplexHours(true);
      try {
        console.log('📅 Fetching complex working hours for complexId:', complexId);
        const response = await getComplexWorkingHours(complexId);
        console.log('📅 Complex working hours response:', response);
        
        if (response.success && response.data) {
          setComplexWorkingHours(response.data);
          console.log('✅ Complex working hours loaded:', response.data);
        }
      } catch (error) {
        console.error('❌ Failed to fetch complex working hours:', error);
        toast.error('Failed to load complex working hours for validation');
      } finally {
        setIsLoadingComplexHours(false);
      }
    };

    fetchComplexHours();
  }, [complexId, planType]);

  // Update form defaults when complex hours are loaded (only if no initial data)
  useEffect(() => {
    if (complexWorkingHours.length > 0 && initialData.length === 0 && !isLoadingComplexHours) {
      const newDefaults = createDefaultWorkingHours();
      console.log('🔄 Updating form defaults based on complex hours:', newDefaults);
      
      // Reset form with new defaults
      form.reset({
        workingHours: newDefaults
      });
      
      // Clear any existing validation errors
      setComplexValidationErrors({});
    }
  }, [complexWorkingHours, initialData, isLoadingComplexHours, form]);

  // Auto-fill clinic hours based on complex hours when complex data is loaded
  useEffect(() => {
    if (complexWorkingHours.length > 0 && !isLoadingComplexHours) {
      console.log('🔄 Auto-filling clinic hours based on complex hours');
      
      const currentWorkingHours = form.getValues('workingHours');
      let hasChanges = false;
      
      currentWorkingHours.forEach((clinicDay, index) => {
        const complexDay = complexWorkingHours.find(ch => ch.dayOfWeek === clinicDay.dayOfWeek);
        
        if (complexDay) {
          // Update working day status based on complex
          if (clinicDay.isWorkingDay !== complexDay.isWorkingDay) {
            form.setValue(`workingHours.${index}.isWorkingDay`, complexDay.isWorkingDay, { shouldValidate: false });
            hasChanges = true;
          }
          
          // If complex is working, update times
          if (complexDay.isWorkingDay) {
            // Update opening time
            if (clinicDay.openingTime !== complexDay.openingTime) {
              form.setValue(`workingHours.${index}.openingTime`, complexDay.openingTime || '09:00', { shouldValidate: false });
              hasChanges = true;
            }
            
            // Update closing time
            if (clinicDay.closingTime !== complexDay.closingTime) {
              form.setValue(`workingHours.${index}.closingTime`, complexDay.closingTime || '17:00', { shouldValidate: false });
              hasChanges = true;
            }
            
            // Update break times
            if (clinicDay.breakStartTime !== complexDay.breakStartTime) {
              form.setValue(`workingHours.${index}.breakStartTime`, complexDay.breakStartTime || '', { shouldValidate: false });
              hasChanges = true;
            }
            
            if (clinicDay.breakEndTime !== complexDay.breakEndTime) {
              form.setValue(`workingHours.${index}.breakEndTime`, complexDay.breakEndTime || '', { shouldValidate: false });
              hasChanges = true;
            }
          } else {
            // Complex is closed, ensure clinic is also closed
            if (clinicDay.isWorkingDay) {
              form.setValue(`workingHours.${index}.isWorkingDay`, false, { shouldValidate: false });
              hasChanges = true;
            }
          }
        }
      });
      
      if (hasChanges) {
        console.log('✅ Auto-filled clinic hours based on complex schedule');
        setHasAutoFilled(true);
        toast.success('Clinic schedule updated to match complex working hours');
      }
    }
  }, [complexWorkingHours, isLoadingComplexHours, form]);

  // Initial validation when complex hours are loaded and form has existing data
  useEffect(() => {
    if (complexWorkingHours.length > 0 && !isLoadingComplexHours) {
      const currentWorkingHours = form.getValues('workingHours');
      const newErrors = validateAllClinicDays(currentWorkingHours);
      
      setComplexValidationErrors(newErrors);
      
      if (Object.keys(newErrors).length > 0) {
        console.log('⚠️ Initial validation found conflicts:', newErrors);
      }
    }
  }, [complexWorkingHours, isLoadingComplexHours, form]);

  // Get complex working hours for a specific day
  const getComplexHoursForDay = (dayOfWeek: string) => {
    return complexWorkingHours.find(ch => ch.dayOfWeek === dayOfWeek);
  };

  // Enhanced validation against complex hours
  const validateClinicHours = (dayOfWeek: string, clinicHours: any) => {
    const errors: string[] = [];
    const complexHours = getComplexHoursForDay(dayOfWeek);
    
    // If no complex hours found for this day, it means complex is closed
    if (!complexHours && clinicHours.isWorkingDay) {
      errors.push('Clinic cannot be open when complex is closed');
      return errors;
    }
    
    // If complex hours exist but marked as not working day
    if (complexHours && !complexHours.isWorkingDay && clinicHours.isWorkingDay) {
      errors.push('Clinic cannot be open when complex is closed');
      return errors;
    }
    
    // If clinic is not working or complex is not working, no validation needed
    if (!clinicHours.isWorkingDay || !complexHours || !complexHours.isWorkingDay) {
      return errors;
    }
    
    const complexStart = complexHours.openingTime;
    const complexEnd = complexHours.closingTime;
    const complexBreakStart = complexHours.breakStartTime;
    const complexBreakEnd = complexHours.breakEndTime;
    
    const clinicStart = clinicHours.openingTime;
    const clinicEnd = clinicHours.closingTime;
    
    // Validate opening time
    if (clinicStart && complexStart && clinicStart < complexStart) {
      errors.push(`Opening time cannot be before complex opening time (${complexStart})`);
    }
    
    // Validate closing time
    if (clinicEnd && complexEnd && clinicEnd > complexEnd) {
      errors.push(`Closing time cannot be after complex closing time (${complexEnd})`);
    }
    
    // Enhanced break time validation
    if (complexBreakStart && complexBreakEnd && clinicStart && clinicEnd) {
      // Check if clinic operates during break time
      const clinicStartMinutes = timeToMinutes(clinicStart);
      const clinicEndMinutes = timeToMinutes(clinicEnd);
      const breakStartMinutes = timeToMinutes(complexBreakStart);
      const breakEndMinutes = timeToMinutes(complexBreakEnd);
      
      // Clinic operates during complex break time
      if (clinicStartMinutes < breakEndMinutes && clinicEndMinutes > breakStartMinutes) {
        // Clinic must have its own break time that aligns with complex break
        if (!clinicHours.breakStartTime || !clinicHours.breakEndTime) {
          errors.push(`Clinic must have break time when operating during complex break (${complexBreakStart} - ${complexBreakEnd})`);
        } else {
          // Check if clinic break time aligns with complex break time
          const clinicBreakStartMinutes = timeToMinutes(clinicHours.breakStartTime);
          const clinicBreakEndMinutes = timeToMinutes(clinicHours.breakEndTime);
          
          // Clinic break should be during or align with complex break
          if (clinicBreakStartMinutes > breakEndMinutes || clinicBreakEndMinutes < breakStartMinutes) {
            errors.push(`Clinic break time should align with complex break time (${complexBreakStart} - ${complexBreakEnd})`);
          }
        }
      }
    }
    
    // Validate basic time logic
    if (clinicStart && clinicEnd && clinicStart >= clinicEnd) {
      errors.push('Opening time must be before closing time');
    }
    
    return errors;
  };

  // Helper function to convert time string to minutes for easier comparison
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to validate all clinic days at once
  const validateAllClinicDays = (clinicHours: ClinicWorkingHoursDto[]): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};
    
    clinicHours.forEach((clinicDay) => {
      if (clinicDay && clinicDay.dayOfWeek) {
        const dayErrors = validateClinicHours(clinicDay.dayOfWeek, clinicDay);
        if (dayErrors.length > 0) {
          errors[clinicDay.dayOfWeek] = dayErrors;
        }
      }
    });
    
    return errors;
  };

  // Use complex hours for a specific day
  const useComplexHoursForDay = (dayOfWeek: string) => {
    const complexHours = getComplexHoursForDay(dayOfWeek);
    if (!complexHours || !complexHours.isWorkingDay) return;
    
    const dayIndex = form.getValues('workingHours').findIndex(wh => wh.dayOfWeek === dayOfWeek);
    if (dayIndex === -1) return;
    
    // Clear validation errors for this day first
    setComplexValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[dayOfWeek];
      return newErrors;
    });
    
    // Apply complex hours values
    form.setValue(`workingHours.${dayIndex}.isWorkingDay`, true, { shouldValidate: false });
    form.setValue(`workingHours.${dayIndex}.openingTime`, complexHours.openingTime || '09:00', { shouldValidate: false });
    form.setValue(`workingHours.${dayIndex}.closingTime`, complexHours.closingTime || '17:00', { shouldValidate: false });
    form.setValue(`workingHours.${dayIndex}.breakStartTime`, complexHours.breakStartTime || '', { shouldValidate: false });
    form.setValue(`workingHours.${dayIndex}.breakEndTime`, complexHours.breakEndTime || '', { shouldValidate: false });
    
    // Trigger a gentle validation to ensure no conflicts
    setTimeout(() => {
      const clinicDay = form.getValues(`workingHours.${dayIndex}`);
      const dayErrors = validateClinicHours(dayOfWeek, clinicDay);
      
      if (dayErrors.length === 0) {
        toast.success(`Applied complex hours to ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}`);
      } else {
        // This should not happen when using complex hours, but just in case
        setComplexValidationErrors(prev => ({
          ...prev,
          [dayOfWeek]: dayErrors
        }));
        toast.warning(`Applied complex hours to ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}, but validation issues remain`);
      }
    }, 100);
  };

  // Real-time validation when form values change - only validate changed days
  useEffect(() => {
    if (complexWorkingHours.length === 0 || planType === 'clinic') return;
    
    const subscription = form.watch((values, { name }) => {
      // Only validate if a working hours field changed
      if (!name || !name.startsWith('workingHours.')) return;
      
      // Extract the day index from the field name (e.g., "workingHours.0.isWorkingDay" -> 0)
      const dayIndexMatch = name.match(/workingHours\.(\d+)\./);
      if (!dayIndexMatch) return;
      
      const dayIndex = parseInt(dayIndexMatch[1]);
      const clinicDay = values.workingHours?.[dayIndex];
      
      if (!clinicDay || !clinicDay.dayOfWeek) return;
      
      // Only validate the specific day that changed
      const dayErrors = validateClinicHours(clinicDay.dayOfWeek, clinicDay);
      
      setComplexValidationErrors(prev => {
        const newErrors = { ...prev };
        
        if (dayErrors.length > 0) {
          newErrors[clinicDay.dayOfWeek!] = dayErrors;
        } else {
          // Clear errors for this day if no violations
          delete newErrors[clinicDay.dayOfWeek!];
        }
        
        return newErrors;
      });
    });
    
    return () => subscription.unsubscribe();
  }, [complexWorkingHours, planType, form]);

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
      // Enhanced validation against complex hours
      if (complexWorkingHours.length > 0 && planType !== 'clinic') {
        const dayErrors = validateAllClinicDays(data.workingHours);
        
        if (Object.keys(dayErrors).length > 0) {
          // Update the complex validation errors to show current issues
          setComplexValidationErrors(dayErrors);
          
          const errorMessages = Object.entries(dayErrors).flatMap(([day, errors]) =>
            errors.map(error => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${error}`)
          );
          
          setValidationErrors(errorMessages);
          toast.error(`Please fix validation errors:\n${errorMessages.slice(0, 3).join('\n')}${errorMessages.length > 3 ? '\n...and more' : ''}`);
          return;
        }
      }

      // Legacy validation for backward compatibility
      const legacyErrors = validateAgainstComplexHours(data.workingHours);
      if (legacyErrors.length > 0) {
        setValidationErrors(legacyErrors);
        toast.error('Schedule conflicts with complex hours. Please review the errors below.');
        return;
      }
      
      setValidationErrors([]);

      // Basic validation - at least one working day
      const workingDays = data.workingHours.filter(day => day.isWorkingDay);
      if (workingDays.length === 0) {
        toast.error('Please select at least one working day');
        return;
      }

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
                    {hasAutoFilled && (
                      <span className="block mt-1 text-xs text-primary/70">
                        ✅ Clinic schedule has been automatically filled based on complex working hours
                      </span>
                    )}
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
                    {daysOfWeek.map((day, index) => {
                      const complexHours = getComplexHoursForDay(day.key);
                      const hasValidationErrors = complexValidationErrors[day.key]?.length > 0;
                      const isComplexClosed = !complexHours || (complexHours && !complexHours.isWorkingDay);
                      
                      return (
                        <Card key={day.key} className={`border-border bg-surface-tertiary ${hasValidationErrors ? 'border-destructive' : ''}`}>
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              
                                                             {/* Day and Working Day Toggle */}
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                   <h3 className="font-medium text-foreground font-lato">{day.label}</h3>
                                   {isComplexClosed && planType !== 'clinic' && (
                                     <span className="text-xs text-destructive font-lato px-2 py-1 rounded bg-destructive/10">
                                       Complex Closed
                                     </span>
                                   )}
                                   {hasValidationErrors && (
                                     <AlertTriangleIcon className="h-4 w-4 text-destructive" />
                                   )}
                                   {complexHours && complexHours.isWorkingDay && form.watch(`workingHours.${index}.isWorkingDay`) && 
                                    form.watch(`workingHours.${index}.openingTime`) === complexHours.openingTime &&
                                    form.watch(`workingHours.${index}.closingTime`) === complexHours.closingTime &&
                                    form.watch(`workingHours.${index}.breakStartTime`) === complexHours.breakStartTime &&
                                    form.watch(`workingHours.${index}.breakEndTime`) === complexHours.breakEndTime && (
                                     <span className="text-xs text-green-600 font-lato px-2 py-1 rounded bg-green-100">
                                       ✓ Matches Complex
                                     </span>
                                   )}
                                 </div>
                                <FormField
                                  control={form.control}
                                  name={`workingHours.${index}.isWorkingDay`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={(checked) => {
                                            // Prevent enabling if complex is closed
                                            if (checked && isComplexClosed && planType !== 'clinic') {
                                              toast.error(`Cannot open clinic on ${day.label} - complex is closed`);
                                              return;
                                            }
                                            field.onChange(checked);
                                          }}
                                          disabled={isLoading || (isComplexClosed && planType !== 'clinic')}
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

                                                             {/* Complex Hours Info and Use Complex Hours Button */}
                               {complexHours && complexHours.isWorkingDay && planType !== 'clinic' && form.watch(`workingHours.${index}.isWorkingDay`) && (
                                 <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                                   <div>
                                     <p className="text-sm font-medium text-foreground font-lato">
                                       Complex Hours: {complexHours.openingTime || 'N/A'} - {complexHours.closingTime || 'N/A'}
                                     </p>
                                     {complexHours.breakStartTime && complexHours.breakEndTime && (
                                       <p className="text-xs text-muted-foreground font-lato">
                                         Break: {complexHours.breakStartTime} - {complexHours.breakEndTime}
                                       </p>
                                     )}
                                   </div>
                                   <Button
                                     type="button"
                                     variant="outline"
                                     size="sm"
                                     onClick={() => useComplexHoursForDay(day.key)}
                                     disabled={isLoading}
                                     className="font-lato border-border hover:bg-muted"
                                   >
                                     <RefreshCwIcon className="h-4 w-4 mr-2" />
                                     Apply Complex Hours
                                   </Button>
                                 </div>
                               )}

                              {/* Validation Errors for this day */}
                              {hasValidationErrors && (
                                <div className="p-3 rounded-lg border border-destructive bg-destructive/5">
                                  <div className="flex items-start gap-2">
                                    <AlertTriangleIcon className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                    <div>
                                      {complexValidationErrors[day.key]?.map((error, errorIndex) => (
                                        <p key={errorIndex} className="text-sm text-destructive font-lato">
                                          {error}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
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

                          </CardContent>
                        </Card>
                      );
                    })}
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
                disabled={
                  isLoading || 
                  Object.keys(complexValidationErrors).length > 0 ||
                  validationErrors.length > 0
                }
                className="flex items-center gap-2 min-w-[120px] h-[48px] bg-primary hover:bg-primary-dark text-white font-lato disabled:opacity-50 disabled:cursor-not-allowed"
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