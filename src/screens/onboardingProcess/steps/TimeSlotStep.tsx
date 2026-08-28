import React, { useState } from "react";

import { Button } from "@/components";

import Step from "../components/Step";
import StepLayout from "../components/StepLayout";
import { useOnboardingContext } from "../context/OnboardingContext";
import { TOTAL_STEPS } from "../constants/NumberSteps";
import { Text, View } from "react-native";
import { SCHEDULE } from "../utils/timeUnits";
import { TimeSlot } from "../types/onboarding.types";

export const TimeSlotStep = () => {
  const { next, setRoute, state, indexState } = useOnboardingContext();
  const [selectedHours, setSelectedHours] = useState<string | null>(null);
  const toggleSche = (sche: string) => {
    setSelectedHours(sche);
  };
  return (
    <StepLayout
      currentStep={indexState}
      totalSteps={TOTAL_STEPS}
      footer={
        <Button
          title="Confirmar horario"
          disabled={selectedHours === null}
          variant="primary"
          onPress={() => {
            if (selectedHours === null) return;
            setRoute({
              days: state.route.days,
              timeSlot: selectedHours as TimeSlot,
            });

            next();
          }}
        />
      }
    >
      <Step title="Perfecto!" subtitle="¿En qué horario prefieres que pasemos?">
        <View className="flex-row flex-wrap gap-2">
          {SCHEDULE.map((sche) => (
            <View className="items-center gap-1 shadow rounded-2xl p-2">
              <Text>{sche.label}</Text>
              <Button
                key={sche.label}
                title={sche.hours}
                variant={
                  selectedHours === null
                    ? "ghost"
                    : selectedHours === sche.timeSlot
                      ? "primary"
                      : "ghost"
                }
                onPress={() => toggleSche(sche.timeSlot)}
              />
            </View>
          ))}
        </View>
      </Step>
    </StepLayout>
  );
};

export default TimeSlotStep;
