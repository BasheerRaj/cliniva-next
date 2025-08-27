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
  Zap,
  Users
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

interface ComplexScheduleProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: (data: { workingHours: WorkingDay[] }) => void;
  onComplete?: () => void;
  className?: string;
}

export const ComplexSchedule: React.FC<ComplexScheduleProps> = ({
  onNext,
  onPrevious,
  onSave,
  onComplete,
  className
}) => {
  const { 
    complexData, 
    updateComplexData, 
    markSubStepCompleted, 
    markStepCompleted,
    planType 
  } = useOnboardingStore();
  const { goToNextSubStep, goToPreviousSubStep, goToNextStep } = useOnboardingNavigation();
  
  // Local state for working hours
  const [workingHours, setWorkingHours] = useState<WorkingDay[]>(
    complexData.workingHours || []
  );
  const [isValid, setIsValid] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    totalHours: number;
    workingDays: number;
    hasWeekendHours: boolean;
    hasEmergencyHours: boolean;
    hasBreaks: boolean;
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

  // Validate working hours and analyze schedule
  useEffect(() => {
    const validateAndAnalyze = () => {
      try {
        // Basic validation
        const hasAtLeastOneWorkingDay = workingHours.some(day => day.isWorkingDay);
        
        if (!hasAtLeastOneWorkingDay) {
          setIsValid(false);
          setAnalysisResult(null);
          return;
        }

        // All working days must have valid times
        const allWorkingDaysValid = workingHours.every(day => {
          if (!day.isWorkingDay) return true;
          return day.openingTime && day.closingTime && day.openingTime < day.closingTime;
        });

        if (!allWorkingDaysValid) {
          setIsValid(false);
          setAnalysisResult(null);
          return;
        }

        setIsValid(true);

        // Analyze schedule
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
        const hasWeekendHours = workingHours.some(day => 
          (day.dayOfWeek === 'saturday' || day.dayOfWeek === 'sunday') && day.isWorkingDay
        );
        const hasEmergencyHours = workingHours.some(day => 
          day.isWorkingDay && (
            day.openingTime! <= '06:00' || 
            day.closingTime! >= '22:00'
          )
        );
        const hasBreaks = workingHours.some(day => 
          day.isWorkingDay && day.breakStartTime && day.breakEndTime
        );

        setAnalysisResult({
          totalHours,
          workingDays,
          hasWeekendHours,
          hasEmergencyHours,
          hasBreaks
        });

      } catch (error) {
        setIsValid(false);
        setAnalysisResult(null);
      }
    };

    validateAndAnalyze();
  }, [workingHours]);

  // Auto-save to store when working hours change
  useEffect(() => {
    updateComplexData({ workingHours });
  }, [workingHours, updateComplexData]);

  // Handle form submission
  const onSubmit = (data: { workingHours: WorkingDay[] }) => {
    console.log('🚀 ComplexSchedule onSubmit called!', { data, isValid, planType });
    
    if (!isValid) {
      console.log('❌ Form is not valid, showing error');
      toast.error('Please configure valid working hours');
      return;
    }

    console.log('✅ Form is valid, proceeding with submission');

    // Save data to store
    updateComplexData({ workingHours: workingHours });
    console.log('📝 Data saved to store');
    
    // Mark step as completed
    markSubStepCompleted('complex', 'schedule');
    console.log('✅ Marked schedule substep as completed');

    // For company plan, we're done with complex, for complex plan we might be done entirely
    if (planType === 'company') {
      markStepCompleted('complex');
      console.log('✅ Marked complex step as completed (company plan)');
    } else {
      // For standalone complex plan, this might be the last step or continue to legal
      markStepCompleted('complex');
      console.log('✅ Marked complex step as completed (complex plan)');
    }

    // Call custom save handler
    if (onSave) {
      console.log('💾 Calling onSave handler');
      onSave({ workingHours });
    } else {
      console.log('⚠️ No onSave handler provided');
    }

    // Show success message
    toast.success('Complex working hours saved successfully!', {
      description: `Schedule configured with ${analysisResult?.workingDays} working days and ${analysisResult?.totalHours.toFixed(1)} hours per week.`
    });
    console.log('🎉 Success message shown');

    // Navigate to next step or complete
    console.log('🚀 Navigation logic:', { 
      hasOnComplete: !!onComplete, 
      hasOnNext: !!onNext,
      fallbackAction: 'goToNextStep()'
    });

    if (onComplete) {
      console.log('🎯 Calling onComplete()');
      onComplete();
    } else if (onNext) {
      console.log('▶️ Calling onNext()');
      onNext();
    } else {
      console.log('🔄 Calling goToNextStep() - moving to clinic setup for company plan');
      try {
        goToNextStep(); // This will move to clinic setup for company plan
      } catch (error) {
        console.error('❌ Error in goToNextStep:', error);
        toast.error('Navigation failed. Please try again or contact support.');
      }
    }
    
    console.log('✅ ComplexSchedule onSubmit completed!');
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-green-600" />
          Complex Working Hours
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Define the operational schedule for your medical complex. These hours will serve as the baseline for individual clinic schedules within the complex.
        </p>
      </CardHeader>

      <CardContent>
        {/* 🐛 DEBUG PANEL - Navigation Status */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <h4 className="font-medium text-yellow-800">🐛 DEBUG: Navigation Status</h4>
          </div>
          
          <div className="text-xs space-y-1">
            <p className="text-yellow-700">• planType: {planType}</p>
            <p className="text-yellow-700">• onComplete prop: {onComplete ? '✅ Provided' : '❌ Not provided'}</p>
            <p className="text-yellow-700">• onNext prop: {onNext ? '✅ Provided' : '❌ Not provided'}</p>
            <p className="text-yellow-700">• isValid: {isValid ? '✅ True' : '❌ False'}</p>
            <p className="text-yellow-700">• Button text: {planType === 'company' ? 'Complete Complex Setup' : 'Save & Continue'}</p>
            <p className="text-yellow-700">• Expected behavior: {planType === 'company' ? 'Complete complex setup and go to clinic setup' : 'Continue to next step'}</p>
            
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <p className="font-bold text-red-700">🔧 Manual Test Button:</p>
              <button
                type="button"
                onClick={() => {
                  console.log('🔧 Manual submit test - calling onSubmit directly');
                  if (isValid) {
                    console.log('🔧 Form is valid, proceeding with submission...');
                    onSubmit({ workingHours });
                  } else {
                    console.log('🔧 Form is NOT valid, cannot submit');
                  }
                }}
                className="mt-1 px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
              >
                🔧 Manual Submit Test
              </button>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Complex working hours define when the facility is operational. 
              Individual clinics within this complex cannot operate outside these hours. 
              Consider emergency services, extended hours, and weekend operations based on your services.
            </AlertDescription>
          </Alert>

          {/* Working Hours Builder */}
          <WorkingHoursBuilder
            value={workingHours}
            onChange={handleWorkingHoursChange}
            label="Complex Operating Schedule"
            required
          />

          {/* Schedule Analysis */}
          {analysisResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Hours */}
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analysisResult.totalHours.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Hours/Week</div>
              </div>

              {/* Working Days */}
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analysisResult.workingDays}
                </div>
                <div className="text-sm text-muted-foreground">Working Days</div>
              </div>

              {/* Weekend Hours Badge */}
              <div className="p-4 border rounded-lg text-center">
                {analysisResult.hasWeekendHours ? (
                  <Badge variant="default" className="bg-orange-100 text-orange-800">
                    <Calendar className="h-3 w-3 mr-1" />
                    Weekend Hours
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Weekdays Only
                  </Badge>
                )}
              </div>

              {/* Emergency Hours Badge */}
              <div className="p-4 border rounded-lg text-center">
                {analysisResult.hasEmergencyHours ? (
                  <Badge variant="default" className="bg-red-100 text-red-800">
                    <Zap className="h-3 w-3 mr-1" />
                    Extended Hours
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Standard Hours
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Schedule Features */}
          {analysisResult && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Schedule Features</h4>
              <div className="flex flex-wrap gap-2">
                
                {analysisResult.hasBreaks && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Break Times Configured
                  </Badge>
                )}

                {analysisResult.hasWeekendHours && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Weekend Operations
                  </Badge>
                )}

                {analysisResult.hasEmergencyHours && (
                  <Badge variant="outline" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Extended Hours Available
                  </Badge>
                )}

                {analysisResult.workingDays >= 6 && (
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    High Availability
                  </Badge>
                )}

                {analysisResult.totalHours >= 60 && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Intensive Schedule
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Healthcare Schedule Recommendations */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Healthcare Schedule Recommendations</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Emergency Services:</strong> Consider 24/7 operations for emergency departments</li>
              <li>• <strong>Outpatient Care:</strong> Typical hours are 8 AM - 6 PM, Monday through Friday</li>
              <li>• <strong>Weekend Services:</strong> Many complexes operate Saturday mornings for urgent care</li>
              <li>• <strong>Break Times:</strong> Standard lunch break is 12 PM - 1 PM for administrative staff</li>
              <li>• <strong>Extended Hours:</strong> Evening hours (until 8-9 PM) can improve patient access</li>
            </ul>
          </div>

          {/* Validation Errors */}
          {errors.workingHours && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600">Please configure valid working hours for the complex</p>
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
                    Configure Working Hours
                  </Badge>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={!isValid}
                className="min-w-[140px]"
              >
                {planType === 'company' ? 'Complete Complex Setup' : 'Save & Continue'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
