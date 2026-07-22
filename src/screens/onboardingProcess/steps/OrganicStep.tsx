import React from "react";

import { Button, RecycleIcon } from "@/components";

import Step from "../components/Step";
import StepLayout from "../components/StepLayout";
import { useOnboardingContext } from "../context/OnboardingContext";
import { TOTAL_STEPS } from "../constants/NumberSteps";
import { ArrowRight, EqualNot, LeafIcon, Trash2 } from "lucide-react-native";
import { Text, View } from "react-native";

export const OrganicStep = () => {
  const { next, indexState } = useOnboardingContext();

  return (
    <StepLayout
      currentStep={indexState}
      totalSteps={TOTAL_STEPS}
      footer={
        <Button
          title="Entendido ¿Cómo sigo?"
          variant="primary"
          onPress={next}
        />
      }
    >
      <Step
        title="Reciclar..."
        subtitle="Reciclar en casa es más simple de lo que crees! solo tienes que separar tus residuos orgánicos de los inorgánicos."
      >
        <View className="flex-row gap-2 items-center">
          <View className="items-center gap-2">
            <View className="rounded-full bg-beland-green-500 p-3 items-center">
              <LeafIcon size={35} color="white" />
            </View>
            <Text className="text-gray-500">Orgánicos</Text>
          </View>

          <EqualNot color="gray" />
          <View className="items-center gap-2">
            <View className="rounded-full border border-gray-300 p-3 items-center">
              <RecycleIcon width={35} height={35} color="red" />
            </View>
            <Text className="text-gray-500">Inorgánicos</Text>
          </View>
        </View>
      </Step>
    </StepLayout>
  );
};

export default OrganicStep;
