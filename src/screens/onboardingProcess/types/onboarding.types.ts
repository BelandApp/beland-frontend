export enum OnboardingStep {
  INTRO = "INTRO",
  ORGANICS = "ORGANICS",
  DAYS = "DAYS",
  TIMESLOT = "TIMESLOT",
  ROUTE_CREATED = "ROUTE_CREATED",
  LOGIN = "LOGIN",
  FRIDGE = "FRIDGE",
  CASHBACK = "CASHBACK",
  WALLET = "WALLET",
  VIDEO = "VIDEO",
  FINISH = "FINISH",
}
export type TimeSlot = "morning" | "night";

export interface RouteSelection {
  days: string[];
  timeSlot: TimeSlot | null;
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  invited: boolean;
  route: RouteSelection;
}

export interface OnboardingContextType {
  state: OnboardingState;
  indexState: number;
  next: () => void;
  isLoading: boolean;
  hasCompleted: boolean;
  complete: () => void;
  setInvited: (invited: boolean) => void;
  resetCompleted: () => void;
  previous: () => void;

  goTo: (step: OnboardingStep) => void;

  setRoute: (route: RouteSelection) => void;

  reset: () => void;
}
