import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { CodeStepProps } from "src/types";
import { Button } from "@components/shared";
import { useUserValidation } from "@/hooks";
import Feather from "react-native-vector-icons/Feather";

const CodeStep: React.FC<CodeStepProps> = ({
  FormData,
  onSubmit,
  onResendCode,
  onStepBack,
  isLoading,
}) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [count, setCount] = useState<number>(60);
  const { validateForm, errors } = useUserValidation();
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const fullCode = code.join("");
    const isValid = validateForm({ code: fullCode });
    if (!isValid) return;
    onSubmit(fullCode);
  };

  const handleResendCode = () => {
    onResendCode();
    setCount(60);
    setCode(["", "", "", "", "", ""]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Feather name="mail" size={48} color="#00E074" />
        <Text style={styles.title}>Verifica tu correo</Text>
        <Text style={styles.subtitle}>
          Ingresa el código de 6 dígitos enviado a
        </Text>
        <Text style={styles.email}>{FormData.email}</Text>
      </View>

      {/* Code Input Boxes */}
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <View
            key={index}
            style={[
              styles.codeBox,
              digit && styles.codeBoxFilled,
              errors.code && styles.codeBoxError,
            ]}
          >
            <TextInput
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              style={styles.codeInput}
              autoFocus={index === 0}
            />
          </View>
        ))}
      </View>

      {errors.code && (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={14} color="#FF6B6B" />
          <Text style={styles.errorText}>{errors.code}</Text>
        </View>
      )}

      {/* Timer and Resend */}
      <View style={styles.resendContainer}>
        {count > 0 ? (
          <View style={styles.timerContainer}>
            <Feather name="clock" size={16} color="#666" />
            <Text style={styles.timerText}>
              Reenviar código en {formatTime(count)}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={isLoading}
            style={styles.resendButton}
          >
            <Feather name="refresh-cw" size={16} color="#00E074" />
            <Text style={styles.resendText}>Reenviar código</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={onStepBack} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color="#666" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        <Button
          title="Verificar"
          onPress={handleSubmit}
          variant="secondary"
          disabled={!isCodeComplete}
          isLoading={isLoading}
          style={[
            styles.confirmButton,
            !isCodeComplete && styles.buttonDisabled,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  email: {
    fontSize: 15,
    fontWeight: "600",
    color: "#00E074",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginVertical: 16,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  codeBoxFilled: {
    borderColor: "#00E074",
    backgroundColor: "#F0FFF4",
  },
  codeBoxError: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF5F5",
  },
  codeInput: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: -8,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
  },
  resendContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    color: "#666",
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 15,
    color: "#00E074",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  backButtonText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default CodeStep;
