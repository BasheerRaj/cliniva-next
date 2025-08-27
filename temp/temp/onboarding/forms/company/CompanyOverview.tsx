"use client"

// Updated CompanyOverview form to match new standardized OrganizationOverviewDto structure
// Key changes: 
// - Flattened businessProfile fields (yearEstablished, mission, vision, ceoName are now top-level)
// - Removed registrationNumber field (moved to legal form)
// - Simplified form handling without nested object structures

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Calendar, X, CheckCircle, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { colors } from "@/lib/colors"
import { useOrganizationOverviewSaving } from '@/hooks/useProgressiveSaving'
import { useRealtimeValidation } from '@/hooks/useRealtimeValidation'
import { useOnboardingErrorHandler, ErrorHandler } from '@/components/ui/ErrorHandler'

// Updated interface to match new OrganizationOverviewDto structure (flattened)
interface CompanyOverviewData {
  name: string
  legalName?: string
  logoUrl?: string
  website?: string
  registrationNumber?: string
  // Business profile fields (flattened from nested structure)
  yearEstablished?: number
  mission?: string
  vision?: string
  overview?: string // Company overview/description
  goals?: string // Company goals
  ceoName?: string
}

interface CompanyOverviewProps {
  data?: Partial<CompanyOverviewData>
  onChange: (data: Partial<CompanyOverviewData>) => void
}

