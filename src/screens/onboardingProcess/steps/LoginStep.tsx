import React, { useState } from "react";

import { Button, CustomInput } from "@/components";

import Step from "../components/Step";
import StepLayout from "../components/StepLayout";
import { useOnboardingContext } from "../context/OnboardingContext";
import { TOTAL_STEPS } from "../constants/NumberSteps";
import { useAuth } from "src/context";
import { Text, View } from "react-native";
import CustomPicker from "src/components/shared/input/Custom.picker";
import { userService } from "src/services/user/user.service";
import { OnboardingStep } from "../types/onboarding.types";

interface AddressDTO {
  city: string | null;
  country: string | null;
  state: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
}

export const LoginStep = () => {
  const { next, goTo, indexState } = useOnboardingContext();
  const { handleAuth0Login, user, updateUser } = useAuth();
  const [notAddress, setNotAddress] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressDTO, string>>
  >({});
  const [newAddress, setNewAddress] = useState<AddressDTO>({
    city: null,
    state: null,
    country: null,
    addressLine1: null,
    addressLine2: null,
  });

  const isAddressComplete =
    !!newAddress.country &&
    !!newAddress.state &&
    !!newAddress.city &&
    !!newAddress.addressLine1 &&
    !!newAddress.addressLine2;
  const canContinue = !!user && (notAddress || isAddressComplete);

  const handleChangeNotAddress = () => {
    setNotAddress((prev) => !prev);
  };
  const handleChange = <K extends keyof AddressDTO>(
    field: K,
    value: AddressDTO[K],
  ) => {
    setNewAddress((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmitAndNext = async () => {
    if (!notAddress) {
      if (newAddress.city && newAddress.country)
        await userService.updateUser({
          address: `${newAddress.addressLine1 + " " + newAddress.addressLine2}`,
          city: newAddress.city,
          country: newAddress.country,
        });
      next();
    } else {
      goTo(OnboardingStep.WALLET);
    }
  };

  return (
    <StepLayout
      currentStep={indexState}
      totalSteps={TOTAL_STEPS}
      footer={
        <Button
          title="Continuar"
          onPress={handleSubmitAndNext}
          disabled={!canContinue}
        />
      }
    >
      <Step
        title={!user ? "¡Ruta creada!" : "¡Usuario Creado!"}
        subtitle={
          !user
            ? "Ahora crea tu usuario en Beland.app para asignarte un recolector."
            : "Donde debemos buscar la basura?"
        }
      >
        {!user && (
          <Button title="Continuar con Google" onPress={handleAuth0Login} />
        )}
        {user && (
          <View className="gap-4">
            <View className="shadow p-4 gap-2 items-center rounded-2xl">
              <Text>
                De momento solo estamos brindando este servicio en Quito -
                Ecuador
              </Text>
              <Button
                title="No vivo allí"
                onPress={handleChangeNotAddress}
                variant={notAddress ? "primary" : "ghost"}
              />
            </View>
            {!notAddress ? (
              <View className="gap-4 shadow rounded-2xl p-6">
                <CustomPicker
                  required={!notAddress}
                  label="País"
                  value={newAddress.country}
                  options={[{ label: "Ecuador", value: "Ecuador" }]}
                  onChange={(value) => handleChange("country", value as any)}
                />
                <CustomPicker
                  required={!notAddress}
                  label="Estado"
                  value={newAddress.state}
                  options={[{ label: "Pichincha", value: "Pichincha" }]}
                  onChange={(value) => handleChange("state", value as any)}
                />
                <CustomPicker
                  required={!notAddress}
                  label="Ciudad"
                  value={newAddress.city}
                  options={[{ label: "Quito", value: "Quito" }]}
                  onChange={(value) => handleChange("city", value as any)}
                />
                <View className=" md:flex-row md:mt-2 gap-2 ">
                  <CustomInput
                    required={!notAddress}
                    label="Tu dirección"
                    placeholder="Calle belgrano 120"
                    variant="filled"
                    value={newAddress.addressLine1 ?? ""}
                    onChangeText={(value) =>
                      handleChange("addressLine1", value)
                    }
                  />
                  <CustomInput
                    required={!notAddress}
                    label="Tu altura y puerta"
                    placeholder="piso 3, puerta 2"
                    variant="filled"
                    value={newAddress.addressLine2 ?? ""}
                    onChangeText={(value) =>
                      handleChange("addressLine2", value)
                    }
                  />
                </View>
              </View>
            ) : (
              <View className="shadow p-4 gap-2 items-center rounded-xl">
                <Text>
                  Bueno... No retiraremos la basura, pero déjanos mostrarte que
                  si podemos ofrecerte!
                </Text>
              </View>
            )}
          </View>
        )}
      </Step>
    </StepLayout>
  );
};

export default LoginStep;
