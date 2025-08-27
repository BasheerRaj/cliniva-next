import { PlanSelector } from '@/components/onboarding/PlanSelector';
import { OnboardingRouter } from '@/components/onboarding/OnboardingRouter';

export default function PlanSelectionPage() {
  return (
    <OnboardingRouter>
      <PlanSelector />
    </OnboardingRouter>
  );
} 