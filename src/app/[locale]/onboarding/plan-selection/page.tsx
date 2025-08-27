'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { PlanType } from '@/types/onboarding/common';
import { useSubscriptionPlans, SubscriptionPlan } from '@/hooks/api/useSubscriptionPlans';
import { SkipButton } from '@/components/onboarding/SkipButton';

// Fallback plans in case API is not available
const fallbackPlans: SubscriptionPlan[] = [
  {
    _id: '1',
    name: 'Company Plan',
    type: 'company',
    price: 299,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Centralized admin and reporting',
      'Multi-location support', 
      'Role hierarchy across all levels',
      'Advanced analytics',
      'Priority support'
    ],
    limitations: ['Unlimited organizations', 'Up to 50 complexes'],
    isActive: true,
    isPopular: true,
    description: 'Perfect for large healthcare networks managing multiple complexes and locations'
  },
  {
    _id: '2', 
    name: 'Complex Plan',
    type: 'complex',
    price: 149,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Localized administration',
      'Department-based control',
      'Full visibility over all clinics',
      'Staff management',
      'Reporting dashboard'
    ],
    limitations: ['Single complex', 'Up to 10 clinics'],
    isActive: true,
    description: 'Ideal for medical complexes with multiple departments and clinics under one roof'
  },
  {
    _id: '3',
    name: 'Single Clinic Plan', 
    type: 'clinic',
    price: 49,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Minimal setup',
      'Quick onboarding',
      'Direct management by clinic owner',
      'Basic reporting',
      'Patient management'
    ],
    limitations: ['Single clinic only', 'Up to 3 staff members'],
    isActive: true,
    description: 'Simple and affordable solution for independent clinics and small practices'
  }
];

export default function PlanSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  
  // Fetch plans from API
  const { data: plansData, isLoading, error, isError } = useSubscriptionPlans();

  // Transform API data to match our component structure
  const transformPlan = (plan: SubscriptionPlan) => ({
    id: plan.type as PlanType,
    _id: plan._id, // Include the database ID for API calls
    title: `${plan.name}`,
    description: plan.description || getDefaultDescription(plan.type),
    features: plan.features || getDefaultFeatures(plan.type),
    price: plan.price,
    currency: plan.currency,
    billingPeriod: plan.billingPeriod,
    isPopular: plan.isPopular,
    limitations: plan.limitations,
  });

  // Default descriptions for fallback
  const getDefaultDescription = (type: string) => {
    const descriptions = {
      company: "Manage a network of multiple medical complexes, each with its own departments and clinics",
      complex: "Manage a single complex that contains various departments and clinics under one roof", 
      clinic: "A simplified setup for managing one independent clinic with no additional branches or departments"
    };
    return descriptions[type as keyof typeof descriptions] || "Professional healthcare management solution";
  };

  // Default features for fallback
  const getDefaultFeatures = (type: string) => {
    const features = {
      company: ["Centralized admin and reporting", "Multi-location support", "Role hierarchy across all levels"],
      complex: ["Localized administration", "Department-based control", "Full visibility over all clinics"],
      clinic: ["Minimal setup", "Quick onboarding", "Direct management by the clinic owner or manager"]
    };
    return features[type as keyof typeof features] || ["Professional features", "24/7 support", "Secure platform"];
  };

  // Use API data if available, otherwise fallback to hardcoded plans
  const rawPlans = plansData?.length ? plansData : (isError ? fallbackPlans : []);
  const plans = rawPlans.filter(plan => plan.isActive).map(transformPlan);

  const handlePlanSelect = (planType: PlanType) => {
    setSelectedPlan(planType);
    
    // Store plan selection in sessionStorage for later use
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedPlanType', planType);
      
      // Also store the full plan data for reference
      const selectedPlanData = plans.find(p => p.id === planType);
      if (selectedPlanData) {
        sessionStorage.setItem('selectedPlanData', JSON.stringify(selectedPlanData));
      }
    }
    
    // Navigate to owner registration with selected plan
    router.push(`/onboarding/register?planType=${planType}&planId=${plans.find(p => p.id === planType)?._id || ''}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-48 h-48 opacity-30">
          <div className="w-full h-full bg-[#e2f6ec] rounded-br-full transform -translate-x-12 -translate-y-12"></div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-30">
          <div className="w-full h-full bg-[#e1edfb] rounded-bl-full transform translate-x-8 -translate-y-8"></div>
        </div>

        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#00b48d] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#414651] mb-2">Loading Plans...</h2>
            <p className="text-[#717680]">Please wait while we fetch your subscription options</p>
          </div>
        </div>
      </div>
    );
  }

  // Show fallback notice if using fallback data
  const showFallbackNotice = isError && plans.length > 0;

  return (
    <div className="min-h-screen bg-[#fafaf8] relative overflow-hidden">
      {/* Skip Button - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <SkipButton 
          size="sm" 
          variant="outline"
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
          onSkip={() => {
            router.push('/dashboard');
          }}
        />
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-48 h-48 opacity-30">
        <div className="w-full h-full bg-[#e2f6ec] rounded-br-full transform -translate-x-12 -translate-y-12"></div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-30">
        <div className="w-full h-full bg-[#e1edfb] rounded-bl-full transform translate-x-8 -translate-y-8"></div>
      </div>

      <div className="container mx-auto px-6 py-16">
        {/* Fallback notice */}
        {showFallbackNotice && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 inline-block mr-2" />
              <span className="text-amber-800 text-sm">
                Unable to load plans from server. Showing sample plans for demonstration.
              </span>
            </div>
          </div>
        )}

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#69a3e9] mb-6">
            Choose Your Operational Structure
          </h1>
          <p className="text-[#717680] text-lg max-w-2xl mx-auto">
            Select the plan that best fits your healthcare organization's needs
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#414651] mb-2">No Plans Available</h2>
            <p className="text-[#717680] mb-6">We couldn't load any subscription plans. Please try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#00b48d] hover:bg-[#00a080] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Reload Page
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`bg-[#ffffff] rounded-2xl border-2 p-8 flex flex-col h-full transition-all duration-200 hover:shadow-lg relative ${
                  selectedPlan === plan.id 
                    ? 'border-[#69a3e9] shadow-lg scale-105' 
                    : 'border-[#00b48d] hover:border-[#69a3e9]'
                }`}
              >
                {/* Popular badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#69a3e9] text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-[#414651]">{plan.title}</h2>
                    {plan.price !== undefined && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#00b48d]">
                          {plan.currency === 'USD' ? '$' : ''}
                          {plan.price}
                        </div>
                        <div className="text-sm text-[#717680]">
                          /{plan.billingPeriod || 'month'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-[#717680] mb-8 leading-relaxed">{plan.description}</p>

                  <div className="border-t border-[#e2f6ec] pt-6 mb-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 bg-[#00b48d] rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-[#5a5a5a] leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Limitations */}
                    {plan.limitations && plan.limitations.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-[#f0f0f0]">
                        <h4 className="text-sm font-semibold text-[#717680] mb-2">Includes:</h4>
                        <ul className="space-y-1">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="text-xs text-[#717680]">
                              • {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 ${
                    plan.isPopular 
                      ? 'bg-[#69a3e9] hover:bg-[#5a91d4] text-white'
                      : 'bg-[#00b48d] hover:bg-[#00a080] text-white'
                  }`}
                >
                  Choose this plan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Back button */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.back()}
            className="text-[#717680] hover:text-[#414651] font-medium transition-colors duration-200"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
} 