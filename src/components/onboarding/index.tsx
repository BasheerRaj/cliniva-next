export { OrganizationOverviewForm } from './OrganizationOverviewForm';
export { OrganizationContactForm } from './OrganizationContactForm';  
export { OrganizationLegalForm } from './OrganizationLegalForm';
export { ComplexOverviewForm } from './forms/ComplexOverviewForm';
export { default as ComplexWorkingHoursForm } from './ComplexWorkingHoursForm';

// Export the new Complex forms
export { ComplexContactForm } from './forms/ComplexContactForm';
export { ComplexLegalForm } from './forms/ComplexLegalForm';

// Export all Company forms 
export { CompanyOverviewForm } from './forms/CompanyOverviewForm';
export { CompanyContactForm } from './forms/CompanyContactForm';
export { CompanyLegalForm } from './forms/CompanyLegalForm';

// Export all Clinic forms
export { ClinicOverviewForm } from './forms/ClinicOverviewForm';
export { ClinicContactForm } from './forms/ClinicContactForm';
export { ClinicServicesCapacityForm } from './forms/ClinicServicesCapacityForm';
export { ClinicLegalForm } from './forms/ClinicLegalForm';
export { ClinicScheduleForm } from './forms/ClinicScheduleForm';

// Export OnboardingData type (from hooks where it's defined)
export type { OnboardingData } from '@/hooks/useRegister';

// Create a simple placeholder OnboardingFlow since the complex one has dependency issues
export function OnboardingFlow({ subscriptionId, planType, onComplete, onBack }: {
  subscriptionId: string;
  planType: string;
  onComplete: (data: any) => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center p-8">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-48 h-48 opacity-30">
        <div className="w-full h-full bg-[#e2f6ec] rounded-br-full transform -translate-x-12 -translate-y-12"></div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-30">
        <div className="w-full h-full bg-[#e1edfb] rounded-bl-full transform translate-x-8 -translate-y-8"></div>
      </div>

      <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-lg p-8 border-2 border-[#00b48d] relative z-10">
        <h2 className="text-3xl font-bold text-[#414651] mb-6">Setup Your Organization</h2>
        
        <div className="bg-[#e2f6ec] rounded-xl p-4 mb-6">
          <p className="text-[#717680] mb-2">Selected Plan:</p>
          <p className="text-xl font-bold text-[#00b48d] capitalize">{planType} Plan</p>
        </div>
        
        <p className="text-sm text-[#717680] mb-8">
          Subscription ID: <span className="font-mono text-[#5a5a5a]">{subscriptionId}</span>
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={onBack}
            className="w-full px-6 py-3 bg-[#e1edfb] text-[#69a3e9] font-semibold rounded-xl hover:bg-[#d4e6f7] transition-colors duration-200"
          >
            ← Back to Plan Selection
          </button>
          <button 
            onClick={() => onComplete({
              planId: subscriptionId,
              organizationType: planType as any,
              organizationName: 'Sample Organization',
              organizationDescription: 'Sample Description',
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              confirmPassword: '',
              phone: '',
              address: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
              }
            })}
            className="w-full px-6 py-3 bg-[#00b48d] text-white font-semibold rounded-xl hover:bg-[#00a080] transition-colors duration-200"
          >
            Complete Setup →
          </button>
        </div>
      </div>
    </div>
  );
} 