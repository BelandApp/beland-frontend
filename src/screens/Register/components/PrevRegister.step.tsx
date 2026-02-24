import { View, Text } from "react-native";
import React from "react";
import { Button, CustomInput } from "src/components";
import { RegisterStepProps } from "./RegisterStep";
import { styles } from "../styles";
const PrevRegister: React.FC<RegisterStepProps> = ({
  formData,
  onChangeText,
  handleRegister,
  isLoading,
  errors,
}) => {
  return (
    <View>
      <Text style={styles.description}>Confirma tu correo en Beland</Text>
      <View style={styles.inputsContainer}>
        <CustomInput
          label="Correo Electrónico"
          onChangeText={(email) => onChangeText("email", email.toLowerCase())}
          value={formData.email}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          textColor="#000"
          placeholderTextColor="#999"
          variant="filled"
          placeholder="correo@ejemplo.com"
        />
      </View>
      <Button
        title="Confirmar"
        onPress={handleRegister}
        variant="secondary"
        isLoading={isLoading}
        style={styles.button}
        textStyle={styles.buttonText}
      />
    </View>
  );
};

export default PrevRegister;
