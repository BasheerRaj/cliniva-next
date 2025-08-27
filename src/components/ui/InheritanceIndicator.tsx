"use client"

import { Badge } from "@/components/ui/badge"
import { Building2, Edit3, Info } from "lucide-react"

interface InheritanceIndicatorProps {
  isInherited: boolean
  originalValue?: string
  fieldName?: string
  className?: string
}

export function InheritanceIndicator({ 
  isInherited, 
  originalValue, 
  fieldName,
  className = "" 
}: InheritanceIndicatorProps) {
  if (!isInherited) return null

  return (
    <Badge 
      variant="secondary" 
      className={`ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 ${className}`}
      title={`Inherited from Company${fieldName ? ` - ${fieldName}` : ''}${originalValue ? ` (${originalValue})` : ''}`}
    >
      <Building2 className="w-3 h-3 mr-1" />
      Inherited
    </Badge>
  )
}

interface InheritanceSummaryProps {
  inheritedCount: number
  totalCount: number
  onViewDetails?: () => void
}

export function InheritanceSummary({ 
  inheritedCount, 
  totalCount, 
  onViewDetails 
}: InheritanceSummaryProps) {
  if (inheritedCount === 0) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 mb-1">
            Data Inherited from Company
          </h3>
          <p className="text-sm text-blue-800">
            {inheritedCount} of {totalCount} fields have been pre-filled with data from your company setup. 
            You can edit any of these values to customize them for this complex.
          </p>
          {onViewDetails && (
            <button 
              onClick={onViewDetails}
              className="text-xs text-blue-600 hover:text-blue-800 mt-2 underline"
            >
              View inheritance details
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface EditableInheritedFieldProps {
  label: string
  value: string
  originalValue?: string
  isInherited: boolean
  onChange: (value: string) => void
  placeholder?: string
  type?: "text" | "email" | "url" | "number"
  required?: boolean
  className?: string
  children?: React.ReactNode
}

export function EditableInheritedField({
  label,
  value,
  originalValue,
  isInherited,
  onChange,
  placeholder,
  type = "text",
  required = false,
  className = "",
  children
}: EditableInheritedFieldProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-[#2a2b2a]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <InheritanceIndicator 
          isInherited={isInherited}
          originalValue={originalValue}
          fieldName={label}
        />
      </div>
      {children}
      {isInherited && (
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <Edit3 className="w-3 h-3" />
          Inherited from company - you can edit this value
        </p>
      )}
    </div>
  )
} 