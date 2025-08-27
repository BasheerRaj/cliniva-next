"use client"

import { useState } from "react"
import { ChevronLeft, ChevronDown, Plus, Linkedin, Facebook, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CompanyDetailsForm() {
  const [phoneNumber, setPhoneNumber] = useState("+966 50 000-0000")
  const [email, setEmail] = useState("")
  const [website, setWebsite] = useState("")
  const [buildingNumber, setBuildingNumber] = useState("")
  const [streetName, setStreetName] = useState("")
  const [region, setRegion] = useState("")
  const [country, setCountry] = useState("")
  const [nation, setNation] = useState("")
  const [googleMapsLocation, setGoogleMapsLocation] = useState("")
  const [linkedinAccount, setLinkedinAccount] = useState("")
  const [twitterAccount, setTwitterAccount] = useState("")
  const [facebookAccount, setFacebookAccount] = useState("")
  const [instagramAccount, setInstagramAccount] = useState("")

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-[#e5e7eb] p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-[#00b48d] rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-xl font-semibold text-[#2a2b2a]">Cliniva SYS</span>
        </div>

        {/* Account Setup */}
        <div className="mb-8">
          <div className="flex items-center gap-3 text-[#00b48d] font-medium">
            <div className="w-6 h-6 bg-[#00b48d] rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            Account Setup
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {/* Step 1 - Active */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#00b48d] rounded-full flex items-center justify-center text-white text-sm font-medium">
                1
              </div>
              <span className="font-medium text-[#2a2b2a]">Fill in Company Details</span>
            </div>
            <div className="ml-9 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00b48d] rounded-full"></div>
                <span className="text-sm text-[#00b48d] font-medium">Company Overview</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#69a3e9] rounded-full"></div>
                <span className="text-sm text-[#69a3e9] font-medium">Contact Details</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#b8b1a9] rounded-full"></div>
                <span className="text-sm text-[#6b7280]">Legal Details</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#b8b1a9] rounded-full flex items-center justify-center text-white text-sm font-medium">
                2
              </div>
              <span className="text-[#6b7280]">Fill in Complex Details</span>
            </div>
            <div className="ml-9 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#b8b1a9] rounded-full"></div>
                <span className="text-sm text-[#6b7280]">Complex Overview</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#b8b1a9] rounded-full"></div>
                <span className="text-sm text-[#6b7280]">Contact Details</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#b8b1a9] rounded-full"></div>
                <span className="text-sm text-[#6b7280]">Working Schedule</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#b8b1a9] rounded-full flex items-center justify-center text-white text-sm font-medium">
                3
              </div>
              <span className="text-[#6b7280]">Fill in Clinic Details</span>
            </div>
            <div className="ml-9 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#b8b1a9] rounded-full"></div>
                <span className="text-sm text-[#6b7280]">Clinic Overview</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#b8b1a9] rounded-full"></div>
                <span className="text-sm text-[#6b7280]">Working Schedule</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <button className="flex items-center gap-2 text-[#6b7280] hover:text-[#2a2b2a] mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back to Choosing Plan Page
          </button>
          <h1 className="text-2xl font-semibold text-[#2a2b2a] mb-2">Fill in Company Details</h1>
          <p className="text-[#6b7280]">Contact Details</p>
        </div>

        {/* Form */}
        <div className="max-w-4xl space-y-8">
          {/* Phone and Email Row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[#2a2b2a] font-medium">Phone Number</Label>
              <div className="flex">
                <div className="flex items-center gap-2 px-3 py-2 border border-r-0 border-[#e5e7eb] rounded-l-md bg-white">
                  <div className="w-5 h-5 bg-[#00b48d] rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">SA</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#6b7280]" />
                </div>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="rounded-l-none border-l-0 focus:ring-0 focus:border-[#00b48d]"
                />
              </div>
              <button className="flex items-center justify-center w-8 h-8 border-2 border-dashed border-[#00b48d] rounded-md text-[#00b48d] hover:bg-[#00b48d] hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <Label className="text-[#2a2b2a] font-medium">Email</Label>
              <Input
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus:border-[#00b48d] focus:ring-0"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label className="text-[#2a2b2a] font-medium">Website</Label>
            <Input
              placeholder="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="max-w-md focus:border-[#00b48d] focus:ring-0"
            />
          </div>

          {/* Physical Address */}
          <div className="space-y-4">
            <Label className="text-[#2a2b2a] font-medium">Physical Address</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Building Number"
                value={buildingNumber}
                onChange={(e) => setBuildingNumber(e.target.value)}
                className="focus:border-[#00b48d] focus:ring-0"
              />
              <Input
                placeholder="Street Name"
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                className="focus:border-[#00b48d] focus:ring-0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="focus:border-[#00b48d] focus:ring-0"
              />
              <Input
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="focus:border-[#00b48d] focus:ring-0"
              />
            </div>
            <Input
              placeholder="Nation"
              value={nation}
              onChange={(e) => setNation(e.target.value)}
              className="max-w-md focus:border-[#00b48d] focus:ring-0"
            />
          </div>

          {/* Google Maps Location */}
          <div className="space-y-2">
            <Label className="text-[#2a2b2a] font-medium">Google Maps Location</Label>
            <Input
              placeholder="Pick Google Maps Location"
              value={googleMapsLocation}
              onChange={(e) => setGoogleMapsLocation(e.target.value)}
              className="max-w-md focus:border-[#00b48d] focus:ring-0"
            />
          </div>

          {/* Social Media Accounts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[#2a2b2a] font-medium">Social Media Accounts</Label>
              <ChevronDown className="w-5 h-5 text-[#6b7280]" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Linkedin className="w-5 h-5 text-[#6b7280]" />
                <span className="text-[#2a2b2a] font-medium min-w-[80px]">LinkedIn</span>
                <Input
                  placeholder="Enter LinkedIn Account"
                  value={linkedinAccount}
                  onChange={(e) => setLinkedinAccount(e.target.value)}
                  className="focus:border-[#00b48d] focus:ring-0"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-[#6b7280]">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-[#2a2b2a] font-medium min-w-[80px]">Twitter</span>
                <Input
                  placeholder="Enter Twitter Account"
                  value={twitterAccount}
                  onChange={(e) => setTwitterAccount(e.target.value)}
                  className="focus:border-[#00b48d] focus:ring-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Facebook className="w-5 h-5 text-[#6b7280]" />
                <span className="text-[#2a2b2a] font-medium min-w-[80px]">Facebook</span>
                <Input
                  placeholder="Enter Facebook Account"
                  value={facebookAccount}
                  onChange={(e) => setFacebookAccount(e.target.value)}
                  className="focus:border-[#00b48d] focus:ring-0"
                />
              </div>
              <div className="flex items-center gap-3">
                <Instagram className="w-5 h-5 text-[#6b7280]" />
                <span className="text-[#2a2b2a] font-medium min-w-[80px]">Instagram</span>
                <Input
                  placeholder="Enter Instagram Account"
                  value={instagramAccount}
                  onChange={(e) => setInstagramAccount(e.target.value)}
                  className="focus:border-[#00b48d] focus:ring-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 max-w-4xl">
          <Button
            variant="outline"
            className="px-8 py-2 border-[#e5e7eb] text-[#6b7280] hover:bg-[#f6f6f7] bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button className="px-8 py-2 bg-[#00b48d] hover:bg-[#006c35] text-white">
            Next
            <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
