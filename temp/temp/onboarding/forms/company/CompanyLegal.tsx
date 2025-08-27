"use client"

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { colors } from "@/lib/colors"

interface CompanyLegalData {
  vatNumber?: string
  crNumber?: string
  termsConditionsUrl?: string
  privacyPolicyUrl?: string
}

interface CompanyLegalProps {
  data?: Partial<CompanyLegalData>
  onChange: (data: Partial<CompanyLegalData>) => void
}

export function CompanyLegal({ data = {}, onChange }: CompanyLegalProps) {
  const [formData, setFormData] = useState<Partial<CompanyLegalData>>(data)

  const handleInputChange = (field: keyof CompanyLegalData, value: string) => {
    const updatedData = {
      ...formData,
      [field]: value
    }
    setFormData(updatedData)
    onChange(updatedData)
  }

  return (
    <div className="space-y-6">
      {/* VAT Number and CR Number */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            VAT Number
          </label>
          <Input
            placeholder="Enter VAT number"
            value={formData.vatNumber || ''}
            onChange={(e) => handleInputChange('vatNumber', e.target.value)}
            className="bg-white"
            style={{
              borderColor: colors.light.border.primary,
              color: colors.light.text.primary,
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            Commercial Registration Number
          </label>
          <Input
            placeholder="Enter CR number"
            value={formData.crNumber || ''}
            onChange={(e) => handleInputChange('crNumber', e.target.value)}
            className="bg-white"
            style={{
              borderColor: colors.light.border.primary,
              color: colors.light.text.primary,
            }}
          />
        </div>
      </div>

      {/* Legal Documents URLs */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            Terms & Conditions URL
          </label>
          <Input
            type="url"
            placeholder="https://www.company.com/terms"
            value={formData.termsConditionsUrl || ''}
            onChange={(e) => handleInputChange('termsConditionsUrl', e.target.value)}
            className="bg-white"
            style={{
              borderColor: colors.light.border.primary,
              color: colors.light.text.primary,
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            Privacy Policy URL
          </label>
          <Input
            type="url"
            placeholder="https://www.company.com/privacy"
            value={formData.privacyPolicyUrl || ''}
            onChange={(e) => handleInputChange('privacyPolicyUrl', e.target.value)}
            className="bg-white"
            style={{
              borderColor: colors.light.border.primary,
              color: colors.light.text.primary,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default CompanyLegal
