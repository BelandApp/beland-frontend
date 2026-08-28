import React from "react";

import { Button } from "@/components";

import Step from "../components/Step";
import StepLayout from "../components/StepLayout";
import { useOnboardingContext } from "../context/OnboardingContext";
import { TOTAL_STEPS } from "../constants/NumberSteps";
import { useCustomNavigation } from "src/hooks";

export const IntroStep = () => {
  const { next, indexState, complete, state } = useOnboardingContext();
  const { navigate } = useCustomNavigation();
  const navigateToLogin = async () => {
    complete();
    navigate("Login");
  };
  return (
    <StepLayout
      currentStep={indexState}
      totalSteps={TOTAL_STEPS}
      footer={
        <Button
          title="Ya soy usuario"
          variant="ghost"
          onPress={navigateToLogin}
        />
      }
    >
      <Step
        title="Hola!"
        subtitle={`${state.invited ? "Alguien que te quiere te invitó" : ""} ¿Quieres ganar dinero por cuidar el planeta desde tu casa?`}
      >
        <Button title="Comenzar" variant="primary" onPress={next} />
      </Step>
    </StepLayout>
  );
};

export default IntroStep;
