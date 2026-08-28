import React from "react";

import { Button } from "@/components";

import Step from "../components/Step";
import StepLayout from "../components/StepLayout";
import { useOnboardingContext } from "../context/OnboardingContext";
import { TOTAL_STEPS } from "../constants/NumberSteps";
import { Text, View } from "react-native";
import { CheckCircle } from "lucide-react-native";

export const CashbackStep = () => {
  const { next, indexState } = useOnboardingContext();

  return (
    <StepLayout
      currentStep={indexState}
      totalSteps={TOTAL_STEPS}
      footer={
        <Button
          title="Cada vez me gusta más!"
          variant="primary"
          onPress={next}
        />
      }
    >
      <Step
        title="CashBack"
        subtitle="Pero eso no es todo, hay formas de ganar dinero!"
      >
        <View className="flex-row gap-2 shadow rounded-2xl p-1">
          <Text>Cuando recargas dinero</Text>
          <CheckCircle color="green" />
        </View>
        <View className="flex-row gap-2 shadow rounded-2xl p-1">
          <Text>Cuando regalas una GiftCard</Text>
          <CheckCircle color="green" />
        </View>
        <View className="flex-row gap-2 shadow rounded-2xl p-1">
          <Text>Cuando recolectamos tus residuos</Text>
          <CheckCircle color="green" />
        </View>
      </Step>
    </StepLayout>
  );
};

export default CashbackStep;
