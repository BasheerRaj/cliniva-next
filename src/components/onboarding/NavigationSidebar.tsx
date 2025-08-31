'use client';

import { UserCircleIcon } from "lucide-react";
import React from "react";
import { useClivinaTheme } from "@/hooks/useClivinaTheme";

interface StepperItem {
  text: string;
  isActive: boolean;
  isCompleted?: boolean;
  subStep: string;
}

interface StepperStep {
  number: number;
  isActive: boolean;
  isCompleted?: boolean;
  title: string;
  items: StepperItem[];
  dots: number;
}

interface NavigationSidebarProps {
  currentStep?: number;
  currentSubStep?: string;
  planType?: 'company' | 'complex' | 'clinic';
  completedSteps?: string[];
}

// Plan-specific step configurations
const PLAN_STEP_CONFIGS = {
  company: [
    {
      number: 1,
      title: "Company Details",
      items: [
        { text: "Company Overview", subStep: "overview" },
        { text: "Contact Details", subStep: "contact" },
        { text: "Legal Details", subStep: "legal" },
      ],
      dots: 3,
    },
    {
      number: 2,
      title: "Complex Details",
      items: [
        { text: "Complex Overview", subStep: "overview" },
        { text: "Contact Details", subStep: "contact" },
        { text: "Legal Details", subStep: "legal" },
        { text: "Working Schedule", subStep: "schedule" },
      ],
      dots: 4,
    },
    {
      number: 3,
      title: "Clinic Details",
      items: [
        { text: "Clinic Overview", subStep: "overview" },
        { text: "Contact Details", subStep: "contact" },
        { text: "Services & Capacity", subStep: "services" },
        { text: "Working Schedule", subStep: "schedule" },
      ],
      dots: 4,
    },
  ],
  complex: [
    {
      number: 1,
      title: "Complex Details",
      items: [
        { text: "Complex Overview", subStep: "overview" },
        { text: "Contact Details", subStep: "contact" },
        { text: "Legal Details", subStep: "legal" },
        { text: "Working Schedule", subStep: "schedule" },
      ],
      dots: 4,
    },
    {
      number: 2,
      title: "Clinic Details",
      items: [
        { text: "Clinic Overview", subStep: "overview" },
        { text: "Contact Details", subStep: "contact" },
        { text: "Services & Capacity", subStep: "services" },
        { text: "Working Schedule", subStep: "schedule" },
      ],
      dots: 4,
    },
  ],
  clinic: [
    {
      number: 1,
      title: "Clinic Details",
      items: [
        { text: "Clinic Overview", subStep: "overview" },
        { text: "Contact Details", subStep: "contact" },
        { text: "Services & Capacity", subStep: "services" },
        { text: "Legal Details", subStep: "legal" },
        { text: "Working Schedule", subStep: "schedule" },
      ],
      dots: 5,
    },
  ],
};

export const NavigationSidebar = ({
  currentStep = 1,
  currentSubStep = 'overview',
  planType = 'company',
  completedSteps = []
}: NavigationSidebarProps): React.JSX.Element => {
  const { colors } = useClivinaTheme();
  
  const stepperData = PLAN_STEP_CONFIGS[planType] || PLAN_STEP_CONFIGS.company;

  // Generate stepper data with dynamic state
  const generateStepperData = (): StepperStep[] => {
    return stepperData.map((stepConfig, stepIndex) => {
      const isCurrentStep = stepConfig.number === currentStep;
      const isCompletedStep = completedSteps.includes(`step-${stepConfig.number}`);
      const isPastStep = stepConfig.number < currentStep;

      return {
        number: stepConfig.number,
        isActive: isCurrentStep,
        isCompleted: isCompletedStep || isPastStep,
        title: stepConfig.title,
        dots: stepConfig.dots,
        items: stepConfig.items.map((item) => {
          const isActiveItem = isCurrentStep && item.subStep === currentSubStep;
          const isCompletedItem = completedSteps.includes(`step-${stepConfig.number}-${item.subStep}`);
          const isPastItem = isPastStep || (isCurrentStep && shouldMarkAsPrevious(item.subStep, currentSubStep));

          return {
            text: item.text,
            isActive: isActiveItem,
            isCompleted: isCompletedItem || isPastItem,
            subStep: item.subStep,
          };
        }),
      };
    });
  };

  // Helper function to determine if a substep should be marked as previous
  const shouldMarkAsPrevious = (itemSubStep: string, currentSubStep: string): boolean => {
    const subStepOrder = ['overview', 'contact', 'legal', 'services', 'schedule'];
    const itemIndex = subStepOrder.indexOf(itemSubStep);
    const currentIndex = subStepOrder.indexOf(currentSubStep);
    return itemIndex < currentIndex;
  };

  const dynamicStepperData = generateStepperData();

  return (
    <nav className="w-[280px] bg-card border-r border-border min-h-screen">
      <header className="flex flex-col items-start gap-2.5 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <img
            className="h-8 w-auto"
            alt="Cliniva Logo"
            src="/assets/cliniva-logo.svg"
          />
        </div>
      </header>

      <div className="flex flex-col items-start gap-6 px-6 py-8">
        <div className="flex items-center gap-3">
          <UserCircleIcon className="w-6 h-6" style={{ color: colors.primary.default }} />
          <div className="font-semibold text-foreground text-sm">
            Account Setup
          </div>
        </div>

        <div className="flex items-start gap-4 w-full">
          {/* Vertical Progress Bar (Bill) */}
          <div className="flex flex-col items-center pt-4">
            <div 
              className="flex flex-col items-center px-3 py-4 rounded-full"
              style={{ backgroundColor: colors.background.secondary }}
            >
              {dynamicStepperData.map((step, stepIndex) => (
                <div key={step.number} className="flex flex-col items-center">
                  {/* Step Number Circle */}
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{
                      backgroundColor: step.isCompleted ? colors.primary.default : step.isActive ? colors.primary.default : colors.text.tertiary,
                      color: '#FFFFFF',
                      marginBottom: '12px'
                    }}
                  >
                    {step.isCompleted ? "✓" : step.number}
                  </div>
                  
                  {/* Connecting Dots */}
                  {step.items.map((_, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: step.isCompleted ? colors.primary.default : (step.isActive && itemIndex === 0) ? colors.primary.default : colors.text.tertiary,
                        marginBottom: itemIndex < step.items.length - 1 ? '24px' : stepIndex < dynamicStepperData.length - 1 ? '32px' : '0px'
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="flex flex-col gap-6 flex-1">
            {dynamicStepperData.map((step, stepIndex) => (
              <div key={step.number} className={stepIndex < dynamicStepperData.length - 1 ? "mb-6" : ""}>
                {/* Step Title Row */}
                <div className="flex items-center" style={{ height: '24px' }}>
                  <h3 
                    className="font-medium text-sm"
                    style={{ color: step.isActive || step.isCompleted ? colors.text.primary : colors.text.secondary }}
                  >
                    Fill in {step.title}
                  </h3>
                </div>
          
                {/* Step Items */}
                <div className="flex flex-col gap-6 pt-3">
                  {step.items.map((item) => (
                    <div key={item.subStep} className="flex items-center" style={{ height: '10px' }}>
                      <span 
                        className="text-xs"
                        style={{
                          color: item.isCompleted ? colors.primary.default : item.isActive ? colors.primary.default : colors.text.secondary,
                          fontWeight: item.isActive ? '600' : '400'
                        }}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </nav>
  );
};
