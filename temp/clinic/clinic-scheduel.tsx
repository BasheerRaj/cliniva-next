"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, Clock, CheckCircle, Calendar, AlertTriangle } from "lucide-react"
import { Sidebar } from "@/components/ui/sidebar"

interface ClinicWorkingScheduleFormProps {
  onPrevious: () => void
  onFinish: () => void
}

interface ClinicWorkingHours {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  isWorkingDay: boolean
  openingTime?: string
  closingTime?: string
  breakStartTime?: string
  breakEndTime?: string
  complexOpeningTime?: string
  complexClosingTime?: string
  complexEnabled: boolean
}

export default function ClinicWorkingScheduleForm({ onPrevious, onFinish }: ClinicWorkingScheduleFormProps) {
  const [schedule, setSchedule] = useState<ClinicWorkingHours[]>([
    {
      dayOfWeek: "monday",
      isWorkingDay: true,
      openingTime: "09:00",
      closingTime: "17:00",
      breakStartTime: "",
      breakEndTime: "",
      complexOpeningTime: "08:00",
      complexClosingTime: "18:00",
      complexEnabled: true,
    },
    {
      dayOfWeek: "tuesday",
      isWorkingDay: true,
      openingTime: "09:00",
      closingTime: "17:00",
      breakStartTime: "",
      breakEndTime: "",
      complexOpeningTime: "08:00",
      complexClosingTime: "18:00",
      complexEnabled: true,
    },
    {
      dayOfWeek: "wednesday",
      isWorkingDay: true,
      openingTime: "09:00",
      closingTime: "17:00",
      breakStartTime: "",
      breakEndTime: "",
      complexOpeningTime: "08:00",
      complexClosingTime: "18:00",
      complexEnabled: true,
    },
    {
      dayOfWeek: "thursday",
      isWorkingDay: true,
      openingTime: "09:00",
      closingTime: "17:00",
      breakStartTime: "",
      breakEndTime: "",
      complexOpeningTime: "08:00",
      complexClosingTime: "18:00",
      complexEnabled: true,
    },
    {
      dayOfWeek: "friday",
      isWorkingDay: true,
      openingTime: "09:00",
      closingTime: "17:00",
      breakStartTime: "",
      breakEndTime: "",
      complexOpeningTime: "08:00",
      complexClosingTime: "18:00",
      complexEnabled: true,
    },
    {
      dayOfWeek: "saturday",
      isWorkingDay: false,
      openingTime: "10:00",
      closingTime: "14:00",
      breakStartTime: "",
      breakEndTime: "",
      complexOpeningTime: "09:00",
      complexClosingTime: "15:00",
      complexEnabled: true,
    },
    {
      dayOfWeek: "sunday",
      isWorkingDay: false,
      openingTime: "10:00",
      closingTime: "14:00",
      breakStartTime: "",
      breakEndTime: "",
      complexOpeningTime: "10:00",
      complexClosingTime: "16:00",
      complexEnabled: false,
    },
  ])

  const isTimeValid = (daySchedule: ClinicWorkingHours) => {
    if (!daySchedule.isWorkingDay) return true

    const openingTime = daySchedule.openingTime || ''
    const closingTime = daySchedule.closingTime || ''
    const complexStart = daySchedule.complexOpeningTime || ''
    const complexEnd = daySchedule.complexClosingTime || ''

    return openingTime >= complexStart && closingTime <= complexEnd && openingTime < closingTime
  }

  const getValidationError = (daySchedule: ClinicWorkingHours) => {
    if (!daySchedule.isWorkingDay) return null
    if (!daySchedule.complexEnabled) return "Complex is closed on this day"

    const openingTime = daySchedule.openingTime || ''
    const closingTime = daySchedule.closingTime || ''
    const complexStart = daySchedule.complexOpeningTime || ''
    const complexEnd = daySchedule.complexClosingTime || ''

    if (openingTime < complexStart) return `Opening time cannot be before ${complexStart}`
    if (closingTime > complexEnd) return `Closing time cannot be after ${complexEnd}`
    if (openingTime >= closingTime) return "Opening time must be before closing time"

    return null
  }

  const toggleDay = (index: number) => {
    const daySchedule = schedule[index]
    if (!daySchedule.isWorkingDay && !daySchedule.complexEnabled) {
      return // Don't allow enabling if complex is closed
    }

    const newSchedule = [...schedule]
    newSchedule[index].isWorkingDay = !newSchedule[index].isWorkingDay
    setSchedule(newSchedule)
  }

  const updateTime = (index: number, field: "openingTime" | "closingTime" | "breakStartTime" | "breakEndTime", value: string) => {
    const newSchedule = [...schedule]
    newSchedule[index][field] = value
    setSchedule(newSchedule)
  }

  const copyFromComplex = (index: number) => {
    const newSchedule = [...schedule]
    newSchedule[index].openingTime = newSchedule[index].complexOpeningTime
    newSchedule[index].closingTime = newSchedule[index].complexClosingTime
    setSchedule(newSchedule)
  }

  const enabledDaysCount = schedule.filter((day) => day.isWorkingDay).length
  const hasValidationErrors = schedule.some((day) => day.isWorkingDay && !isTimeValid(day))

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">
      <Sidebar currentStep={3} currentSubStep="schedule" planType="clinic" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[#717680] text-sm mb-2">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Clinic Overview</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#2a2b2a] mb-1">Clinic Working Schedule</h1>
          <p className="text-[#717680]">Set your clinic's operating hours within complex schedule</p>
        </div>

        {/* Form */}
        <div className="max-w-4xl space-y-6">
          {/* Schedule Summary */}
          <Card className="bg-white border-[#e4e2dd]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-[#2a2b2a] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#00b48d]" />
                Schedule Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#00b48d] rounded-full"></div>
                  <span className="text-sm text-[#717680]">Working Days: {enabledDaysCount}/7</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#69a3e9] rounded-full"></div>
                  <span className="text-sm text-[#717680]">Based on Complex Schedule</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Days */}
          <Card className="bg-white border-[#e4e2dd]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-[#2a2b2a] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00b48d]" />
                Working Schedule
              </CardTitle>
              <p className="text-sm text-[#717680]">
                Select days and set hours within your complex's operating schedule
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedule.map((daySchedule, index) => {
                const validationError = getValidationError(daySchedule)
                const isValid = isTimeValid(daySchedule)

                return (
                  <div
                    key={daySchedule.dayOfWeek}
                    className={`p-4 rounded-lg border transition-colors ${
                      !daySchedule.complexEnabled
                        ? "border-[#c4c4c4] bg-[#f6f6f7] opacity-60" // Gray out when complex is closed
                        : daySchedule.isWorkingDay && !isValid
                          ? "border-red-300 bg-red-50" // Red border for validation errors
                          : daySchedule.isWorkingDay
                            ? "border-[#00b48d] bg-[#e2f6ec]"
                            : "border-[#e4e2dd] bg-[#fafaf8]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={daySchedule.isWorkingDay}
                          onCheckedChange={() => toggleDay(index)}
                          disabled={!daySchedule.complexEnabled} // Disable checkbox when complex is closed
                          className="data-[state=checked]:bg-[#00b48d] data-[state=checked]:border-[#00b48d]"
                        />
                        <span className="font-medium text-[#2a2b2a] min-w-[80px]">{daySchedule.dayOfWeek.charAt(0).toUpperCase() + daySchedule.dayOfWeek.slice(1)}</span>
                        {!daySchedule.complexEnabled && (
                          <span className="text-xs text-[#717680] bg-[#f6f6f7] px-2 py-1 rounded border">
                            Complex Closed
                          </span>
                        )}
                      </div>
                      {daySchedule.complexEnabled && (
                        <div className="text-xs text-[#717680] bg-white px-2 py-1 rounded border">
                          Complex: {daySchedule.complexOpeningTime} - {daySchedule.complexClosingTime}
                        </div>
                      )}
                    </div>

                    {daySchedule.isWorkingDay && (
                      <div className="ml-7 space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-[#717680] min-w-[70px]">Opening:</label>
                            <Input
                              type="time"
                              value={daySchedule.openingTime}
                              onChange={(e) => updateTime(index, "openingTime", e.target.value)}
                              className={`w-32 bg-white border-[#e4e2dd] text-[#717680] ${
                                !isValid ? "border-red-300" : ""
                              }`}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-[#717680] min-w-[70px]">Closing:</label>
                            <Input
                              type="time"
                              value={daySchedule.closingTime}
                              onChange={(e) => updateTime(index, "closingTime", e.target.value)}
                              className={`w-32 bg-white border-[#e4e2dd] text-[#717680] ${
                                !isValid ? "border-red-300" : ""
                              }`}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => copyFromComplex(index)}
                            className="text-[#00b48d] hover:text-[#00b48d] hover:bg-white text-xs px-3 py-1 h-auto"
                          >
                            Use Complex Hours
                          </Button>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-[#717680] min-w-[70px]">Break Start:</label>
                            <Input
                              type="time"
                              value={daySchedule.breakStartTime}
                              onChange={(e) => updateTime(index, "breakStartTime", e.target.value)}
                              className="w-32 bg-white border-[#e4e2dd] text-[#717680]"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-[#717680] min-w-[70px]">Break End:</label>
                            <Input
                              type="time"
                              value={daySchedule.breakEndTime}
                              onChange={(e) => updateTime(index, "breakEndTime", e.target.value)}
                              className="w-32 bg-white border-[#e4e2dd] text-[#717680]"
                            />
                          </div>
                        </div>
                        {validationError && (
                          <div className="flex items-center gap-2 text-red-600 text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{validationError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Setup Complete Notice */}
          <div className="bg-[#e2f6ec] border border-[#00b48d] rounded-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#00b48d] mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-[#2a2b2a] mb-2">Clinic Setup Complete</h3>
                <p className="text-xs text-[#717680] leading-relaxed">
                  Your clinic working schedule has been configured. You can modify these hours anytime from the clinic
                  management panel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-8 right-8 flex gap-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            className="px-6 py-2 border-[#e4e2dd] text-[#717680] hover:bg-[#f6f6f7] bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={onFinish}
            disabled={hasValidationErrors} // Disable button if there are validation errors
            className="px-6 py-2 bg-[#00b48d] hover:bg-[#00a07a] text-white disabled:bg-[#c4c4c4] disabled:cursor-not-allowed"
          >
            Complete Setup
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
