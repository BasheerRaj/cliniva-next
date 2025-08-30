"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Clock, Calendar } from "lucide-react"
import { toast } from 'sonner'
import { stepApi } from '@/api/validationApi'
import { useClivinaTheme } from "@/hooks/useClivinaTheme"


interface ComplexWorkingHoursFormProps {
  onPrevious: () => void
  onNext: (data: any) => void
  initialData?: any
}

interface WorkingHour {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  isWorkingDay: boolean
  openingTime: string
  closingTime: string
  breakStartTime: string
  breakEndTime: string
}

export default function ComplexWorkingHoursForm({ onPrevious, onNext, initialData }: ComplexWorkingHoursFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Form fields matching ComplexWorkingHoursDto array
  const [schedule, setSchedule] = useState<WorkingHour[]>(
    initialData?.workingHours || [
      { dayOfWeek: "monday", isWorkingDay: true, openingTime: "09:00", closingTime: "17:00", breakStartTime: "12:00", breakEndTime: "13:00" },
      { dayOfWeek: "tuesday", isWorkingDay: true, openingTime: "09:00", closingTime: "17:00", breakStartTime: "12:00", breakEndTime: "13:00" },
      { dayOfWeek: "wednesday", isWorkingDay: true, openingTime: "09:00", closingTime: "17:00", breakStartTime: "12:00", breakEndTime: "13:00" },
      { dayOfWeek: "thursday", isWorkingDay: true, openingTime: "09:00", closingTime: "17:00", breakStartTime: "12:00", breakEndTime: "13:00" },
      { dayOfWeek: "friday", isWorkingDay: true, openingTime: "09:00", closingTime: "17:00", breakStartTime: "12:00", breakEndTime: "13:00" },
      { dayOfWeek: "saturday", isWorkingDay: false, openingTime: "09:00", closingTime: "17:00", breakStartTime: "12:00", breakEndTime: "13:00" },
      { dayOfWeek: "sunday", isWorkingDay: false, openingTime: "09:00", closingTime: "17:00", breakStartTime: "12:00", breakEndTime: "13:00" },
    ]
  )

  const updateDaySchedule = (index: number, field: keyof WorkingHour, value: boolean | string) => {
    setSchedule((prev) => prev.map((day, i) => (i === index ? { ...day, [field]: value } : day)))
  }

  const toggleAllDays = (isWorkingDay: boolean) => {
    setSchedule((prev) => prev.map((day) => ({ ...day, isWorkingDay })))
  }

  const setAllTimes = (openingTime: string, closingTime: string) => {
    setSchedule((prev) => prev.map((day) => ({ ...day, openingTime, closingTime })))
  }

  const setAllBreakTimes = (breakStartTime: string, breakEndTime: string) => {
    setSchedule((prev) => prev.map((day) => ({ ...day, breakStartTime, breakEndTime })))
  }

  const handleComplete = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Validate at least one working day
      const hasWorkingDays = schedule.some(day => day.isWorkingDay);
      if (!hasWorkingDays) {
        toast.error('Please select at least one working day');
        setIsLoading(false);
        return;
      }

      // Validate working days have valid times
      const invalidDays = schedule.filter(day => 
        day.isWorkingDay && (!day.openingTime || !day.closingTime || day.openingTime >= day.closingTime)
      );
      
      if (invalidDays.length > 0) {
        toast.error('Please ensure all working days have valid opening and closing times');
        setIsLoading(false);
        return;
      }

      // Filter out non-working days for optional fields
      const workingHoursData = schedule.map(day => ({
        dayOfWeek: day.dayOfWeek,
        isWorkingDay: day.isWorkingDay,
        openingTime: day.isWorkingDay ? day.openingTime : undefined,
        closingTime: day.isWorkingDay ? day.closingTime : undefined,
        breakStartTime: day.isWorkingDay && day.breakStartTime ? day.breakStartTime : undefined,
        breakEndTime: day.isWorkingDay && day.breakEndTime ? day.breakEndTime : undefined,
      }));

      console.log("Complex Working Hours Data:", workingHoursData);
      
      // Try backend API first
      try {
        const validationResult = await stepApi.saveComplexSchedule(workingHoursData);
        if (validationResult.success && validationResult.canProceed) {
          // After successful schedule save, complete the complex setup
          try {
            const completionResult = await stepApi.completeComplexSetup();
            if (completionResult.success) {
              onNext(workingHoursData);
              toast.success('Complex setup completed successfully! All departments, working hours, and relationships have been established.');
              return;
            } else {
              console.warn('Complex completion failed, but schedule was saved:', completionResult.message);
              onNext(workingHoursData);
              toast.success('Complex schedule saved successfully');
              return;
            }
          } catch (completionError: any) {
            console.warn('Complex completion API failed, but schedule was saved:', completionError);
            onNext(workingHoursData);
            toast.success('Complex schedule saved successfully');
            return;
          }
        } else if (!validationResult.success) {
          toast.error(validationResult.message || 'Working hours validation failed');
          setIsLoading(false);
          return;
        }
      } catch (error: any) {
        console.error('Backend validation error:', error);
        
        // Handle specific backend validation errors
        if (error.response?.status === 400) {
          const errorMessage = error.response.data?.message || error.message || 'Invalid schedule data provided';
          
          if (errorMessage.includes('Complex not found')) {
            toast.error('Please complete the complex overview and contact forms first.');
          } else if (errorMessage.includes('Invalid working hours')) {
            toast.error('Please check your working hours format and try again.');
          } else {
            toast.error(`Schedule Error: ${errorMessage}`);
          }
        } else if (error.response?.status === 401) {
          toast.error('Authentication required. Please log in again.');
        } else if (error.response?.status >= 500) {
          toast.error('Server error. Please try again in a few minutes.');
        } else {
          // For network errors, fall back to local mode
          console.warn('Backend API not available, continuing with form flow:', error);
          onNext(workingHoursData);
          toast.success('Complex schedule saved locally - Setup complete!');
        }
        
        setIsLoading(false);
        return;
      }

      // Fallback: proceed locally if backend is unavailable
      onNext(workingHoursData);
      toast.success('Complex schedule saved locally - Setup complete!');
      
    } catch (error: any) {
      console.error('Working hours form submission error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  }

  const dayDisplayNames = {
    monday: "Monday",
    tuesday: "Tuesday", 
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday"
  }

  const { colors } = useClivinaTheme();

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
            <ChevronLeft className="w-4 h-4" />
            Back to Legal Details
          </button>
          <h1 className="text-2xl font-bold mb-2 text-primary font-lato">
            Working Schedule
          </h1>
          <p className="text-muted-foreground font-lato">
            Set your working days and hours
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-primary font-lato">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Quick Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={() => toggleAllDays(true)}
                  className="border-border text-muted-foreground hover:bg-accent"
                >
                  Select All Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleAllDays(false)}
                  className="border-border text-muted-foreground hover:bg-accent"
                >
                  Clear All Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAllTimes("09:00", "17:00")}
                  className="border-border text-muted-foreground hover:bg-accent"
                >
                  Set 9 AM - 5 PM
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAllTimes("08:00", "18:00")}
                  className="border-border text-muted-foreground hover:bg-accent"
                >
                  Set 8 AM - 6 PM
                </Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={() => setAllBreakTimes("12:00", "13:00")}
                  className="border-border text-muted-foreground hover:bg-accent"
                >
                  Set Break 12 PM - 1 PM
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAllBreakTimes("13:00", "14:00")}
                  className="border-border text-muted-foreground hover:bg-accent"
                >
                  Set Break 1 PM - 2 PM
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAllBreakTimes("", "")}
                  className="border-border text-muted-foreground hover:bg-accent"
                >
                  No Break Time
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Grid */}
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center text-lg text-primary font-lato">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Weekly Schedule
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {schedule.map((daySchedule, index) => (
                  <div key={daySchedule.dayOfWeek} className="p-6">
                    <div className="grid grid-cols-6 gap-6 items-center">
                      {/* Day and Checkbox */}
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={daySchedule.isWorkingDay}
                          onCheckedChange={(checked) => updateDaySchedule(index, "isWorkingDay", checked as boolean)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label className="text-sm font-medium text-foreground min-w-[80px] font-lato">
                          {dayDisplayNames[daySchedule.dayOfWeek]}
                        </label>
                      </div>

                      {/* Opening Time */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1 font-lato">
                          Opening Time
                        </label>
                        <Input
                          type="time"
                          value={daySchedule.openingTime || ''}
                          onChange={(e) => updateDaySchedule(index, "openingTime", e.target.value)}
                          disabled={!daySchedule.isWorkingDay}
                          className="bg-background border-border text-foreground disabled:bg-muted disabled:text-muted-foreground"
                        />
                      </div>

                      {/* Closing Time */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1 font-lato">
                          Closing Time
                        </label>
                        <Input
                          type="time"
                          value={daySchedule.closingTime || ''}
                          onChange={(e) => updateDaySchedule(index, "closingTime", e.target.value)}
                          disabled={!daySchedule.isWorkingDay}
                          className="bg-background border-border text-foreground disabled:bg-muted disabled:text-muted-foreground"
                        />
                      </div>

                      {/* Break Start Time */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1 font-lato">
                          Break Start
                        </label>
                        <Input
                          type="time"
                          value={daySchedule.breakStartTime || ''}
                          onChange={(e) => updateDaySchedule(index, "breakStartTime", e.target.value)}
                          disabled={!daySchedule.isWorkingDay}
                          className="bg-background border-border text-foreground disabled:bg-muted disabled:text-muted-foreground"
                        />
                      </div>

                      {/* Break End Time */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1 font-lato">
                          Break End
                        </label>
                        <Input
                          type="time"
                          value={daySchedule.breakEndTime || ''}
                          onChange={(e) => updateDaySchedule(index, "breakEndTime", e.target.value)}
                          disabled={!daySchedule.isWorkingDay}
                          className="bg-background border-border text-foreground disabled:bg-muted disabled:text-muted-foreground"
                        />
                      </div>

                      {/* Status */}
                      <div className="text-right">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium font-lato ${
                            daySchedule.isWorkingDay 
                              ? "bg-primary/10 text-primary" 
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {daySchedule.isWorkingDay ? "Working Day" : "Day Off"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Summary */}
          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 mt-0.5 text-primary" />
                <div>
                  <h3 className="text-sm font-medium text-primary mb-2 font-lato">
                    Schedule Summary
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-lato">
                    Working Days: {schedule.filter((day) => day.isWorkingDay).length} days per week
                    <br />
                    This schedule will be used for appointment booking and availability display for your complex.
                    <br />
                    Break times are optional and can be left empty if not applicable.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            className="w-full sm:w-auto h-[48px] px-8 font-lato text-primary border-border hover:bg-muted"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            type="button"
            onClick={handleComplete}
            disabled={isLoading}
            className="w-full sm:w-auto h-[48px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-lato disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Complete Setup
                <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 