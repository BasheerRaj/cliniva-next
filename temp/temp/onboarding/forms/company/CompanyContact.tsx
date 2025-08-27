"use client"

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { colors } from "@/lib/colors"

interface CompanyContactData {
  email?: string
  phone?: string
  address?: string
  googleLocation?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  socialMediaLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    whatsapp?: string
  }
}

interface CompanyContactProps {
  data?: Partial<CompanyContactData>
  onChange: (data: Partial<CompanyContactData>) => void
}

export function CompanyContact({ data = {}, onChange }: CompanyContactProps) {
  const [formData, setFormData] = useState<Partial<CompanyContactData>>(data)

  const handleInputChange = (field: keyof CompanyContactData | string, value: string) => {
    let updatedData = { ...formData }
    
    // Handle nested socialMediaLinks fields
    if (field.startsWith('socialMediaLinks.')) {
      const socialField = field.split('.')[1]
      updatedData.socialMediaLinks = {
        ...updatedData.socialMediaLinks,
        [socialField]: value
      }
    } else {
      updatedData = {
        ...updatedData,
        [field as keyof CompanyContactData]: value
      }
    }
    
    setFormData(updatedData)
    onChange(updatedData)
  }

  return (
    <div className="space-y-6">
      {/* Email and Phone */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            Email
          </label>
          <Input
            type="email"
            placeholder="company@example.com"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="bg-white"
            style={{
              borderColor: colors.light.border.primary,
              color: colors.light.text.primary,
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
            Phone Number
          </label>
          <Input
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="bg-white"
            style={{
              borderColor: colors.light.border.primary,
              color: colors.light.text.primary,
            }}
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
          Address
        </label>
        <Textarea
          placeholder="Enter company address"
          value={formData.address || ''}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="bg-white min-h-[80px] resize-none"
          style={{
            borderColor: colors.light.border.primary,
            color: colors.light.text.primary,
          }}
        />
      </div>

      {/* Google Location */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
          Google Location
        </label>
        <Input
          placeholder="Google Maps location URL or coordinates"
          value={formData.googleLocation || ''}
          onChange={(e) => handleInputChange('googleLocation', e.target.value)}
          className="bg-white"
          style={{
            borderColor: colors.light.border.primary,
            color: colors.light.text.primary,
          }}
        />
      </div>

      {/* Emergency Contact Information */}
      <div className="border-t pt-6" style={{ borderColor: colors.light.border.primary }}>
        <h4 className="text-md font-medium mb-4" style={{ color: colors.light.text.primary }}>
          Emergency Contact
        </h4>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
              Emergency Contact Name
            </label>
            <Input
              placeholder="Enter emergency contact name"
              value={formData.emergencyContactName || ''}
              onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
              className="bg-white"
              style={{
                borderColor: colors.light.border.primary,
                color: colors.light.text.primary,
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
              Emergency Contact Phone
            </label>
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.emergencyContactPhone || ''}
              onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
              className="bg-white"
              style={{
                borderColor: colors.light.border.primary,
                color: colors.light.text.primary,
              }}
            />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="border-t pt-6" style={{ borderColor: colors.light.border.primary }}>
        <h4 className="text-md font-medium mb-4" style={{ color: colors.light.text.primary }}>
          Social Media Links
        </h4>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
              Facebook
            </label>
            <Input
              type="url"
              placeholder="https://facebook.com/company"
              value={formData.socialMediaLinks?.facebook || ''}
              onChange={(e) => handleInputChange('socialMediaLinks.facebook', e.target.value)}
              className="bg-white"
              style={{
                borderColor: colors.light.border.primary,
                color: colors.light.text.primary,
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
              Instagram
            </label>
            <Input
              type="url"
              placeholder="https://instagram.com/company"
              value={formData.socialMediaLinks?.instagram || ''}
              onChange={(e) => handleInputChange('socialMediaLinks.instagram', e.target.value)}
              className="bg-white"
              style={{
                borderColor: colors.light.border.primary,
                color: colors.light.text.primary,
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
              Twitter
            </label>
            <Input
              type="url"
              placeholder="https://twitter.com/company"
              value={formData.socialMediaLinks?.twitter || ''}
              onChange={(e) => handleInputChange('socialMediaLinks.twitter', e.target.value)}
              className="bg-white"
              style={{
                borderColor: colors.light.border.primary,
                color: colors.light.text.primary,
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
              LinkedIn
            </label>
            <Input
              type="url"
              placeholder="https://linkedin.com/company/company"
              value={formData.socialMediaLinks?.linkedin || ''}
              onChange={(e) => handleInputChange('socialMediaLinks.linkedin', e.target.value)}
              className="bg-white"
              style={{
                borderColor: colors.light.border.primary,
                color: colors.light.text.primary,
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
              WhatsApp
            </label>
            <Input
              type="url"
              placeholder="https://wa.me/1234567890"
              value={formData.socialMediaLinks?.whatsapp || ''}
              onChange={(e) => handleInputChange('socialMediaLinks.whatsapp', e.target.value)}
              className="bg-white"
              style={{
                borderColor: colors.light.border.primary,
                color: colors.light.text.primary,
              }}
            />
          </div>
          <div>
            {/* Empty space for grid alignment */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyContact
