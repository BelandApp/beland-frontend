import { CustomInput } from "src/components/shared";
import { View, Text } from "react-native";
import { useState } from "react";
import { ResetPasswordStepProps } from "src/types";
import { useUserValidation } from "@/hooks";
import { Button } from "@components/shared";

const EmailStep: React.FC<ResetPasswordStepProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [email, setEmail] = useState("");
  const { validateForm, errors } = useUserValidation();
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
      <Button
        title="Enviar"
        onPress={handleSubmit}
        variant="secondary"
        disabled={!email}
        isLoading={isLoading}
      />
    </View>
  );
};

export default EmailStep;