export function CompanyOverview({ data = {}, onChange }: CompanyOverviewProps) {
  const [formData, setFormData] = useState<Partial<CompanyOverviewData>>(data)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Progressive saving
  const { autoSave, saveNow, isSaving } = useOrganizationOverviewSaving()
  
  // Real-time validation
  const { validateOrgName, getValidationState } = useRealtimeValidation()
  
  // Error handling
  const { 
    errors, 
    dismissError, 
    handleSaveError, 
    handleValidationError,
    showAutoSaveSuccess 
  } = useOnboardingErrorHandler()

  const handleInputChange = (field: keyof CompanyOverviewData | string, value: string | number) => {
    // Simplified handling since fields are now flattened (no nested businessProfile)
    const updatedData = {
      ...formData,
      [field as keyof CompanyOverviewData]: value
    }
    
    setFormData(updatedData)
    onChange(updatedData)
    
    // Trigger auto-save
    autoSave(updatedData)
  }

  const handleFileSelect = useCallback((file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPG, PNG, GIF, SVG)')
      return
    }

    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      setUploadError('File size must be less than 2MB')
      return
    }

    setUploadError(null)
    setSelectedFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    handleInputChange('logoUrl', `uploaded_${file.name}`)
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null)
    setFilePreview(null)
    setUploadError(null)
    handleInputChange('logoUrl', '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Error Handler */}
      <ErrorHandler errors={errors} onDismiss={dismissError} />
      
      {/* Auto-save Indicator */}
      {isSaving && (
        <div className="flex items-center gap-2 text-sm p-3 rounded-lg" style={{ 
          backgroundColor: colors.light.background.tertiary, 
          color: colors.light.text.secondary 
        }}>
          <Save className="w-4 h-4 animate-spin" />
          <span>Auto-saving...</span>
        </div>
      )}

      {/* Logo and Company Name Row */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            Logo<span style={{ color: colors.light.state.error }}>*</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:opacity-80 transition-opacity relative"
            style={{
              borderColor: selectedFile ? colors.light.state.success : uploadError ? colors.light.state.error : colors.light.border.secondary,
              backgroundColor: colors.light.background.tertiary,
            }}
          >
            {filePreview ? (
              <div className="relative">
                <img
                  src={filePreview}
                  alt="Logo preview"
                  className="max-w-full max-h-24 mx-auto rounded"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFile()
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    {selectedFile?.name}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: colors.light.text.secondary }} />
                <p className="text-sm mb-1" style={{ color: colors.light.brand.secondary }}>
                  Click or Drag file to this area to upload
                </p>
                <p className="text-xs" style={{ color: colors.light.text.secondary }}>
                  SVG, PNG, JPG or GIF, Maximum file size 2MB.
                </p>
              </>
            )}
          </div>
          {uploadError && (
            <p className="text-xs mt-1" style={{ color: colors.light.state.error }}>
              {uploadError}
            </p>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
              Company Name<span style={{ color: colors.light.state.error }}>*</span>
            </label>
            <div className="relative">
              <Input
                placeholder="Enter Trade Name"
                value={formData.name || ''}
                onChange={(e) => {
                  const value = e.target.value
                  handleInputChange('name', value)
                  validateOrgName(value)
                }}
                className="bg-white"
                style={{
                  borderColor: getValidationState('organizationName').error 
                    ? colors.light.state.error 
                    : getValidationState('organizationName').isValid && getValidationState('organizationName').message
                    ? colors.light.state.success
                    : colors.light.border.primary,
                  color: colors.light.text.primary,
                }}
              />
              {getValidationState('organizationName').isValidating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Save className="w-4 h-4 animate-spin" style={{ color: colors.light.text.secondary }} />
                </div>
              )}
            </div>
            {getValidationState('organizationName').error && (
              <p className="text-xs mt-1" style={{ color: colors.light.state.error }}>
                {getValidationState('organizationName').error}
              </p>
            )}
            {getValidationState('organizationName').message && getValidationState('organizationName').isValid && (
              <p className="text-xs mt-1" style={{ color: colors.light.state.success }}>
                {getValidationState('organizationName').message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
              Legal Name
            </label>
            <Input
              placeholder="Enter Legal Name"
              value={formData.legalName || ''}
              onChange={(e) => handleInputChange('legalName', e.target.value)}
              className="bg-white"
              style={{
                borderColor: colors.light.border.primary,
                color: colors.light.text.primary,
              }}
            />
          </div>
        </div>
      </div>

      {/* Registration Number and Website */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            Registration Number
          </label>
          <Input
            placeholder="Enter Commercial Registration Number"
            value={formData.registrationNumber || ''}
            onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
            className="bg-white"
            style={{
              borderColor: colors.light.border.primary,
              color: colors.light.text.primary,
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            Website
          </label>
          <Input
            type="url"
            placeholder="https://www.company.com"
            value={formData.website || ''}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="bg-white"
            style={{
              borderColor: colors.light.border.primary,
              color: colors.light.text.primary,
            }}
          />
        </div>
      </div>

      {/* Year of Establishment and CEO Name */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            Year of Establishment
          </label>
          <div className="relative">
            <Input
              type="number"
              placeholder="e.g., 2020"
              value={formData.yearEstablished || ''}
              onChange={(e) => handleInputChange('yearEstablished', parseInt(e.target.value))}
              className="bg-white pr-10"
              style={{
                borderColor: colors.light.border.primary,
                color: colors.light.text.primary,
              }}
            />
            <Calendar
              className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2"
              style={{ color: colors.light.text.secondary }}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            CEO Name<span style={{ color: colors.light.state.error }}>*</span>
          </label>
          <Input
            placeholder="Enter CEO Name"
            value={formData.ceoName || ''}
            onChange={(e) => handleInputChange('ceoName', e.target.value)}
            className="bg-white"
            style={{
              borderColor: colors.light.border.primary,
              color: colors.light.text.primary,
            }}
          />
        </div>
      </div>

      {/* Vision and Mission */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            Mission
          </label>
          <Textarea
            placeholder="Enter Company Mission"
            value={formData.mission || ''}
            onChange={(e) => handleInputChange('mission', e.target.value)}
            className="bg-white min-h-[100px] resize-none"
            style={{
              borderColor: colors.light.border.primary,
              color: colors.light.text.primary,
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            Vision
          </label>
          <Textarea
            placeholder="Enter Company Vision"
            value={formData.vision || ''}
            onChange={(e) => handleInputChange('vision', e.target.value)}
            className="bg-white min-h-[100px] resize-none"
            style={{
              borderColor: colors.light.border.primary,
              color: colors.light.text.primary,
            }}
          />
        </div>
      </div>

      {/* Company Overview and Goals */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            Company Overview
          </label>
          <Textarea
            placeholder="Describe your company's background, services, and key achievements"
            value={formData.overview || ''}
            onChange={(e) => handleInputChange('overview', e.target.value)}
            className="bg-white min-h-[120px] resize-none"
            style={{
              borderColor: colors.light.border.primary,
              color: colors.light.text.primary,
            }}
          />
          <p className="text-xs mt-1" style={{ color: colors.light.text.secondary }}>
            Provide a comprehensive description of your organization
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            Strategic Goals
          </label>
          <Textarea
            placeholder="Outline your company's key objectives and strategic goals"
            value={formData.goals || ''}
            onChange={(e) => handleInputChange('goals', e.target.value)}
            className="bg-white min-h-[120px] resize-none"
            style={{
              borderColor: colors.light.border.primary,
              color: colors.light.text.primary,
            }}
          />
          <p className="text-xs mt-1" style={{ color: colors.light.text.secondary }}>
            Define your short-term and long-term business goals
          </p>
        </div>
      </div>
    </div>
  )
}

export default CompanyOverview
