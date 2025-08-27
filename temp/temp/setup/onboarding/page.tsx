"use client"

import React from 'react'
import { OnboardingFlow, OnboardingData } from '@/components/onboarding'

export default function OnboardingPage() {
  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log('Onboarding completed with data:', data)
    
    // Here you would typically:
    // 1. Send the data to your backend APIs
    // 2. Create organization, complex, and clinic records
    // 3. Redirect to the dashboard or next step
    
    // Example API calls (implement these in your API service):
    // if (data.company) {
    //   await createOrganization(data.company)
    // }
    // if (data.complex) {
    //   await createComplex(data.complex)
    // }
    // if (data.clinic) {
    //   await createClinic(data.clinic)
    // }
    
    alert('Onboarding completed successfully! Check console for data.')
  }

  const handleBack = () => {
    // Navigate back to plan selection or previous page
    console.log('Going back to plan selection')
    window.history.back()
  }

  return (
    <OnboardingFlow
      subscriptionId="example-subscription-id"
      onComplete={handleOnboardingComplete}
      onBack={handleBack}
    />
  )
}