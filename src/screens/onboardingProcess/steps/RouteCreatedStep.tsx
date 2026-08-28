import React from "react";

import { Button } from "@/components";

import Step from "../components/Step";
import StepLayout from "../components/StepLayout";
import { useOnboardingContext } from "../context/OnboardingContext";
import { TOTAL_STEPS } from "../constants/NumberSteps";
import { Text, View } from "react-native";
import { CheckCircle } from "lucide-react-native";

export const RouteCreatedStep = () => {
  const { next, state, indexState } = useOnboardingContext();

  return (
    <StepLayout
      currentStep={indexState}
      totalSteps={TOTAL_STEPS}
      footer={<Button title="Confirmar" variant="primary" onPress={next} />}
    >
      <Step
        title="Listo! Tu ruta está creada"
        subtitle="A partir de ahora retiraremos tus residuos asi:"
      >
        <View className="shadow rounded-2xl p-4 gap-2">
          <View className="m-auto">
            <CheckCircle color="green" />
          </View>
          <Text className="text-gray-500">TU RUTA BELAND:</Text>
          <View accessibilityRole="list" className="flex-row gap-1">
            {state.route.days.map((day, index) => (
              <Text className="uppercase font-semibold">
                {state.route.days.length > 1 &&
                  index === state.route.days.length - 1 &&
                  "y "}
                {day}
                {state.route.days.length > 1 &&
                  index !== state.route.days.length - 1 &&
                  ","}
              </Text>
            ))}
          </View>
          {state.route.timeSlot === "morning" ? (
            <Text>Por la mañana · 6:00 - 11:000 am</Text>
          ) : (
            <Text>Por la noche · 5:00 - 11:00 pm</Text>
          )}
        </View>
      </Step>
    </StepLayout>
  );
};

export default RouteCreatedStep;
