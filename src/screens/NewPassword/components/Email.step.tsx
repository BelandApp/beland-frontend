import { CustomInput, PhoneInput } from "src/components/shared";
import { View, Text, TouchableHighlight } from "react-native";
import { useState } from "react";
import { ResetPasswordStepProps } from "src/types";
import ThemedButton from "src/components/shared/buttons/Themed.button";
import { useValidation } from "src/hooks/form/useValidation";
import { useResetPassword } from "../hook/useResetPassword";

const EmailStep: React.FC<ResetPasswordStepProps> = ({ onSubmit, isLoading }) => {
  const [email, setEmail] = useState("");
  const { validateForm, errors } = useValidation();
  const handleSubmit = () => {
    const isValid = validateForm({ email });
    if (!isValid) return;
    onSubmit(email);
  };
  return (
    <View>
      <Text style={{ marginBottom: 5, color: "white" }}>
        Te enviaremos un código a tu email
      </Text>
      <CustomInput
        label="Email"
        onChangeText={(text) => setEmail(text)}
        value={email}
        error={errors.email}
        onBlur={() => validateForm({ email })}
      />
      <ThemedButton
        label="Enviar"
        onPress={handleSubmit}
        variant="secondary"
        disabled={!email}
        isLoading={isLoading}
      />
    </View>
  );
};

export default EmailStep;
