import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_STORAGE_KEY = "@beland_onboarding_completed";

export const useOnboardingTour = () => {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has seen the tour
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompleted = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!hasCompleted) {
        // First time user - show tour after a small delay
        setTimeout(() => {
          setShowTour(true);
          setIsLoading(false);
        }, 1000);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setIsLoading(false);
    }
  };

  const completeTour = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
      setShowTour(false);
      setCurrentStep(0);
    } catch (error) {
      console.error("Error saving onboarding completion:", error);
    }
  };

  const resetTour = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
      setCurrentStep(0);
      setShowTour(true);
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const skipTour = async () => {
    await completeTour();
  };

  return {
    showTour,
    currentStep,
    isLoading,
    nextStep,
    previousStep,
    completeTour,
    resetTour,
    skipTour,
    setCurrentStep,
  };
};
