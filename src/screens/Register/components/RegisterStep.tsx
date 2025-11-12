import { View, Text } from "react-native";
import { CustomInput, PhoneInput } from "src/components/shared";
import { Button } from "@components/shared";
import { RegisterFormData } from "../RegisterScreen";
import { styles } from "../styles";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
type RegisterStepProps = {
  formData: RegisterFormData;
  onChangeText: (name: string, value: string) => void;
  handleRegister: () => void;
  isLoading: boolean;
  errors: { [key: string]: string };
};
const RegisterStep: React.FC<RegisterStepProps> = ({
  formData,
  onChangeText,
  handleRegister,
  isLoading,
  errors,
}) => {
  const { navigate } = useCustomNavigation();
  return (
    <>
      <View style={styles.inputsContainer}>
        <CustomInput
          label="Nombre completo"
          onChangeText={(full_name) => onChangeText("full_name", full_name)}
          value={formData.full_name}
          error={errors.full_name}
        />
        <PhoneInput
          value={formData.phone}
          onChange={(phone) => onChangeText("phone", phone)}
          error={errors.phone}
        />
      </View>
      <CustomInput
        label="Correo Electrónico"
        onChangeText={(email) => onChangeText("email", email)}
        value={formData.email}
        keyboardType="email-address"
        error={errors.email}
      />
      <CustomInput
        label="Contraseña"
        onChangeText={(password) => onChangeText("password", password)}
        value={formData.password}
        secureTextEntry
        error={errors.password}
      />
      <Button
        title="Registrarse"
        onPress={handleRegister}
        variant="secondary"
        isLoading={isLoading}
      />
      <View style={styles.containerRow}>
        <Text style={styles.subtitle}>¿Ya tienes cuenta? </Text>
        <Button
          title="Ingresar"
          onPress={() => navigate("Login")}
          style={styles.buttonLink}
          isLoading={isLoading}
        />
      </View>
    </>
  );
};

export default RegisterStep;
