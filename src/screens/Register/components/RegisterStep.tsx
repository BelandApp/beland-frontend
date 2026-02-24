import { View, Text } from "react-native";
import { CustomInput, PhoneInput } from "src/components/shared";
import { Button } from "@components/shared";
import { RegisterFormData } from "../RegisterScreen";
import { styles } from "../styles";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import Feather from "react-native-vector-icons/Feather";

export type RegisterStepProps = {
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
  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "#E0E0E0" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    const labels = ["Débil", "Regular", "Buena", "Fuerte"];
    const colors = ["#FF6B6B", "#FFA500", "#4CAF50", "#00E074"];

    return {
      strength: (strength / 4) * 100,
      label: labels[strength - 1] || "",
      color: colors[strength - 1] || "#E0E0E0",
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <>
      <Text style={styles.description}>
        Crea tu cuenta para comenzar a usar Beland
      </Text>

      <View style={styles.inputsContainer}>
        <CustomInput
          label="Nombre completo"
          onChangeText={(full_name) => onChangeText("full_name", full_name)}
          value={formData.full_name}
          error={errors.full_name}
          textColor="#000"
          placeholderTextColor="#999"
          variant="filled"
          placeholder="Ej: Juan Pérez"
        />
        <PhoneInput
          value={formData.phone}
          onChange={(phone) => onChangeText("phone", phone)}
          error={errors.phone}
          textColor="#000"
          placeholderTextColor="#999"
          variant="filled"
        />
      </View>

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

      <CustomInput
        label="Contraseña"
        onChangeText={(password) => onChangeText("password", password)}
        value={formData.password}
        secureTextEntry
        error={errors.password}
        textColor="#000"
        placeholderTextColor="#999"
        variant="filled"
        placeholder="Mínimo 8 caracteres"
      />

      {/* Password strength indicator */}
      {formData.password && (
        <View style={{ marginTop: -8, marginBottom: 8 }}>
          <View
            style={{
              height: 4,
              backgroundColor: "#E0E0E0",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${passwordStrength.strength}%`,
                backgroundColor: passwordStrength.color,
              }}
            />
          </View>
          <Text
            style={{
              fontSize: 12,
              color: passwordStrength.color,
              marginTop: 4,
              fontWeight: "600",
            }}
          >
            Seguridad: {passwordStrength.label}
          </Text>
        </View>
      )}

      <CustomInput
        label="Confirmar Contraseña"
        onChangeText={(confirmPassword) =>
          onChangeText("confirmPassword", confirmPassword)
        }
        value={formData.confirmPassword}
        secureTextEntry
        error={errors.confirmPassword}
        textColor="#000"
        placeholderTextColor="#999"
        variant="filled"
        placeholder="Repite tu contraseña"
      />

      {/* Password requirements */}
      <View style={{ marginBottom: 12, paddingHorizontal: 4 }}>
        <Text style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
          La contraseña debe contener:
        </Text>
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather
              name={formData.password.length >= 8 ? "check-circle" : "circle"}
              size={14}
              color={formData.password.length >= 8 ? "#00E074" : "#999"}
            />
            <Text style={{ fontSize: 12, color: "#666" }}>
              Mínimo 8 caracteres
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather
              name={
                /[a-z]/.test(formData.password) &&
                /[A-Z]/.test(formData.password)
                  ? "check-circle"
                  : "circle"
              }
              size={14}
              color={
                /[a-z]/.test(formData.password) &&
                /[A-Z]/.test(formData.password)
                  ? "#00E074"
                  : "#999"
              }
            />
            <Text style={{ fontSize: 12, color: "#666" }}>
              Mayúsculas y minúsculas
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather
              name={/\d/.test(formData.password) ? "check-circle" : "circle"}
              size={14}
              color={/\d/.test(formData.password) ? "#00E074" : "#999"}
            />
            <Text style={{ fontSize: 12, color: "#666" }}>
              Al menos un número
            </Text>
          </View>
        </View>
      </View>

      <Button
        title="Crear Cuenta"
        onPress={handleRegister}
        variant="secondary"
        isLoading={isLoading}
        style={styles.button}
        textStyle={styles.buttonText}
      />
    </>
  );
};

export default RegisterStep;
