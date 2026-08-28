import React, { useState } from "react";

import { Button, PhoneInput } from "@/components";

import Step from "../components/Step";
import StepLayout from "../components/StepLayout";
import { useOnboardingContext } from "../context/OnboardingContext";
import { TOTAL_STEPS } from "../constants/NumberSteps";
import { useUserValidation } from "src/hooks";
import { notify } from "src/hooks/notification/notify.external";
import { userService } from "src/services/user/user.service";
import { Text, View } from "react-native";
export const WalletStep: React.FC = () => {
  const { next, indexState } = useOnboardingContext();
  const [phone, setPhone] = useState("");
  const [canNext, setCanNext] = useState(false);
  const { validatePhone } = useUserValidation();
  const handleSubmit = async () => {
    const isValid = validatePhone(phone);
    if (!isValid) {
      notify.error({ message: "El número no es valido" });
    }
    await userService.updateUser({ phone });
    setCanNext(true);
  };
  return (
    <StepLayout
      currentStep={indexState}
      totalSteps={TOTAL_STEPS}
      footer={
        <Button
          title="Saber más"
          variant="primary"
          onPress={next}
          disabled={!canNext}
        />
      }
    >
      <Step
        title={
          !canNext ? "Tendrás tu propia Billetera" : "Ya tienes tu billetera"
        }
        subtitle={
          !canNext
            ? "Solo tienes que enlazarla con tu Nro. de teléfono"
            : "Ahora puedes ingresar dinero para comprar productos"
        }
      >
        {!canNext ? (
          <View className="gap-2 shadow rounded-2xl p-6">
            <PhoneInput value={phone} onChange={(value) => setPhone(value)} />
            <Button
              title="Confirmar"
              onPress={handleSubmit}
              variant="secondary"
            />
          </View>
        ) : (
          <View className="gap-2 shadow rounded-2xl p-6">
            <Text>Excelente! Sigamos</Text>
          </View>
        )}
      </Step>
    </StepLayout>
  );
};

export default WalletStep;
