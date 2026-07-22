import React, { useState } from "react";

import { Button } from "@/components";

import Step from "../components/Step";
import StepLayout from "../components/StepLayout";
import { useOnboardingContext } from "../context/OnboardingContext";
import { TOTAL_STEPS } from "../constants/NumberSteps";
import { DAYS } from "../utils/timeUnits";
import { View } from "react-native";

export const DayStep = () => {
  const { next, setRoute, indexState } = useOnboardingContext();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }

      return [...prev, day];
    });
  };
  return (
    <StepLayout
      currentStep={indexState}
      totalSteps={TOTAL_STEPS}
      footer={
        <Button
          disabled={selectedDays.length === 0}
          title="Confirmar días"
          variant="primary"
          onPress={() => {
            setRoute({
              days: selectedDays,
              timeSlot: null,
            });

            next();
          }}
        />
      }
    >
      <Step
        title="Beland"
        subtitle="Nosotros nos adaptamos a tu rutina. ¿Qué días pasa el camión de basura por tu casa? Pasaremos esos mismos días a retirar tus reciclables."
      >
        <View className="flex-row flex-wrap gap-2">
          {DAYS.map((day) => (
            <Button
              key={day}
              title={day}
              variant={selectedDays.includes(day) ? "primary" : "ghost"}
              onPress={() => toggleDay(day)}
            />
          ))}
        </View>
      </Step>
    </StepLayout>
  );
};

export default DayStep;
