'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Clock, 
  Plus, 
  Copy, 
  RotateCcw, 
  Calendar,
  Check,
  AlertCircle,
  Coffee
} from 'lucide-react';
import { WorkingDay } from '@/types/onboarding/common';

interface WorkingHoursBuilderProps {
  value?: WorkingDay[];
  onChange?: (workingHours: WorkingDay[]) => void;
  constraints?: WorkingDay[]; // For clinic hours within complex hours
  label?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' }
] as const;

const DEFAULT_WORKING_HOURS: WorkingDay[] = DAYS_OF_WEEK.map(day => ({
  dayOfWeek: day.key as WorkingDay['dayOfWeek'],
  isWorkingDay: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day.key),
  openingTime: '09:00',
  closingTime: '17:00',
  breakStartTime: '12:00',
  breakEndTime: '13:00'
}));

const PRESET_SCHEDULES = {
  standard: {
    name: 'Standard Business Hours',
    hours: DEFAULT_WORKING_HOURS
  },
  healthcare: {
    name: 'Healthcare Hours',
    hours: DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.key as WorkingDay['dayOfWeek'],
      isWorkingDay: day.key !== 'sunday',
      openingTime: '08:00',
      closingTime: day.key === 'saturday' ? '14:00' : '18:00',
      breakStartTime: '12:00',
      breakEndTime: '13:00'
    }))
  },
  '24_7': {
    name: '24/7 Operations',
    hours: DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.key as WorkingDay['dayOfWeek'],
      isWorkingDay: true,
      openingTime: '00:00',
      closingTime: '23:59',
      breakStartTime: '',
      breakEndTime: ''
    }))
  }
};

