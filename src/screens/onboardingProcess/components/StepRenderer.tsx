import React from "react";

import { useOnboardingContext } from "../context/OnboardingContext";
import { OnboardingStep } from "../types/onboarding.types";

import {
  FinishStep,
  VideoStep,
  WalletStep,
  CashbackStep,
  FridgeStep,
  LoginStep,
  RouteCreatedStep,
  TimeSlotStep,
  DayStep,
  OrganicStep,
  IntroStep,
} from "../steps/index";

const STEP_COMPONENTS: Record<OnboardingStep, React.ComponentType> = {
  [OnboardingStep.INTRO]: IntroStep,
  [OnboardingStep.ORGANICS]: OrganicStep,
  [OnboardingStep.DAYS]: DayStep,
  [OnboardingStep.TIMESLOT]: TimeSlotStep,
  [OnboardingStep.ROUTE_CREATED]: RouteCreatedStep,
  [OnboardingStep.LOGIN]: LoginStep,
  [OnboardingStep.FRIDGE]: FridgeStep,
  [OnboardingStep.CASHBACK]: CashbackStep,
  [OnboardingStep.WALLET]: WalletStep,
  [OnboardingStep.VIDEO]: VideoStep,
  [OnboardingStep.FINISH]: FinishStep,
};
interface StepRendererProps {
  invited?: boolean;
}
const StepRenderer: React.FC<StepRendererProps> = () => {
  const {
    state: { currentStep },
  } = useOnboardingContext();

  const CurrentStep = STEP_COMPONENTS[currentStep];

  return <CurrentStep />;
};

export default React.memo(StepRenderer);
