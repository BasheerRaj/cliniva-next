"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronUp, ChevronDown, Upload, Calendar, Plus, X, CheckCircle } from "lucide-react"
import { Sidebar } from "@/components/ui/sidebar"

interface ClinicOverviewFormProps {
  onPrevious: () => void
  onNext: () => void
}

interface ClinicService {
  id: string
  name: string
  description: string
  durationMinutes: number
  price: number
  complexDepartmentId?: string
}

interface ClinicOverviewData {
  name: string
  legalName: string
  headDoctorName: string
  specialization: string
  licenseNumber: string
  pin: string
  logoUrl: string
  website: string
  complexDepartmentId: string
  services: ClinicService[]
  yearEstablished: number
  mission: string
  vision: string
  goals: string
  ceoFirstName: string
  ceoLastName: string
  maxStaff: number
  maxDoctors: number
  maxPatients: number
  sessionDuration: number
}

export default function ClinicOverviewForm({ onPrevious, onNext }: ClinicOverviewFormProps) {
  const [isClinicOverviewOpen, setIsClinicOverviewOpen] = useState(true)
  const [isServicesOpen, setIsServicesOpen] = useState(true)
  const [isCapacityOpen, setIsCapacityOpen] = useState(true)
  const [services, setServices] = useState<ClinicService[]>([{ id: "1", name: "", description: "", durationMinutes: 30, price: 0 }])
  const [formData, setFormData] = useState<ClinicOverviewData>({
    name: "",
    legalName: "",
    headDoctorName: "",
    specialization: "",
    licenseNumber: "",
    pin: "",
    logoUrl: "",
    website: "",
    complexDepartmentId: "",
    services: [],
    yearEstablished: new Date().getFullYear(),
    mission: "",
    vision: "",
    goals: "",
    ceoFirstName: "",
    ceoLastName: "",
    maxStaff: 0,
    maxDoctors: 0,
    maxPatients: 0,
    sessionDuration: 30
  })

  const availableDepartments = [
    { id: "dept-1", name: "Cardiology Department" },
    { id: "dept-2", name: "Emergency Medicine" },
    { id: "dept-3", name: "Pediatrics" },
    { id: "dept-4", name: "Radiology" },
    { id: "dept-5", name: "General Surgery" },
    { id: "dept-6", name: "Internal Medicine" },
    { id: "dept-7", name: "Orthopedics" },
    { id: "dept-8", name: "Neurology" },
  ]

  const addService = () => {
    const newService: ClinicService = {
      id: Date.now().toString(),
      name: "",
      description: "",
      durationMinutes: 30,
      price: 0,
    }
    setServices([...services, newService])
  }

  const removeService = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter((service) => service.id !== id))
    }
  }

  const updateService = (id: string, field: keyof ClinicService, value: string | number) => {
    setServices(services.map((service) => (service.id === id ? { ...service, [field]: value } : service)))
  }

  const updateFormData = (field: keyof ClinicOverviewData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">
      <Sidebar currentStep={3} currentSubStep="overview" planType="clinic" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[#717680] text-sm mb-2">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Working Schedule</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#2a2b2a] mb-1">Fill in Clinic Details</h1>
          <p className="text-[#717680]">Clinic Overview</p>
        </div>

        {/* Form */}
        <div className="max-w-4xl space-y-8">
          {/* Logo and Clinic Name Row */}
          <div className="grid grid-cols-2 gap-8">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
                Logo<span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-[#e4e2dd] rounded-lg p-8 text-center bg-white">
                <Upload className="w-8 h-8 text-[#717680] mx-auto mb-3" />
                <p className="text-[#69a3e9] text-sm mb-1">Click or Drag file to this area to upload</p>
                <p className="text-[#717680] text-xs">SVG, PNG, JPG or GIF , Maximum file size 2MB.</p>
              </div>
            </div>

            {/* Clinic Name */}
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
                Clinic Name<span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <Input 
                  placeholder="Enter Trade Name" 
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="bg-white border-[#e4e2dd] text-[#717680]" 
                />
                <Input 
                  placeholder="Enter Legal Name" 
                  value={formData.legalName}
                  onChange={(e) => updateFormData('legalName', e.target.value)}
                  className="bg-white border-[#e4e2dd] text-[#717680]" 
                />
              </div>
            </div>
          </div>

          {/* Basic Information Row */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Year of Establishment</label>
              <Input 
                type="number" 
                placeholder="2024" 
                value={formData.yearEstablished || ''}
                onChange={(e) => updateFormData('yearEstablished', parseInt(e.target.value) || 0)}
                className="bg-white border-[#e4e2dd] text-[#717680]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
                Link to Department<span className="text-red-500">*</span>
              </label>
              <Select value={formData.complexDepartmentId} onValueChange={(value) => updateFormData('complexDepartmentId', value)}>
                <SelectTrigger className="bg-white border-[#e4e2dd] text-[#717680]">
                  <SelectValue placeholder="Select Department from Complex" />
                </SelectTrigger>
                <SelectContent>
                  {availableDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#717680] mt-1">
                Select which department from your complex this clinic belongs to
              </p>
            </div>
          </div>

          {/* Professional Information */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Head Doctor Name</label>
              <Input 
                placeholder="Enter Head Doctor Name" 
                value={formData.headDoctorName}
                onChange={(e) => updateFormData('headDoctorName', e.target.value)}
                className="bg-white border-[#e4e2dd] text-[#717680]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Specialization</label>
              <Input 
                placeholder="Enter Specialization" 
                value={formData.specialization}
                onChange={(e) => updateFormData('specialization', e.target.value)}
                className="bg-white border-[#e4e2dd] text-[#717680]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">License Number</label>
              <Input 
                placeholder="Enter License Number" 
                value={formData.licenseNumber}
                onChange={(e) => updateFormData('licenseNumber', e.target.value)}
                className="bg-white border-[#e4e2dd] text-[#717680]" 
              />
            </div>
          </div>

          {/* PIN and Website */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Clinic PIN</label>
              <Input 
                placeholder="Enter Clinic PIN" 
                value={formData.pin}
                onChange={(e) => updateFormData('pin', e.target.value)}
                className="bg-white border-[#e4e2dd] text-[#717680]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Website</label>
              <Input 
                placeholder="https://" 
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                className="bg-white border-[#e4e2dd] text-[#717680]" 
              />
            </div>
          </div>

          <Card className="bg-white border-[#e4e2dd]">
            <Collapsible open={isClinicOverviewOpen} onOpenChange={setIsClinicOverviewOpen}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer">
                  <h3 className="text-lg font-medium text-[#2a2b2a]">Clinic Overview</h3>
                  {isClinicOverviewOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#717680]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#717680]" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-6">
                  {/* Mission and Vision Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Mission</label>
                      <Textarea
                        placeholder="Enter Mission"
                        value={formData.mission}
                        onChange={(e) => updateFormData('mission', e.target.value)}
                        className="bg-white border-[#e4e2dd] text-[#717680] min-h-[100px] resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Vision</label>
                      <Textarea
                        placeholder="Enter Vision"
                        value={formData.vision}
                        onChange={(e) => updateFormData('vision', e.target.value)}
                        className="bg-white border-[#e4e2dd] text-[#717680] min-h-[100px] resize-none"
                      />
                    </div>
                  </div>

                  {/* Goals */}
                  <div>
                    <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Goals</label>
                    <Textarea
                      placeholder="Enter Goals"
                      value={formData.goals}
                      onChange={(e) => updateFormData('goals', e.target.value)}
                      className="bg-white border-[#e4e2dd] text-[#717680] min-h-[120px] resize-none"
                    />
                  </div>

                  {/* CEO Name Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
                        CEO Name<span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div>
                      <Input 
                        placeholder="Enter First Name" 
                        value={formData.ceoFirstName}
                        onChange={(e) => updateFormData('ceoFirstName', e.target.value)}
                        className="bg-white border-[#e4e2dd] text-[#717680]" 
                      />
                    </div>
                    <div>
                      <Input 
                        placeholder="Enter Last Name" 
                        value={formData.ceoLastName}
                        onChange={(e) => updateFormData('ceoLastName', e.target.value)}
                        className="bg-white border-[#e4e2dd] text-[#717680]" 
                      />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Services Section */}
          <Card className="bg-white border-[#e4e2dd]">
            <Collapsible open={isServicesOpen} onOpenChange={setIsServicesOpen}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer">
                  <h3 className="text-lg font-medium text-[#2a2b2a]">Services</h3>
                  {isServicesOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#717680]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#717680]" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-[#717680]">Add services offered by your clinic</p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={addService}
                      className="text-[#00b48d] hover:text-[#00b48d] hover:bg-[#e2f6ec] p-2 h-auto"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Service
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {services.map((service, index) => (
                      <div key={service.id} className="space-y-4 p-4 border border-[#e4e2dd] rounded-lg bg-[#fafaf8]">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#2a2b2a]">Service {index + 1}</span>
                          {services.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeService(service.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 h-auto"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-[#717680] mb-1">Service Name*</label>
                            <Input
                              placeholder="Enter Service Name"
                              value={service.name}
                              onChange={(e) => updateService(service.id, "name", e.target.value)}
                              className="bg-white border-[#e4e2dd] text-[#717680]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#717680] mb-1">Duration (minutes)</label>
                            <Input
                              type="number"
                              placeholder="30"
                              value={service.durationMinutes}
                              onChange={(e) => updateService(service.id, "durationMinutes", parseInt(e.target.value) || 0)}
                              className="bg-white border-[#e4e2dd] text-[#717680]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-[#717680] mb-1">Description</label>
                            <Textarea
                              placeholder="Enter Service Description"
                              value={service.description}
                              onChange={(e) => updateService(service.id, "description", e.target.value)}
                              className="bg-white border-[#e4e2dd] text-[#717680] min-h-[80px] resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#717680] mb-1">Price</label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={service.price}
                              onChange={(e) => updateService(service.id, "price", parseFloat(e.target.value) || 0)}
                              className="bg-white border-[#e4e2dd] text-[#717680]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Capacity Section */}
          <Card className="bg-white border-[#e4e2dd]">
            <Collapsible open={isCapacityOpen} onOpenChange={setIsCapacityOpen}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-6 cursor-pointer">
                  <h3 className="text-lg font-medium text-[#2a2b2a]">Capacity Settings</h3>
                  {isCapacityOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#717680]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#717680]" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Doctors Capacity*</label>
                      <Input
                        type="number"
                        placeholder="Enter number of doctors"
                        value={formData.maxDoctors}
                        onChange={(e) => updateFormData('maxDoctors', parseInt(e.target.value) || 0)}
                        className="bg-white border-[#e4e2dd] text-[#717680]"
                        min="1"
                      />
                      <p className="text-xs text-[#717680] mt-1">Maximum number of doctors</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Staff Capacity*</label>
                      <Input
                        type="number"
                        placeholder="Enter number of staff"
                        value={formData.maxStaff}
                        onChange={(e) => updateFormData('maxStaff', parseInt(e.target.value) || 0)}
                        className="bg-white border-[#e4e2dd] text-[#717680]"
                        min="1"
                      />
                      <p className="text-xs text-[#717680] mt-1">Maximum number of staff members</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Patient Capacity*</label>
                      <Input
                        type="number"
                        placeholder="Enter patient capacity"
                        value={formData.maxPatients}
                        onChange={(e) => updateFormData('maxPatients', parseInt(e.target.value) || 0)}
                        className="bg-white border-[#e4e2dd] text-[#717680]"
                        min="1"
                      />
                      <p className="text-xs text-[#717680] mt-1">Maximum patients per day</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Session Duration*</label>
                      <Input
                        type="number"
                        placeholder="30"
                        value={formData.sessionDuration}
                        onChange={(e) => updateFormData('sessionDuration', parseInt(e.target.value) || 0)}
                        className="bg-white border-[#e4e2dd] text-[#717680]"
                        min="1"
                      />
                      <p className="text-xs text-[#717680] mt-1">Default session duration in minutes</p>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Setup Complete Notice */}
          <div className="bg-[#e2f6ec] border border-[#00b48d] rounded-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#00b48d] mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-[#2a2b2a] mb-2">Setup Complete</h3>
                <p className="text-xs text-[#717680] leading-relaxed">
                  You have successfully completed the clinic setup process. Your clinic information can be updated
                  anytime from the settings panel.
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
          <Button onClick={onNext} className="px-6 py-2 bg-[#00b48d] hover:bg-[#00a07a] text-white">
            Next
            <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  )
}
