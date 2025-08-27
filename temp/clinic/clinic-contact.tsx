"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Plus, X, Phone, Mail, Globe, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { Sidebar } from "@/components/ui/sidebar"

interface ContactDetailsFormProps {
  onPrevious: () => void
  onNext: () => void
}

interface PhoneNumber {
  id: string
  number: string
  type: string
}

interface SocialMediaLinks {
  facebook?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  whatsapp?: string
}

interface ClinicContactData {
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  googleLocation: string
  phone: string
  email: string
  website: string
  emergencyContactName: string
  emergencyContactPhone: string
  socialMediaLinks: SocialMediaLinks
}

export default function ContactDetailsForm({ onPrevious, onNext }: ContactDetailsFormProps) {
  const [phones, setPhones] = useState<PhoneNumber[]>([{ id: "1", number: "", type: "Primary" }])
  const [formData, setFormData] = useState<ClinicContactData>({
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    googleLocation: "",
    phone: "",
    email: "",
    website: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    socialMediaLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      whatsapp: ""
    }
  })

  const addPhone = () => {
    const newPhone: PhoneNumber = {
      id: Date.now().toString(),
      number: "",
      type: "Secondary",
    }
    setPhones([...phones, newPhone])
  }

  const removePhone = (id: string) => {
    if (phones.length > 1) {
      setPhones(phones.filter((phone) => phone.id !== id))
    }
  }

  const updatePhone = (id: string, field: "number" | "type", value: string) => {
    setPhones(phones.map((phone) => (phone.id === id ? { ...phone, [field]: value } : phone)))
  }

  const updateFormData = (field: keyof ClinicContactData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateSocialMedia = (platform: keyof SocialMediaLinks, url: string) => {
    setFormData(prev => ({
      ...prev,
      socialMediaLinks: {
        ...prev.socialMediaLinks,
        [platform]: url
      }
    }))
  }

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className="w-4 h-4" />
      case "twitter":
        return <Twitter className="w-4 h-4" />
      case "instagram":
        return <Instagram className="w-4 h-4" />
      case "linkedin":
        return <Linkedin className="w-4 h-4" />
      case "whatsapp":
        return <Phone className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const socialPlatforms = [
    { key: 'facebook' as keyof SocialMediaLinks, name: 'Facebook' },
    { key: 'instagram' as keyof SocialMediaLinks, name: 'Instagram' },
    { key: 'twitter' as keyof SocialMediaLinks, name: 'Twitter' },
    { key: 'linkedin' as keyof SocialMediaLinks, name: 'LinkedIn' },
    { key: 'whatsapp' as keyof SocialMediaLinks, name: 'WhatsApp' },
  ]

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">
      <Sidebar currentStep={3} currentSubStep="contact" planType="clinic" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
                  <div className="mb-8">
            <div className="flex items-center gap-2 text-[#717680] text-sm mb-2">
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Clinic Overview</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#2a2b2a] mb-1">Contact Details</h1>
            <p className="text-[#717680]">Fill in your contact information</p>
          </div>

        {/* Form */}
        <div className="max-w-4xl space-y-8">
          {/* Phone Numbers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[#2a2b2a]">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Numbers<span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                variant="ghost"
                onClick={addPhone}
                className="text-[#00b48d] hover:text-[#00b48d] hover:bg-[#e2f6ec] p-2 h-auto"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Phone
              </Button>
            </div>

            {phones.map((phone, index) => (
              <div key={phone.id} className="grid grid-cols-3 gap-4 p-4 border border-[#e4e2dd] rounded-lg bg-white">
                <div>
                  <label className="block text-xs font-medium text-[#717680] mb-1">Type</label>
                  <Input
                    placeholder="Phone Type"
                    value={phone.type}
                    onChange={(e) => updatePhone(phone.id, "type", e.target.value)}
                    className="bg-white border-[#e4e2dd] text-[#717680]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#717680] mb-1">Phone Number</label>
                  <Input
                    placeholder="Enter Phone Number"
                    value={phone.number}
                    onChange={(e) => updatePhone(phone.id, "number", e.target.value)}
                    className="bg-white border-[#e4e2dd] text-[#717680]"
                  />
                </div>
                <div className="flex items-end">
                  {phones.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removePhone(phone.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 h-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Email and Website */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address<span className="text-red-500">*</span>
              </label>
              <Input 
                placeholder="Enter Email Address" 
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className="bg-white border-[#e4e2dd] text-[#717680]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Website
              </label>
              <Input 
                placeholder="https://" 
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                className="bg-white border-[#e4e2dd] text-[#717680]" 
              />
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address<span className="text-red-500">*</span>
              </label>
              <Input 
                placeholder="Enter Street Address" 
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                className="bg-white border-[#e4e2dd] text-[#717680] mb-3" 
              />
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="City" 
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  className="bg-white border-[#e4e2dd] text-[#717680]" 
                />
                <Input 
                  placeholder="State/Province" 
                  value={formData.state}
                  onChange={(e) => updateFormData('state', e.target.value)}
                  className="bg-white border-[#e4e2dd] text-[#717680]" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Input 
                  placeholder="Postal Code" 
                  value={formData.postalCode}
                  onChange={(e) => updateFormData('postalCode', e.target.value)}
                  className="bg-white border-[#e4e2dd] text-[#717680]" 
                />
                <Input 
                  placeholder="Country" 
                  value={formData.country}
                  onChange={(e) => updateFormData('country', e.target.value)}
                  className="bg-white border-[#e4e2dd] text-[#717680]" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Google Maps Address
              </label>
              <Input
                placeholder="Enter Google Maps URL or Place ID"
                value={formData.googleLocation}
                onChange={(e) => updateFormData('googleLocation', e.target.value)}
                className="bg-white border-[#e4e2dd] text-[#717680]"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
                Emergency Contact Name
              </label>
              <Input 
                placeholder="Enter Emergency Contact Name" 
                value={formData.emergencyContactName}
                onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
                className="bg-white border-[#e4e2dd] text-[#717680]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
                Emergency Contact Phone
              </label>
              <Input 
                placeholder="Enter Emergency Contact Phone" 
                value={formData.emergencyContactPhone}
                onChange={(e) => updateFormData('emergencyContactPhone', e.target.value)}
                className="bg-white border-[#e4e2dd] text-[#717680]" 
              />
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#2a2b2a]">Social Media Links</label>
            <div className="grid grid-cols-2 gap-4">
              {socialPlatforms.map((platform) => (
                <div key={platform.key} className="p-4 border border-[#e4e2dd] rounded-lg bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    {getSocialIcon(platform.name)}
                    <span className="text-sm font-medium text-[#2a2b2a]">{platform.name}</span>
                  </div>
                  <Input
                    placeholder={`Enter ${platform.name} URL`}
                    value={formData.socialMediaLinks[platform.key] || ''}
                    onChange={(e) => updateSocialMedia(platform.key, e.target.value)}
                    className="bg-white border-[#e4e2dd] text-[#717680]"
                  />
                </div>
              ))}
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
