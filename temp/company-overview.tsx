import { ChevronLeft, ChevronDown, Upload, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { colors } from "@/lib/colors"

export default function CompanyDetailsForm() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.light.background.primary }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            className="flex items-center gap-2 text-sm mb-4 hover:opacity-80"
            style={{ color: colors.light.text.secondary }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Choosing Plan Page
          </button>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: colors.light.text.primary }}>
            Fill in Company Details
          </h1>
          <p style={{ color: colors.light.text.secondary }}>Company Overview</p>
        </div>

        {/* Form */}
        <div className="max-w-4xl space-y-8">
          {/* Logo and Company Name Row */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                Logo<span style={{ color: colors.light.state.error }}>*</span>
              </label>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center"
                style={{
                  borderColor: colors.light.border.secondary,
                  backgroundColor: colors.light.background.tertiary,
                }}
              >
                <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: colors.light.text.secondary }} />
                <p className="text-sm mb-1" style={{ color: colors.light.brand.secondary }}>
                  Click or Drag file to this area to upload
                </p>
                <p className="text-xs" style={{ color: colors.light.text.secondary }}>
                  SVG, PNG, JPG or GIF , Maximum file size 2MB.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                  Company Name<span style={{ color: colors.light.state.error }}>*</span>
                </label>
                <Input
                  placeholder="Enter Trade Name"
                  className="bg-white"
                  style={{
                    borderColor: colors.light.border.primary,
                    color: colors.light.text.secondary,
                  }}
                />
              </div>
              <div>
                <Input
                  placeholder="Enter Legal Name"
                  className="bg-white"
                  style={{
                    borderColor: colors.light.border.primary,
                    color: colors.light.text.secondary,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Year of Establishment */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                Year of Establishment
              </label>
              <div className="relative">
                <Input
                  placeholder="Select Date"
                  className="bg-white pr-10"
                  style={{
                    borderColor: colors.light.border.primary,
                    color: colors.light.text.secondary,
                  }}
                />
                <Calendar
                  className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: colors.light.text.secondary }}
                />
              </div>
            </div>
          </div>

          {/* Company Overview Section */}
          <Card className="bg-white" style={{ borderColor: colors.light.border.primary }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium" style={{ color: colors.light.text.primary }}>
                  Company Overview
                </h3>
                <ChevronDown className="w-5 h-5" style={{ color: colors.light.text.secondary }} />
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                    Overview
                  </label>
                  <Textarea
                    placeholder="Enter Overview"
                    className="bg-white min-h-[100px] resize-none"
                    style={{
                      borderColor: colors.light.border.primary,
                      color: colors.light.text.secondary,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                    Vision
                  </label>
                  <Textarea
                    placeholder="Enter Vision"
                    className="bg-white min-h-[100px] resize-none"
                    style={{
                      borderColor: colors.light.border.primary,
                      color: colors.light.text.secondary,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                    Goals
                  </label>
                  <Textarea
                    placeholder="Enter Goals"
                    className="bg-white min-h-[100px] resize-none"
                    style={{
                      borderColor: colors.light.border.primary,
                      color: colors.light.text.secondary,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.light.text.primary }}>
                    CEO Name<span style={{ color: colors.light.state.error }}>*</span>
                  </label>
                  <Input
                    placeholder="Enter Name"
                    className="bg-white"
                    style={{
                      borderColor: colors.light.border.primary,
                      color: colors.light.text.secondary,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center mt-12 max-w-4xl">
          <Button
            variant="outline"
            className="px-8 py-2 bg-transparent hover:opacity-80"
            style={{
              borderColor: colors.light.border.secondary,
              color: colors.light.text.secondary,
            }}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            className="px-8 py-2 text-white hover:opacity-90"
            style={{
              backgroundColor: colors.light.brand.primary,
            }}
          >
            Next
            <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  )
}
