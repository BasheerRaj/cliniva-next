"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, FileText, Shield, Scale, BookOpen } from "lucide-react"
import { Sidebar } from "@/components/ui/sidebar"

interface LegalDetailsFormProps {
  onPrevious: () => void
  onNext: () => void
}

interface ClinicLegalData {
  vatNumber: string
  crNumber: string
  licenseNumber: string
  termsConditionsUrl: string
  privacyPolicyUrl: string
}

export default function LegalDetailsForm({ onPrevious, onNext }: LegalDetailsFormProps) {
  const [formData, setFormData] = useState<ClinicLegalData>({
    vatNumber: "",
    crNumber: "",
    licenseNumber: "",
    termsConditionsUrl: "",
    privacyPolicyUrl: ""
  })

  const updateFormData = (field: keyof ClinicLegalData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">
      <Sidebar currentStep={3} currentSubStep="legal" planType="clinic" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[#717680] text-sm mb-2">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Contact Details</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#2a2b2a] mb-1">Legal Details</h1>
          <p className="text-[#717680]">Fill in your legal and compliance information</p>
        </div>

        {/* Form */}
        <div className="max-w-4xl space-y-8">
          {/* VAT and CR Numbers Row */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                VAT Number<span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter VAT Number"
                value={formData.vatNumber}
                onChange={(e) => updateFormData('vatNumber', e.target.value)}
                className="bg-white border-[#e4e2dd] text-[#717680]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
                <Scale className="w-4 h-4 inline mr-2" />
                CR Number<span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter Commercial Registration Number"
                value={formData.crNumber}
                onChange={(e) => updateFormData('crNumber', e.target.value)}
                className="bg-white border-[#e4e2dd] text-[#717680]"
              />
            </div>
          </div>

          {/* License Number */}
          <div>
            <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Medical License Number<span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter Medical License Number"
              value={formData.licenseNumber}
              onChange={(e) => updateFormData('licenseNumber', e.target.value)}
              className="bg-white border-[#e4e2dd] text-[#717680]"
            />
            <p className="text-xs text-[#717680] mt-2">
              Enter the official medical license number for this clinic.
            </p>
          </div>

          {/* Terms & Conditions URL */}
          <div>
            <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              Terms & Conditions URL
            </label>
            <Input
              placeholder="https://your-clinic.com/terms"
              value={formData.termsConditionsUrl}
              onChange={(e) => updateFormData('termsConditionsUrl', e.target.value)}
              className="bg-white border-[#e4e2dd] text-[#717680]"
            />
            <p className="text-xs text-[#717680] mt-2">
              URL to your clinic's terms and conditions document.
            </p>
          </div>

          {/* Privacy Policy URL */}
          <div>
            <label className="block text-sm font-medium text-[#2a2b2a] mb-2">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Privacy Policy URL
            </label>
            <Input
              placeholder="https://your-clinic.com/privacy"
              value={formData.privacyPolicyUrl}
              onChange={(e) => updateFormData('privacyPolicyUrl', e.target.value)}
              className="bg-white border-[#e4e2dd] text-[#717680]"
            />
            <p className="text-xs text-[#717680] mt-2">
              URL to your clinic's privacy policy document.
            </p>
          </div>

          {/* Additional Legal Information */}
          <div className="bg-[#e2f6ec] border border-[#00b48d] rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#00b48d] mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-[#2a2b2a] mb-2">Legal Compliance Notice</h3>
                <p className="text-xs text-[#717680] leading-relaxed">
                  Ensure all legal documents comply with local regulations and industry standards. Consider consulting
                  with legal professionals for comprehensive compliance coverage.
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
