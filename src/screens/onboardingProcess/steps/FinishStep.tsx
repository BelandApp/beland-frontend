import React from "react";

import { Button } from "@/components";

import Step from "../components/Step";
import StepLayout from "../components/StepLayout";
import { useOnboardingContext } from "../context/OnboardingContext";
import { TOTAL_STEPS } from "../constants/NumberSteps";
import { useCustomNavigation } from "src/hooks";
export const FinishStep: React.FC = () => {
  const { indexState, reset, complete } = useOnboardingContext();
  const { navigate } = useCustomNavigation();

  const finish = async () => {
    complete();
    navigate("MainTabs", { screen: "Home" });
  };

  return (
    <StepLayout
      currentStep={indexState}
      totalSteps={TOTAL_STEPS}
      footer={<Button title="A ver..." variant="primary" onPress={finish} />}
    >
      <Step
        title="Genial!"
        subtitle="Ahora ve a descubrir la aplicación, porque no solo es eso, también podrás comprar entradas de eventos, medir que tanto reciclas, ver tus compras y ordenes en tiempo real y próximamente crear grupos y juntadas con tus amigos!"
      >
        <Button
          title="Algo no me quedo claro..."
          onPress={reset}
          variant="ghost"
        />
      </Step>
    </StepLayout>
  );
};

export default FinishStep;
