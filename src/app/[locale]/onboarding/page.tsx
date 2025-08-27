'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRightIcon, CheckIcon, UserPlusIcon, SettingsIcon, HeartHandshakeIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { SkipButton } from '@/components/onboarding/SkipButton';

const features = [
  {
    icon: UserPlusIcon,
    title: 'Easy Setup',
    description: 'Get started in minutes with our guided onboarding process'
  },
  {
    icon: SettingsIcon,
    title: 'Customizable',
    description: 'Tailor your setup based on your organization type and needs'
  },
  {
    icon: HeartHandshakeIcon,
    title: 'Healthcare Focused',
    description: 'Built specifically for healthcare organizations and complexes'
  }
];

const planTypes = [
  {
    name: 'Company',
    description: 'For healthcare organizations with multiple complexes',
    benefits: ['Multi-complex management', 'Organization-wide reporting', 'Centralized administration']
  },
  {
    name: 'Complex',
    description: 'For healthcare complexes with multiple clinics',
    benefits: ['Multi-clinic management', 'Complex-wide scheduling', 'Department organization']
  },
  {
    name: 'Clinic',
    description: 'For individual clinics and practices',
    benefits: ['Patient management', 'Appointment scheduling', 'Staff coordination']
  }
];

export default function OnboardingLandingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const handleGetStarted = () => {
    router.push(`/${locale}/onboarding/plan-selection`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Skip Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <SkipButton 
          size="sm" 
          variant="ghost"
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
          onSkip={() => {
            router.push('/dashboard');
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              className="w-10 h-10"
              alt="Cliniva Logo"
              src="/symbol.svg"
            />
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Cliniva
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete healthcare management system designed to streamline your operations
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <feature.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Plan Types Preview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Choose Your Organization Type</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {planTypes.map((plan, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <h3 className="text-xl font-semibold text-center">{plan.name}</h3>
                  <p className="text-gray-600 text-center text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {plan.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start gap-2">
                        <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="border-0 shadow-2xl bg-white max-w-md mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-gray-600 mb-6">
                Set up your healthcare management system in just a few easy steps
              </p>
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Get Started
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                No credit card required • Free setup
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 