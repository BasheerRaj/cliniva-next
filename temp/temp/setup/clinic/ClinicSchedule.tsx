'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Check, 
  AlertCircle, 
  Calendar,
  Info,
  Users,
  Zap,
  Calculator,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

// Import validation schema
import { workingHoursSchema } from '@/lib/validations/common';

// Import types
import { WorkingDay } from '@/types/onboarding/common';

// Import hooks
import { useOnboardingStore, useOnboardingNavigation } from '@/hooks/onboarding/useOnboardingStore';

// Import components
import { WorkingHoursBuilder } from '@/components/ui/working-hours-builder';

interface ClinicScheduleProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: (data: { workingHours: WorkingDay[] }) => void;
  onComplete?: () => void;
  className?: string;
}

export const ClinicSchedule: React.FC<ClinicScheduleProps> = ({
  onNext,
  onPrevious,
  onSave,
  onComplete,
  className
}) => {
  const { 
    clinicData, 
    updateClinicData, 
    markSubStepCompleted, 
    markStepCompleted,
    planType,
    complexData 
  } = useOnboardingStore();
  const { goToNextSubStep, goToPreviousSubStep, goToNextStep } = useOnboardingNavigation();
  
  // Local state for working hours
  const [workingHours, setWorkingHours] = useState<WorkingDay[]>(
    clinicData.workingHours || []
  );
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [scheduleAnalysis, setScheduleAnalysis] = useState<{
    totalHours: number;
    workingDays: number;
    sessionCapacity: number;
    averageDailySlots: number;
    utilizationRate: number;
    constraintViolations: string[];
  } | null>(null);

  // Form setup for additional validation
  const {
    handleSubmit,
    formState: { errors }
  } = useForm<{ workingHours: WorkingDay[] }>({
    resolver: yupResolver(workingHoursSchema as any),
    defaultValues: {
      workingHours: workingHours
    },
    mode: 'onChange'
  });

  // Get complex working hours constraints
  const getComplexConstraints = (): WorkingDay[] | undefined => {
    if (planType === 'complex' || planType === 'company') {
      return complexData.workingHours;
    }
    return undefined;
  };

  const complexConstraints = getComplexConstraints();

  // Validate working hours and analyze schedule
  useEffect(() => {
    const validateAndAnalyze = () => {
      const newErrors: string[] = [];
      
      try {
        // Basic validation
        const hasAtLeastOneWorkingDay = workingHours.some(day => day.isWorkingDay);
        
        if (!hasAtLeastOneWorkingDay) {
          newErrors.push('At least one working day is required');
          setIsValid(false);
          setValidationErrors(newErrors);
          setScheduleAnalysis(null);
          return;
        }

        // All working days must have valid times
        const allWorkingDaysValid = workingHours.every(day => {
          if (!day.isWorkingDay) return true;
          return day.openingTime && day.closingTime && day.openingTime < day.closingTime;
        });

        if (!allWorkingDaysValid) {
          newErrors.push('All working days must have valid opening and closing times');
        }

        // Check constraints from complex schedule
        const constraintViolations: string[] = [];
        if (complexConstraints) {
          workingHours.forEach(day => {
            if (!day.isWorkingDay) return;
            
            const complexDay = complexConstraints.find(c => c.dayOfWeek === day.dayOfWeek);
            if (complexDay && complexDay.isWorkingDay) {
              if (day.openingTime! < complexDay.openingTime! || day.closingTime! > complexDay.closingTime!) {
                constraintViolations.push(
                  `${day.dayOfWeek}: Clinic hours (${day.openingTime}-${day.closingTime}) must be within complex hours (${complexDay.openingTime}-${complexDay.closingTime})`
                );
              }
            } else if (complexDay && !complexDay.isWorkingDay) {
              constraintViolations.push(
                `${day.dayOfWeek}: Clinic cannot operate when the complex is closed`
              );
            }
          });
        }

        if (constraintViolations.length > 0) {
          newErrors.push(...constraintViolations);
        }

        setValidationErrors(newErrors);
        setIsValid(newErrors.length === 0);

        // Calculate schedule analysis
        if (newErrors.length === 0) {
          const totalHours = workingHours.reduce((total, day) => {
            if (!day.isWorkingDay || !day.openingTime || !day.closingTime) return total;

            const start = new Date(`2000-01-01T${day.openingTime}:00`);
            const end = new Date(`2000-01-01T${day.closingTime}:00`);
            let dayHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

            // Subtract break time if provided
            if (day.breakStartTime && day.breakEndTime) {
              const breakStart = new Date(`2000-01-01T${day.breakStartTime}:00`);
              const breakEnd = new Date(`2000-01-01T${day.breakEndTime}:00`);
              const breakHours = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
              dayHours = Math.max(0, dayHours - breakHours);
            }

            return total + dayHours;
          }, 0);

          const workingDays = workingHours.filter(day => day.isWorkingDay).length;
          const sessionDuration = clinicData.overview?.sessionDuration || 30;
          const sessionCapacity = Math.floor((totalHours * 60) / sessionDuration);
          const averageDailySlots = workingDays > 0 ? sessionCapacity / workingDays : 0;
          const maxPatients = clinicData.overview?.maxPatients || 50;
          const utilizationRate = maxPatients > 0 ? Math.min(100, (sessionCapacity / (maxPatients * 7)) * 100) : 0;

          setScheduleAnalysis({
            totalHours,
            workingDays,
            sessionCapacity,
            averageDailySlots,
            utilizationRate,
            constraintViolations
          });
        } else {
          setScheduleAnalysis(null);
        }

      } catch (error) {
        setIsValid(false);
        setValidationErrors(['Schedule validation failed']);
        setScheduleAnalysis(null);
      }
    };

    validateAndAnalyze();
  }, [workingHours, complexConstraints, clinicData.overview]);

  // Auto-save to store when working hours change
  useEffect(() => {
    updateClinicData({ workingHours });
  }, [workingHours, updateClinicData]);

  // Handle form submission
  const onSubmit = (data: { workingHours: WorkingDay[] }) => {
    if (!isValid) {
      toast.error('Please fix schedule validation errors before continuing');
      return;
    }

    // Save data to store
    updateClinicData({ workingHours: workingHours });
    
    // Mark step as completed
    markSubStepCompleted('clinic', 'schedule');
    markStepCompleted('clinic');

    // Call custom save handler
    if (onSave) {
      onSave({ workingHours });
    }

    // Show success message
    toast.success('Clinic working hours saved successfully!', {
      description: `Schedule configured with ${scheduleAnalysis?.workingDays} working days and ${scheduleAnalysis?.sessionCapacity} weekly appointment slots.`
    });

    // Navigate to next step or complete
    if (onComplete) {
      onComplete();
    } else if (onNext) {
      onNext();
    } else {
      // For clinic plan, this might be the end, for others continue
      if (planType === 'clinic') {
        // Navigate to legal step or complete if legal is not required
        goToNextSubStep();
      } else {
        goToNextStep();
      }
    }
  };

  // Handle going back
  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else {
      goToPreviousSubStep();
    }
  };

  // Handle working hours change
  const handleWorkingHoursChange = (newWorkingHours: WorkingDay[]) => {
    setWorkingHours(newWorkingHours);
  };

  // Get session duration for display
  const sessionDuration = clinicData.overview?.sessionDuration || 30;
  const maxPatients = clinicData.overview?.maxPatients || 50;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-purple-600" />
          Clinic Working Hours
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Define when your clinic is open for patient appointments and consultations. 
          {complexConstraints && ' Hours must be within your complex operating schedule.'}
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Complex Constraints Information */}
          {complexConstraints && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Schedule Constraints:</strong> Your clinic hours must be within the complex operating hours. 
                The complex operates during specific times, and your clinic cannot exceed these boundaries.
              </AlertDescription>
            </Alert>
          )}

          {/* Session Configuration Info */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Current Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-purple-600 font-medium">Session Duration:</span>
                <br />
                <span className="text-purple-800">{sessionDuration} minutes</span>
              </div>
              <div>
                <span className="text-purple-600 font-medium">Max Patients/Day:</span>
                <br />
                <span className="text-purple-800">{maxPatients}</span>
              </div>
              <div>
                <span className="text-purple-600 font-medium">Specialization:</span>
                <br />
                <span className="text-purple-800">{clinicData.overview?.specialization || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Working Hours Builder */}
          <WorkingHoursBuilder
            value={workingHours}
            onChange={handleWorkingHoursChange}
            constraints={complexConstraints}
            label="Clinic Operating Schedule"
            required
          />

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="space-y-2">
              {validationErrors.map((error, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              ))}
            </div>
          )}

          {/* Schedule Analysis */}
          {scheduleAnalysis && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Schedule Analysis</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Hours */}
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {scheduleAnalysis.totalHours.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Hours/Week</div>
                </div>

                {/* Working Days */}
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {scheduleAnalysis.workingDays}
                  </div>
                  <div className="text-sm text-muted-foreground">Working Days</div>
                </div>

                {/* Session Capacity */}
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {scheduleAnalysis.sessionCapacity}
                  </div>
                  <div className="text-sm text-muted-foreground">Weekly Slots</div>
                </div>

                {/* Average Daily Slots */}
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {scheduleAnalysis.averageDailySlots.toFixed(0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Daily Slots</div>
                </div>
              </div>

              {/* Schedule Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Utilization Analysis */}
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Capacity Analysis
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Weekly Appointment Capacity:</span>
                      <span className="font-medium">{scheduleAnalysis.sessionCapacity} slots</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Weekly Patients:</span>
                      <span className="font-medium">{Math.min(maxPatients * scheduleAnalysis.workingDays, scheduleAnalysis.sessionCapacity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Utilization Rate:</span>
                      <Badge variant={scheduleAnalysis.utilizationRate > 80 ? "default" : "secondary"}>
                        {scheduleAnalysis.utilizationRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Schedule Features */}
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Schedule Features
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {scheduleAnalysis.workingDays >= 6 && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        High Availability
                      </Badge>
                    )}
                    
                    {scheduleAnalysis.totalHours >= 50 && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Extended Hours
                      </Badge>
                    )}
                    
                    {scheduleAnalysis.sessionCapacity >= 100 && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        High Capacity
                      </Badge>
                    )}
                    
                    {scheduleAnalysis.utilizationRate > 90 && (
                      <Badge variant="outline" className="text-xs bg-amber-50">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Consider More Hours
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Healthcare Schedule Recommendations */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Schedule Optimization Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Peak Hours:</strong> Most appointments are booked for morning (9-11 AM) and early evening (5-7 PM)</li>
              <li>• <strong>Break Management:</strong> Schedule longer breaks during low-demand periods (2-3 PM)</li>
              <li>• <strong>Specialization-Specific:</strong> {clinicData.overview?.specialization === 'Pediatrics' ? 'Pediatric clinics often have peak hours after school (4-6 PM)' : 'Consider your specialization\'s typical appointment patterns'}</li>
              <li>• <strong>Capacity Planning:</strong> Aim for 80-90% utilization to allow for urgent appointments</li>
              <li>• <strong>Weekend Hours:</strong> Saturday morning hours often improve patient satisfaction</li>
            </ul>
          </div>

          {/* Validation Errors */}
          {errors.workingHours && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600">Please configure valid working hours for the clinic</p>
            </div>
          )}

          {/* Form Status & Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button 
              type="button" 
              variant="outline"
              onClick={handlePrevious}
            >
              Previous
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isValid ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Schedule is Valid
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Fix Schedule Issues
                  </Badge>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={!isValid}
                className="min-w-[140px]"
              >
                {planType === 'clinic' ? 'Complete Clinic Setup' : 'Save & Continue'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
