import { CustomInput } from "src/components/shared";
import { View, Text } from "react-native";
import { useState } from "react";
import { Button } from "@components/shared";
import { ResetPasswordStepProps } from "src/types";
import { useValidation } from "src/hooks/form/useValidation";
const NewPasswordStep: React.FC<ResetPasswordStepProps> = ({onSubmit}) => {
  const [password, setPassword] = useState("");
  const { validateForm, errors}=useValidation()
  const handleSubmit = () => {
   const isValid = validateForm({ password });
    if(!isValid) return
    onSubmit(password);
  }
  return (
    <View>
      <Text style={{ marginBottom: 5, color: "white" }}>
        Introduce tu nueva contraseña
      </Text>
      <CustomInput
        label="Contraseña"
        onChangeText={(text) => setPassword(text)}
        value={password}
        error={errors.password}
        onBlur={() => validateForm({ password })}
      />
      <Button
        onPress={handleSubmit}
        title="Guardar"
        variant="secondary"
        disabled={!password}
      />
    </View>
  );
};

export default NewPasswordStep;
