import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  OnboardingContextType,
  OnboardingState,
  OnboardingStep,
  RouteSelection,
} from "../types/onboarding.types";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STEPS: OnboardingStep[] = [
  OnboardingStep.INTRO,
  OnboardingStep.ORGANICS,
  OnboardingStep.DAYS,
  OnboardingStep.TIMESLOT,
  OnboardingStep.ROUTE_CREATED,
  OnboardingStep.LOGIN,
  OnboardingStep.FRIDGE,
  OnboardingStep.CASHBACK,
  OnboardingStep.WALLET,
  OnboardingStep.VIDEO,
  OnboardingStep.FINISH,
];

const INITIAL_STATE: OnboardingState = {
  currentStep: OnboardingStep.INTRO,
  invited: false,
  route: {
    days: [],
    timeSlot: null,
  },
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);
const ONBOARDING_KEY = "@beland/onboarding_completed";

interface Props {
  children: React.ReactNode;
}

export const OnboardingProvider = ({ children }: Props) => {
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(true);
  const [indexState, setIndexState] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      try {
        if (Platform.OS === "web") {
          // FORZAMOS A QUE ESTE COMPLETADO
          localStorage.setItem(ONBOARDING_KEY, "true");
          const value = localStorage.getItem(ONBOARDING_KEY);
          setHasCompleted(value === "true");
        } else {
          const value = await AsyncStorage.getItem(ONBOARDING_KEY);
          setHasCompleted(value === "true");
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);
  const complete = useCallback(async () => {
    if (Platform.OS === "web") {
      localStorage.setItem(ONBOARDING_KEY, "true");
    } else {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    }

    setHasCompleted(true);
  }, []);
  const resetCompleted = useCallback(async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem(ONBOARDING_KEY);
    } else {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    }

    setHasCompleted(false);
  }, []);
  const setInvited = useCallback((value: boolean) => {
    setState((prev) => ({
      ...prev,
      invited: value,
    }));
  }, []);
  const next = useCallback(() => {
    setState((prev) => {
      const index = STEPS.indexOf(prev.currentStep);
      setIndexState(index);
      if (index === STEPS.length - 1) return prev;

      return {
        ...prev,
        currentStep: STEPS[index + 1],
      };
    });
  }, []);

  const previous = useCallback(() => {
    setState((prev) => {
      const index = STEPS.indexOf(prev.currentStep);
      setIndexState(index);
      if (index <= 0) return prev;

      return {
        ...prev,
        currentStep: STEPS[index - 1],
      };
    });
  }, []);

  const goTo = useCallback((step: OnboardingStep) => {
    setState((prev) => {
      const index = STEPS.indexOf(step);
      setIndexState(index);
      return {
        ...prev,
        currentStep: step,
      };
    });
  }, []);

  const setRoute = useCallback((route: RouteSelection) => {
    setState((prev) => ({
      ...prev,
      route,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setIndexState(0);
  }, []);

  const value = useMemo(
    () => ({
      state,
      next,
      previous,
      goTo,
      setInvited,
      setRoute,
      reset,
      indexState,
      isLoading,
      hasCompleted,
      complete,
      resetCompleted,
    }),
    [
      state,
      next,
      previous,
      goTo,
      reset,
      setInvited,
      indexState,
      isLoading,
      hasCompleted,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      "useOnboardingContext must be used within OnboardingProvider",
    );
  }

  return context;
};
