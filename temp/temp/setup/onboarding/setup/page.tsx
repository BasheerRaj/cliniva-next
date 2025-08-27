'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Building, 
  Stethoscope, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Info,
  Calendar,
  MapPin,
  Phone
} from 'lucide-react';
import { useOnboardingStore } from '@/hooks/onboarding/useOnboardingStore';
import { StepperNavigation } from '@/components/onboarding/StepperNavigation';
import { OnboardingLayout } from '@/components/onboarding/layout/OnboardingLayout';
import { SummaryView } from '@/components/onboarding/shared/SummaryView';

export default function SetupPage() {
  const router = useRouter();
  const {
    planType,
    progress,
    companyData,
    complexData,
    clinicData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    markStepCompleted,
    updateCompanyData,
    updateComplexData,
    updateClinicData,
    getTotalSteps,
    getProgressPercentage
  } = useOnboardingStore();

  const [isLoading, setIsLoading] = useState(false);
  const [currentStepContent, setCurrentStepContent] = useState<string>('');

  // Redirect if no plan selected
  useEffect(() => {
    if (!planType) {
      router.push('/onboarding/plan-selection');
      return;
    }
  }, [planType, router]);

  const totalSteps = getTotalSteps();
  const progressPercentage = getProgressPercentage();

  const getPlanIcon = () => {
    switch (planType) {
      case 'company': return Building2;
      case 'complex': return Building;
      case 'clinic': return Stethoscope;
      default: return Building2;
    }
  };

  const getPlanName = () => {
    switch (planType) {
      case 'company': return 'Company Plan';
      case 'complex': return 'Complex Plan';
      case 'clinic': return 'Clinic Plan';
      default: return 'Unknown Plan';
    }
  };

  const getCurrentStepInfo = () => {
    const { currentStep, currentSubStep } = progress;
    
    switch (planType) {
      case 'company':
        if (currentStep === 1) {
          switch (currentSubStep) {
            case 'overview': return { title: 'Company Overview', description: 'Basic company information and details' };
            case 'contact': return { title: 'Company Contact', description: 'Contact information and location' };
            case 'legal': return { title: 'Company Legal', description: 'Legal information and documentation' };
          }
        } else if (currentStep === 2) {
          switch (currentSubStep) {
            case 'overview': return { title: 'Complex Overview', description: 'Medical complex information' };
            case 'contact': return { title: 'Complex Contact', description: 'Complex contact details' };
            case 'schedule': return { title: 'Complex Schedule', description: 'Working hours and availability' };
          }
        } else if (currentStep === 3) {
          switch (currentSubStep) {
            case 'overview': return { title: 'Clinic Overview', description: 'Clinic information and services' };
            case 'contact': return { title: 'Clinic Contact', description: 'Clinic contact details' };
            case 'schedule': return { title: 'Clinic Schedule', description: 'Clinic working hours' };
          }
        }
        break;
      
      case 'complex':
        if (currentStep === 1) {
          switch (currentSubStep) {
            case 'overview': return { title: 'Complex Overview', description: 'Complex information and departments' };
            case 'contact': return { title: 'Complex Contact', description: 'Contact details and location' };
            case 'legal': return { title: 'Complex Legal', description: 'Legal information' };
            case 'schedule': return { title: 'Complex Schedule', description: 'Working hours' };
          }
        } else if (currentStep === 2) {
          switch (currentSubStep) {
            case 'overview': return { title: 'Clinic Overview', description: 'Clinic information and services' };
            case 'contact': return { title: 'Clinic Contact', description: 'Clinic contact details' };
            case 'schedule': return { title: 'Clinic Schedule', description: 'Clinic working hours' };
          }
        }
        break;
      
      case 'clinic':
        if (currentStep === 1) {
          switch (currentSubStep) {
            case 'overview': return { title: 'Clinic Overview', description: 'Clinic information and services' };
            case 'contact': return { title: 'Clinic Contact', description: 'Contact details and location' };
            case 'legal': return { title: 'Clinic Legal', description: 'Legal information' };
            case 'schedule': return { title: 'Clinic Schedule', description: 'Working hours' };
          }
        }
        break;
    }
    
    return { title: 'Setup Complete', description: 'Review and finalize your configuration' };
  };

  const handleNext = async () => {
    setIsLoading(true);
    
    try {
      // Simulate form saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark current step as completed
      const { currentStep, currentSubStep } = progress;
      const stepKey = `${planType}-${currentStep}-${currentSubStep}`;
      markStepCompleted(stepKey);
      
      // Add some sample data based on current step
      if (currentStep === 1 && currentSubStep === 'overview') {
        if (planType === 'company') {
          updateCompanyData({
            overview: {
              tradeName: 'HealthCare Solutions Inc.',
              legalName: 'HealthCare Solutions Incorporated',
              yearEstablished: 2010,
              overview: 'Leading healthcare provider',
              vision: 'To provide exceptional healthcare',
              goals: 'Expand our services and improve patient care',
              ceoName: 'Dr. Sarah Johnson'
            }
          });
        }
      }
      
      goToNextStep();
    } catch (error) {
      console.error('Error saving step:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    goToPreviousStep();
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Simulate final submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to success page or dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isLastStep = () => {
    return progress.currentStep === totalSteps && getCurrentStepInfo().title === 'Setup Complete';
  };

  const stepInfo = getCurrentStepInfo();
  const PlanIcon = getPlanIcon();

  if (!planType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show summary if at the end
  if (isLastStep()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <SummaryView
            planType={planType}
            companyData={companyData}
            complexData={complexData}
            clinicData={clinicData}
            onEdit={(section) => {
              // Navigate back to specific section
              if (section === 'company') goToStep(1, 'overview');
              if (section === 'complex') goToStep(2, 'overview');
              if (section === 'clinic') goToStep(3, 'overview');
            }}
            onSubmit={handleFinalSubmit}
            isSubmitting={isLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar with Stepper */}
      <StepperNavigation variant="sidebar" />
      
      {/* Main Content */}
      <div className="flex-1">
        <OnboardingLayout
          title={stepInfo.title}
          description={stepInfo.description}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isLoading={isLoading}
          showProgress={false} // Using sidebar stepper instead
          showHeader={true}
          showNavigation={true}
          nextButtonText={isLastStep() ? "Complete Setup" : "Continue"}
        >
          <div className="space-y-6">
            {/* Plan Info */}
            <Alert>
              <PlanIcon className="h-4 w-4" />
              <AlertDescription>
                You're setting up the <strong>{getPlanName()}</strong>. 
                Progress: {Math.round(progressPercentage)}% complete
              </AlertDescription>
            </Alert>

            {/* Step Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <PlanIcon className="w-5 h-5" />
                    {stepInfo.title}
                  </CardTitle>
                  <Badge variant="outline">
                    Step {progress.currentStep} of {totalSteps}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {stepInfo.title.includes('Overview') && <Building2 className="w-8 h-8 text-gray-600" />}
                    {stepInfo.title.includes('Contact') && <Phone className="w-8 h-8 text-gray-600" />}
                    {stepInfo.title.includes('Legal') && <CheckCircle className="w-8 h-8 text-gray-600" />}
                    {stepInfo.title.includes('Schedule') && <Calendar className="w-8 h-8 text-gray-600" />}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {stepInfo.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {stepInfo.description}
                  </p>
                  
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <Info className="w-4 h-4 inline mr-1" />
                        This is a demo step. In the full implementation, this would contain 
                        the actual form fields for {stepInfo.title.toLowerCase()}.
                      </p>
                    </div>
                    
                    <div className="text-left space-y-2 text-sm text-gray-600">
                      <p>• Form validation with Yup schemas</p>
                      <p>• Real-time field validation</p>
                      <p>• Auto-save progress to Zustand store</p>
                      <p>• Professional UI components</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sample Data Preview */}
            {(companyData.overview || complexData.overview || clinicData.overview) && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Sample Data Added
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-green-700">
                    {companyData.overview && (
                      <p>Company: {companyData.overview.tradeName}</p>
                    )}
                    {complexData.overview && (
                      <p>Complex: {complexData.overview.name}</p>
                    )}
                    {clinicData.overview && (
                      <p>Clinic: {clinicData.overview.name}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </OnboardingLayout>
      </div>
    </div>
  );
} 