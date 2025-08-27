'use client';

import { UserCircleIcon } from "lucide-react";
import React from "react";

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
        { text: "Working Schedule", subStep: "schedule" },
      ],
      dots: 3,
    },
    {
      number: 3,
      title: "Clinic Details",
      items: [
        { text: "Clinic Overview", subStep: "overview" },
        { text: "Services & Capacity", subStep: "services" },
        { text: "Working Schedule", subStep: "schedule" },
      ],
      dots: 3,
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
        { text: "Services & Capacity", subStep: "services" },
        { text: "Working Schedule", subStep: "schedule" },
      ],
      dots: 3,
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
    <nav className="w-[280px] bg-white border-r border-gray-200 min-h-screen">
      <header className="flex flex-col items-start gap-2.5 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img
            className="w-8 h-8"
            alt="Cliniva Logo"
            src="/symbol.svg"
          />
          <div className="font-semibold text-[#2a2b2a] text-xl">
            Cliniva
          </div>
        </div>
      </header>

      <div className="flex flex-col items-start gap-6 px-6 py-8">
        <div className="flex items-center gap-3">
          <UserCircleIcon className="w-6 h-6 text-[#69a3e9]" />
          <div className="font-semibold text-gray-800 text-sm">
            Account Setup
          </div>
        </div>

        <div className="flex items-start gap-4 w-full">
          {/* Progress Line */}
          <div className="flex flex-col w-8 items-center gap-6 pt-2">
            {dynamicStepperData.map((step, stepIndex) => (
              <div key={step.number} className="flex flex-col items-center gap-3">
                {/* Step Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.isCompleted 
                    ? "bg-green-500 text-white" 
                    : step.isActive 
                      ? "bg-[#69a3e9] text-white" 
                      : "bg-gray-200 text-gray-600"
                }`}>
                  {step.isCompleted ? "✓" : step.number}
                </div>

                {/* Dots between steps */}
                {stepIndex < dynamicStepperData.length - 1 && (
                  <div className="flex flex-col items-center gap-2">
                    {Array.from({ length: step.dots }).map((_, dotIndex) => (
                      <div
                        key={dotIndex}
                        className={`w-2 h-2 rounded-full ${
                          step.isCompleted 
                            ? "bg-green-300" 
                            : (dotIndex === 0 && step.isActive) 
                              ? "bg-[#69a3e9]" 
                              : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="flex flex-col gap-8 flex-1">
            {dynamicStepperData.map((step) => (
              <section key={step.number} className="flex flex-col gap-3">
                <h3 className="font-medium text-gray-800 text-sm">
                  {step.title}
                </h3>
                <div className="flex flex-col gap-2">
                  {step.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3">
                      <div className={`text-sm ${
                        item.isCompleted 
                          ? "text-green-600 font-medium" 
                          : item.isActive 
                            ? "text-[#69a3e9] font-semibold" 
                            : "text-gray-500"
                      }`}>
                        {item.isCompleted && "✓ "}
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Type Indicator */}
      <div className="absolute bottom-6 left-6 bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-200">
        <div className="text-xs text-blue-600 font-medium">Plan Type</div>
        <div className="text-sm font-semibold capitalize text-blue-800">
          {planType}
        </div>
        <div className="text-xs text-blue-500 mt-1">
          Step {currentStep} of {dynamicStepperData.length}
        </div>
      </div>
    </nav>
  );
};
