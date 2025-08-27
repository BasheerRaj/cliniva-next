"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Plus, X, Clock, DollarSign } from "lucide-react"
import { Sidebar } from "@/components/ui/sidebar"

interface ClinicService {
  id: string
  name: string
  description: string
  durationMinutes: number
  price: number
  complexDepartmentId?: string
}

interface ClinicCapacity {
  maxStaff: number
  maxDoctors: number
  maxPatients: number
  sessionDuration: number
}

interface ServiceCapacityFormProps {
  onPrevious: () => void
  onNext: () => void
}

export default function ServiceCapacityForm({ onPrevious, onNext }: ServiceCapacityFormProps) {
  const [services, setServices] = useState<ClinicService[]>([{ 
    id: "1", 
    name: "", 
    description: "", 
    durationMinutes: 30, 
    price: 0 
  }])
  const [capacity, setCapacity] = useState<ClinicCapacity>({
    maxStaff: 0,
    maxDoctors: 0,
    maxPatients: 0,
    sessionDuration: 30
  })

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

  const updateCapacity = (field: keyof ClinicCapacity, value: number) => {
    setCapacity(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">
      <Sidebar currentStep={3} currentSubStep="services" planType="clinic" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
                  <div className="mb-8">
            <div className="flex items-center gap-2 text-[#717680] text-sm mb-2">
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Contact Details</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#2a2b2a] mb-1">Service & Capacity</h1>
            <p className="text-[#717680]">Configure services and capacity settings</p>
          </div>

        {/* Form */}
        <div className="max-w-4xl space-y-8">
          {/* Services Section */}
          <Card className="bg-white border-[#e4e2dd]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-[#2a2b2a]">Services</h3>
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
                        <div className="relative">
                                                      <Input
                              type="number"
                              placeholder="30"
                              value={service.durationMinutes}
                              onChange={(e) => updateService(service.id, "durationMinutes", parseInt(e.target.value) || 0)}
                              className="bg-white border-[#e4e2dd] text-[#717680] pr-10"
                            />
                          <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#717680]" />
                        </div>
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
                        <div className="relative">
                                                      <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={service.price}
                              onChange={(e) => updateService(service.id, "price", parseFloat(e.target.value) || 0)}
                              className="bg-white border-[#e4e2dd] text-[#717680] pr-10"
                            />
                          <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#717680]" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Capacity Section */}
          <Card className="bg-white border-[#e4e2dd]">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-[#2a2b2a] mb-6">Capacity Settings</h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Session Duration*</label>
                  <Input
                    placeholder="Enter session duration"
                    value={capacity.sessionDuration}
                    onChange={(e) => updateCapacity('sessionDuration', parseInt(e.target.value) || 0)}
                    className="bg-white border-[#e4e2dd] text-[#717680]"
                    type="number"
                    min="1"
                  />
                  <p className="text-xs text-[#717680] mt-1">Default session duration in minutes</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Doctors Capacity*</label>
                  <Input
                    placeholder="Enter number of doctors"
                    value={capacity.maxDoctors}
                    onChange={(e) => updateCapacity('maxDoctors', parseInt(e.target.value) || 0)}
                    className="bg-white border-[#e4e2dd] text-[#717680]"
                    type="number"
                    min="1"
                  />
                  <p className="text-xs text-[#717680] mt-1">Maximum number of doctors</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Staff Capacity*</label>
                  <Input
                    placeholder="Enter number of staff"
                    value={capacity.maxStaff}
                    onChange={(e) => updateCapacity('maxStaff', parseInt(e.target.value) || 0)}
                    className="bg-white border-[#e4e2dd] text-[#717680]"
                    type="number"
                    min="1"
                  />
                  <p className="text-xs text-[#717680] mt-1">Maximum number of staff members</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2a2b2a] mb-2">Patient Capacity*</label>
                  <Input
                    placeholder="Enter patient capacity"
                    value={capacity.maxPatients}
                    onChange={(e) => updateCapacity('maxPatients', parseInt(e.target.value) || 0)}
                    className="bg-white border-[#e4e2dd] text-[#717680]"
                    type="number"
                    min="1"
                  />
                  <p className="text-xs text-[#717680] mt-1">Maximum patients per day</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#e2f6ec] rounded-lg">
                <h4 className="text-sm font-medium text-[#2a2b2a] mb-2">Capacity Guidelines</h4>
                <ul className="text-xs text-[#717680] space-y-1">
                  <li>• Doctor capacity should align with your clinic size and specializations</li>
                  <li>• Staff capacity includes nurses, technicians, and administrative personnel</li>
                  <li>• Patient capacity helps manage daily appointments and waiting times</li>
                </ul>
              </div>
            </CardContent>
          </Card>
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
