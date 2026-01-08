import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { ResetPasswordStepProps } from "src/types";
import { useUserValidation } from "@/hooks";
import { Button } from "@components/shared";
import { CustomInput } from "src/components/shared";
import Feather from "react-native-vector-icons/Feather";

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
    <View style={styles.container}>
      {/* Icon and Description */}
      <View style={styles.header}>
        <Feather name="lock" size={48} color="#FF6B35" />
        <Text style={styles.description}>
          Ingresa tu correo electrónico y te enviaremos un código de
          verificación para restablecer tu contraseña
        </Text>
      </View>

      {/* Email Input */}
      <CustomInput
        label="Correo Electrónico"
        onChangeText={(text) => setEmail(text.toLowerCase())}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        onBlur={() => validateForm({ email })}
        textColor="#000"
        placeholderTextColor="#999"
        variant="filled"
        placeholder="correo@ejemplo.com"
      />

      {/* Submit Button */}
      <Button
        title="Enviar Código"
        onPress={handleSubmit}
        variant="secondary"
        disabled={!email}
        isLoading={isLoading}
        style={styles.button}
      />

      {/* Help Text */}
      <View style={styles.helpContainer}>
        <Feather name="info" size={16} color="#666" />
        <Text style={styles.helpText}>
          Recibirás un código de 6 dígitos en tu correo
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 20,
  },
  header: {
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  helpText: {
    fontSize: 13,
    color: "#666",
  },
});

export default EmailStep;
