import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { Button } from "@components/shared";
import { ResetPasswordStepProps } from "src/types";
import { useUserValidation } from "@/hooks";
import { CustomInput } from "src/components/shared";
import Feather from "react-native-vector-icons/Feather";

const NewPasswordStep: React.FC<ResetPasswordStepProps> = ({ onSubmit }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { validateForm, errors } = useUserValidation();

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      return;
    }
    const isValid = validateForm({ password });
    if (!isValid) return;
    onSubmit(password);
  };

  // Password strength indicator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: "", color: "#E0E0E0" };

    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength++;

    const labels = ["Débil", "Regular", "Buena", "Fuerte"];
    const colors = ["#FF6B6B", "#FFA500", "#4CAF50", "#00E074"];

    return {
      strength: (strength / 4) * 100,
      label: labels[strength - 1] || "",
      color: colors[strength - 1] || "#E0E0E0",
    };
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch =
    password && confirmPassword && password !== confirmPassword;

  const hasMinLength = password.length >= 8;
  const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*._\-]/.test(password);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Feather name="key" size={48} color="#00E074" />
        <Text style={styles.description}>
          Crea una nueva contraseña segura para tu cuenta
        </Text>
      </View>

      {/* Password Input */}
      <CustomInput
        label="Nueva Contraseña"
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry
        error={errors.password}
        onBlur={() => validateForm({ password })}
        textColor="#000"
        placeholderTextColor="#999"
        variant="filled"
        placeholder="Mínimo 8 caracteres"
      />

      {/* Password strength indicator */}
      {password && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBar}>
            <View
              style={[
                styles.strengthFill,
                {
                  width: `${passwordStrength.strength}%`,
                  backgroundColor: passwordStrength.color,
                },
              ]}
            />
          </View>
          <Text
            style={[styles.strengthLabel, { color: passwordStrength.color }]}
          >
            Seguridad: {passwordStrength.label}
          </Text>
        </View>
      )}

      {/* Confirm Password Input */}
      <CustomInput
        label="Confirmar Contraseña"
        onChangeText={(text) => setConfirmPassword(text)}
        value={confirmPassword}
        secureTextEntry
        textColor="#000"
        placeholderTextColor="#999"
        variant="filled"
        placeholder="Repite tu contraseña"
      />

      {/* Password match indicator */}
      {passwordsMatch && (
        <View style={styles.matchContainer}>
          <Feather name="check-circle" size={16} color="#00E074" />
          <Text style={styles.matchText}>Las contraseñas coinciden</Text>
        </View>
      )}
      {passwordsDontMatch && (
        <View style={[styles.matchContainer, styles.errorContainer]}>
          <Feather name="x-circle" size={16} color="#FF6B6B" />
          <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
        </View>
      )}

      {/* Password requirements */}
      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>
          La contraseña debe contener:
        </Text>
        <View style={styles.requirementsList}>
          <View style={styles.requirement}>
            <Feather
              name={hasMinLength ? "check-circle" : "circle"}
              size={14}
              color={hasMinLength ? "#00E074" : "#999"}
            />
            <Text style={styles.requirementText}>Mínimo 8 caracteres</Text>
          </View>
          <View style={styles.requirement}>
            <Feather
              name={hasUpperAndLower ? "check-circle" : "circle"}
              size={14}
              color={hasUpperAndLower ? "#00E074" : "#999"}
            />
            <Text style={styles.requirementText}>Mayúsculas y minúsculas</Text>
          </View>
          <View style={styles.requirement}>
            <Feather
              name={hasNumber ? "check-circle" : "circle"}
              size={14}
              color={hasNumber ? "#00E074" : "#999"}
            />
            <Text style={styles.requirementText}>Al menos un número</Text>
          </View>
          <View style={styles.requirement}>
            <Feather
              name={hasSpecialChar ? "check-circle" : "circle"}
              size={14}
              color={hasSpecialChar ? "#00E074" : "#999"}
            />
            <Text style={styles.requirementText}>
              Al menos un caracter especial
            </Text>
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <Button
        onPress={handleSubmit}
        title="Cambiar Contraseña"
        variant="secondary"
        disabled={!password || !confirmPassword || password !== confirmPassword}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 16,
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
  strengthContainer: {
    marginTop: -8,
    marginBottom: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
  },
  strengthLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -8,
  },
  matchText: {
    fontSize: 13,
    color: "#00E074",
    fontWeight: "500",
  },
  errorContainer: {
    marginTop: -8,
  },
  errorText: {
    fontSize: 13,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  requirementsContainer: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  requirementsTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  requirementsList: {
    gap: 6,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: "#666",
  },
  button: {
    marginTop: 8,
  },
});

export default NewPasswordStep;