export const WorkingHoursBuilder: React.FC<WorkingHoursBuilderProps> = ({
  value = DEFAULT_WORKING_HOURS,
  onChange,
  constraints,
  label = 'Working Hours',
  className,
  disabled = false,
  required = false
}) => {
  const [workingHours, setWorkingHours] = useState<WorkingDay[]>(value);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update local state when value prop changes
  useEffect(() => {
    setWorkingHours(value);
  }, [value]);

  // Validation function
  const validateHours = (hours: WorkingDay[]): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    hours.forEach(day => {
      if (!day.isWorkingDay) return;

      const dayKey = day.dayOfWeek;

      // Validate opening and closing times
      if (!day.openingTime || !day.closingTime) {
        newErrors[dayKey] = 'Opening and closing times are required for working days';
        return;
      }

      // Check if opening time is before closing time
      if (day.openingTime >= day.closingTime) {
        newErrors[dayKey] = 'Opening time must be before closing time';
        return;
      }

      // Validate break times if provided
      if (day.breakStartTime && day.breakEndTime) {
        if (day.breakStartTime >= day.breakEndTime) {
          newErrors[dayKey] = 'Break start time must be before break end time';
          return;
        }

        if (day.breakStartTime < day.openingTime || day.breakEndTime > day.closingTime) {
          newErrors[dayKey] = 'Break times must be within working hours';
          return;
        }
      }

      // Check constraints (for clinic within complex)
      if (constraints) {
        const constraintDay = constraints.find(c => c.dayOfWeek === day.dayOfWeek);
        if (constraintDay && constraintDay.isWorkingDay) {
          if (day.openingTime < constraintDay.openingTime! || day.closingTime > constraintDay.closingTime!) {
            newErrors[dayKey] = `Hours must be within ${constraintDay.openingTime} - ${constraintDay.closingTime}`;
            return;
          }
        } else if (constraintDay && !constraintDay.isWorkingDay && day.isWorkingDay) {
          newErrors[dayKey] = 'Cannot be a working day when parent is closed';
          return;
        }
      }
    });

    // Check if at least one working day is selected
    if (required && !hours.some(day => day.isWorkingDay)) {
      newErrors.general = 'At least one working day is required';
    }

    return newErrors;
  };

  // Handle changes
  const handleChange = (updatedHours: WorkingDay[]) => {
    setWorkingHours(updatedHours);
    const validationErrors = validateHours(updatedHours);
    setErrors(validationErrors);
    
    if (onChange) {
      onChange(updatedHours);
    }
  };

  // Update a specific day
  const updateDay = (dayOfWeek: WorkingDay['dayOfWeek'], updates: Partial<WorkingDay>) => {
    const updatedHours = workingHours.map(day =>
      day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
    );
    handleChange(updatedHours);
  };

  // Toggle working day
  const toggleWorkingDay = (dayOfWeek: WorkingDay['dayOfWeek']) => {
    const day = workingHours.find(d => d.dayOfWeek === dayOfWeek);
    if (day) {
      updateDay(dayOfWeek, {
        isWorkingDay: !day.isWorkingDay,
        openingTime: !day.isWorkingDay ? '09:00' : '',
        closingTime: !day.isWorkingDay ? '17:00' : '',
        breakStartTime: !day.isWorkingDay ? '12:00' : '',
        breakEndTime: !day.isWorkingDay ? '13:00' : ''
      });
    }
  };

  // Copy hours from one day to all working days
  const copyToAllWorkingDays = (sourceDayOfWeek: WorkingDay['dayOfWeek']) => {
    const sourceDay = workingHours.find(d => d.dayOfWeek === sourceDayOfWeek);
    if (!sourceDay || !sourceDay.isWorkingDay) return;

    const updatedHours = workingHours.map(day =>
      day.isWorkingDay ? {
        ...day,
        openingTime: sourceDay.openingTime,
        closingTime: sourceDay.closingTime,
        breakStartTime: sourceDay.breakStartTime,
        breakEndTime: sourceDay.breakEndTime
      } : day
    );
    handleChange(updatedHours);
  };

  // Apply preset schedule
  const applyPreset = (presetKey: keyof typeof PRESET_SCHEDULES) => {
    const preset = PRESET_SCHEDULES[presetKey];
    handleChange(preset.hours);
  };

  // Calculate total working hours per week
  const getTotalHoursPerWeek = () => {
    return workingHours.reduce((total, day) => {
      if (!day.isWorkingDay || !day.openingTime || !day.closingTime) return total;

      const start = new Date(`2000-01-01T${day.openingTime}:00`);
      const end = new Date(`2000-01-01T${day.closingTime}:00`);
      const dayHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      // Subtract break time if provided
      if (day.breakStartTime && day.breakEndTime) {
        const breakStart = new Date(`2000-01-01T${day.breakStartTime}:00`);
        const breakEnd = new Date(`2000-01-01T${day.breakEndTime}:00`);
        const breakHours = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
        return total + Math.max(0, dayHours - breakHours);
      }

      return total + dayHours;
    }, 0);
  };

  const totalHours = getTotalHoursPerWeek();
  const workingDaysCount = workingHours.filter(day => day.isWorkingDay).length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </CardTitle>
        
        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESET_SCHEDULES).map(([key, preset]) => (
            <Button
              key={key}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(key as keyof typeof PRESET_SCHEDULES)}
              disabled={disabled}
            >
              {preset.name}
            </Button>
          ))}
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{workingDaysCount} working days</span>
          <span>•</span>
          <span>{totalHours.toFixed(1)} hours/week</span>
          {constraints && (
            <>
              <span>•</span>
              <Badge variant="outline" className="text-xs">
                Constrained Schedule
              </Badge>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          
          {/* General Error */}
          {errors.general && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Days Configuration */}
          <div className="space-y-3">
            {DAYS_OF_WEEK.map(({ key, label: dayLabel }) => {
              const day = workingHours.find(d => d.dayOfWeek === key);
              if (!day) return null;

              const constraintDay = constraints?.find(c => c.dayOfWeek === key);
              const hasError = errors[key];

              return (
                <div key={key} className={`p-4 border rounded-lg ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                  
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={day.isWorkingDay}
                        onCheckedChange={() => toggleWorkingDay(key as WorkingDay['dayOfWeek'])}
                        disabled={disabled}
                      />
                      <Label className="font-medium">{dayLabel}</Label>
                      {day.isWorkingDay && (
                        <Badge variant="secondary" className="text-xs">
                          Open
                        </Badge>
                      )}
                    </div>

                    {day.isWorkingDay && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToAllWorkingDays(key as WorkingDay['dayOfWeek'])}
                        disabled={disabled}
                        title="Copy to all working days"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Time Configuration */}
                  {day.isWorkingDay && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      
                      {/* Opening Time */}
                      <div className="space-y-1">
                        <Label className="text-xs">Opening Time</Label>
                        <Input
                          type="time"
                          value={day.openingTime || ''}
                          onChange={(e) => updateDay(key as WorkingDay['dayOfWeek'], { openingTime: e.target.value })}
                          disabled={disabled}
                          className="text-sm"
                        />
                      </div>

                      {/* Closing Time */}
                      <div className="space-y-1">
                        <Label className="text-xs">Closing Time</Label>
                        <Input
                          type="time"
                          value={day.closingTime || ''}
                          onChange={(e) => updateDay(key as WorkingDay['dayOfWeek'], { closingTime: e.target.value })}
                          disabled={disabled}
                          className="text-sm"
                        />
                      </div>

                      {/* Break Start */}
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <Coffee className="h-3 w-3" />
                          Break Start
                        </Label>
                        <Input
                          type="time"
                          value={day.breakStartTime || ''}
                          onChange={(e) => updateDay(key as WorkingDay['dayOfWeek'], { breakStartTime: e.target.value })}
                          disabled={disabled}
                          className="text-sm"
                          placeholder="Optional"
                        />
                      </div>

                      {/* Break End */}
                      <div className="space-y-1">
                        <Label className="text-xs">Break End</Label>
                        <Input
                          type="time"
                          value={day.breakEndTime || ''}
                          onChange={(e) => updateDay(key as WorkingDay['dayOfWeek'], { breakEndTime: e.target.value })}
                          disabled={disabled}
                          className="text-sm"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  )}

                  {/* Constraint Information */}
                  {constraintDay && constraintDay.isWorkingDay && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                      <span className="font-medium">Parent Schedule:</span> {constraintDay.openingTime} - {constraintDay.closingTime}
                    </div>
                  )}

                  {/* Day Error */}
                  {hasError && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      {hasError}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleChange(DEFAULT_WORKING_HOURS)}
              disabled={disabled}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {Object.keys(errors).length === 0 ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Schedule is valid</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">{Object.keys(errors).length} error(s)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
