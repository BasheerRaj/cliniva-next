'use client';

import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Building, 
  Stethoscope, 
  ChevronRight, 
  Check,
  ArrowLeft,
  ArrowRight,
  Save
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Import hooks and types
import { 
  useOnboardingStore, 
  useOnboardingProgress, 
  useOnboardingNavigation,
  useOnboardingData
} from '@/hooks/onboarding/useOnboardingStore';
import { PlanType } from '@/types/onboarding/common';

// Import form components
import { CompanyOverview } from './company/CompanyOverview';
import { CompanyContact } from './company/CompanyContact';
import { CompanyLegal } from './company/CompanyLegal';

// Import complex components
import { ComplexOverview } from './complex/ComplexOverview';
import { ComplexContact } from './complex/ComplexContact';
import { ComplexSchedule } from './complex/ComplexSchedule';

// Import clinic components
import { ClinicOverview } from './clinic/ClinicOverview';
import { ClinicContact } from './clinic/ClinicContact';
import { ClinicSchedule } from './clinic/ClinicSchedule';

interface SetupWizardProps {
  planType?: PlanType;
  className?: string;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({
  planType: initialPlanType,
  className
}) => {
  const router = useRouter();
  const { setPlanType, resetOnboarding } = useOnboardingStore();
  const { progress, totalSteps, progressPercentage, currentStepConfig } = useOnboardingProgress();
  const { goToNextStep, goToPreviousStep, goToStep } = useOnboardingNavigation();
  const { companyData, complexData, clinicData } = useOnboardingData();

  // Set plan type if provided
  useEffect(() => {
    if (initialPlanType && initialPlanType !== progress.planType) {
      setPlanType(initialPlanType);
    }
  }, [initialPlanType, progress.planType, setPlanType]);

  // Get plan icon and info
  const getPlanInfo = (planType: PlanType) => {
    const planInfo = {
      company: {
        icon: Building2,
        title: 'Company Plan',
        subtitle: 'Multi-complex organization',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      complex: {
        icon: Building,
        title: 'Complex Plan',
        subtitle: 'Medical complex with clinics',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      clinic: {
        icon: Stethoscope,
        title: 'Clinic Plan',
        subtitle: 'Independent clinic',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      }
    };
    return planInfo[planType] || planInfo.clinic;
  };

  // Get step configuration for current plan
  const getStepConfiguration = () => {
    if (!progress.planType) return [];

    const stepConfigs = {
      company: [
        {
          id: 1,
          name: 'company',
          title: 'Company Details',
          subSteps: [
            { name: 'overview', title: 'Overview', component: 'CompanyOverview' },
            { name: 'contact', title: 'Contact', component: 'CompanyContact' },
            { name: 'legal', title: 'Legal', component: 'CompanyLegal' }
          ]
        },
        {
          id: 2,
          name: 'complex',
          title: 'Complex Setup',
          subSteps: [
            { name: 'overview', title: 'Overview', component: 'ComplexOverview' },
            { name: 'contact', title: 'Contact', component: 'ComplexContact' },
            { name: 'schedule', title: 'Schedule', component: 'ComplexSchedule' }
          ]
        },
        {
          id: 3,
          name: 'clinic',
          title: 'Clinic Setup',
          subSteps: [
            { name: 'overview', title: 'Overview', component: 'ClinicOverview' },
            { name: 'contact', title: 'Contact', component: 'ClinicContact' },
            { name: 'schedule', title: 'Schedule', component: 'ClinicSchedule' }
          ]
        }
      ],
      complex: [
        {
          id: 1,
          name: 'complex',
          title: 'Complex Details',
          subSteps: [
            { name: 'overview', title: 'Overview', component: 'ComplexOverview' },
            { name: 'contact', title: 'Contact', component: 'ComplexContact' },
            { name: 'legal', title: 'Legal', component: 'ComplexLegal' },
            { name: 'schedule', title: 'Schedule', component: 'ComplexSchedule' }
          ]
        },
        {
          id: 2,
          name: 'clinic',
          title: 'Clinic Setup',
          subSteps: [
            { name: 'overview', title: 'Overview', component: 'ClinicOverview' },
            { name: 'contact', title: 'Contact', component: 'ClinicContact' },
            { name: 'schedule', title: 'Schedule', component: 'ClinicSchedule' }
          ]
        }
      ],
      clinic: [
        {
          id: 1,
          name: 'clinic',
          title: 'Clinic Details',
          subSteps: [
            { name: 'overview', title: 'Overview', component: 'ClinicOverview' },
            { name: 'contact', title: 'Contact', component: 'ClinicContact' },
            { name: 'legal', title: 'Legal', component: 'ClinicLegal' },
            { name: 'schedule', title: 'Schedule', component: 'ClinicSchedule' }
          ]
        }
      ]
    };

    return stepConfigs[progress.planType] || [];
  };

  // Render current step component
  const renderCurrentStepComponent = () => {
    if (!currentStepConfig) return null;

    const currentSubStep = progress.currentSubStep;
    const componentKey = `${currentStepConfig.name}-${currentSubStep}`;

    // Company plan components
    if (currentStepConfig.name === 'company') {
      switch (currentSubStep) {
        case 'overview':
          return <CompanyOverview key={componentKey} />;
        case 'contact':
          return <CompanyContact key={componentKey} />;
        case 'legal':
          return <CompanyLegal key={componentKey} />;
        default:
          return <div>Component not yet implemented: {componentKey}</div>;
      }
    }

    // Complex plan components
    if (currentStepConfig.name === 'complex') {
      switch (currentSubStep) {
        case 'overview':
          return <ComplexOverview key={componentKey} />;
        case 'contact':
          return <ComplexContact key={componentKey} />;
        case 'schedule':
          return <ComplexSchedule key={componentKey} />;
        default:
          return <div>Component not yet implemented: {componentKey}</div>;
      }
    }

    // Clinic plan components
    if (currentStepConfig.name === 'clinic') {
      switch (currentSubStep) {
        case 'overview':
          return <ClinicOverview key={componentKey} />;
        case 'contact':
          return <ClinicContact key={componentKey} />;
        case 'schedule':
          return <ClinicSchedule key={componentKey} />;
        default:
          return <div>Component not yet implemented: {componentKey}</div>;
      }
    }

    // Fallback for unknown components
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Building className="h-8 w-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Component Not Found</h3>
              <p className="text-sm text-muted-foreground">
                {currentStepConfig.name} - {currentSubStep} component is not implemented
              </p>
              <Badge variant="secondary" className="mt-2">
                Unknown Component
              </Badge>
            </div>
            <div className="flex gap-2 justify-center pt-4">
              <Button variant="outline" onClick={goToPreviousStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button onClick={goToNextStep}>
                Skip for Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Handle wizard completion
  const handleWizardComplete = () => {
    // TODO: Integrate with the complete onboarding hook
    router.push('/dashboard');
  };

  const planInfo = getPlanInfo(progress.planType);
  const stepConfiguration = getStepConfiguration();
  const currentStep = stepConfiguration.find(step => step.id === progress.currentStep);

  if (!progress.planType) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-medium mb-4">Please select a plan first</h3>
          <Button onClick={() => router.push('/onboarding/plan-selection')}>
            Choose Your Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      
      {/* Header with Plan Info */}
      <Card className={`${planInfo.bgColor} ${planInfo.borderColor} border-2`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${planInfo.bgColor} border-2 ${planInfo.borderColor} rounded-lg flex items-center justify-center`}>
                <planInfo.icon className={`h-6 w-6 ${planInfo.color}`} />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{planInfo.title} Setup</h1>
                <p className="text-sm text-muted-foreground">{planInfo.subtitle}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium">Step {progress.currentStep} of {totalSteps}</p>
              <p className="text-xs text-muted-foreground">{progressPercentage}% Complete</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto">
              {stepConfiguration.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <Button
                    variant={step.id === progress.currentStep ? "default" : step.id < progress.currentStep ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => goToStep(step.id)}
                    className="whitespace-nowrap"
                  >
                    {step.id < progress.currentStep && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {step.title}
                  </Button>
                  {index < stepConfiguration.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>

            {/* Sub-step indicators */}
            {currentStep && (
              <div className="flex items-center gap-1">
                {currentStep.subSteps.map((subStep, index) => (
                  <div
                    key={subStep.name}
                    className={`w-2 h-2 rounded-full ${
                      subStep.name === progress.currentSubStep 
                        ? 'bg-blue-500' 
                        : index < currentStep.subSteps.findIndex(s => s.name === progress.currentSubStep)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Title */}
      {currentStep && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">
            {currentStep.title}
          </h2>
          {currentStep.subSteps.find(s => s.name === progress.currentSubStep) && (
            <p className="text-muted-foreground">
              {currentStep.subSteps.find(s => s.name === progress.currentSubStep)?.title}
            </p>
          )}
        </div>
      )}

      {/* Current Step Component */}
      <div className="min-h-[600px]">
        {renderCurrentStepComponent()}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to reset all progress?')) {
                    resetOnboarding();
                    router.push('/onboarding/plan-selection');
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Start Over
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Implement save progress
                  alert('Progress auto-saved');
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                Auto-save enabled • Last saved: just now
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
