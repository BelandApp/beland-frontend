import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/styles/colors";

interface VerificationCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (code: number) => Promise<void>;
  orderNumber?: string;
}

export const VerificationCodeModal: React.FC<VerificationCodeModalProps> = ({
  visible,
  onClose,
  onConfirm,
  orderNumber,
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    // Validar que el código no esté vacío
    if (!code.trim()) {
      setError("Ingrese el código de verificación");
      return;
    }

    // Validar que sea un número
    const codeNumber = parseInt(code, 10);
    if (isNaN(codeNumber)) {
      setError("El código debe ser numérico");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onConfirm(codeNumber);
      // Reset state on success
      setCode("");
      onClose();
    } catch (err) {
      console.error("VerificationCodeModal: error confirming code", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al verificar el código. Verifique que sea correcto."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCode("");
      setError("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="shield-check"
              size={32}
              color={colors.belandOrange}
            />
            <Text style={styles.title}>Código de Verificación</Text>
            <Text style={styles.subtitle}>
              {orderNumber
                ? `Orden ${orderNumber}`
                : "Confirmar entrega de orden"}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.label}>
              Ingrese el código de verificación proporcionado por el cliente:
            </Text>

            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              value={code}
              onChangeText={(text) => {
                setCode(text);
                setError("");
              }}
              placeholder="Ej: 1234"
              keyboardType="numeric"
              maxLength={10}
              editable={!loading}
              autoFocus
            />

            {error ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={16}
                  color="#dc3545"
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.infoContainer}>
              <MaterialCommunityIcons
                name="information-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.infoText}>
                Este código debe coincidir con el que se le proporcionó al
                cliente al momento de crear la orden.
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={18}
                    color="white"
                  />
                  <Text style={styles.buttonPrimaryText}>
                    {" "}
                    Confirmar Entrega
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    maxWidth: 450,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  content: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#ced4da",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 4,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: "#dc3545",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    color: "#dc3545",
    marginLeft: 6,
    flex: 1,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonSecondary: {
    backgroundColor: "#e9ecef",
  },
  buttonSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  buttonPrimary: {
    backgroundColor: colors.belandOrange,
  },
  buttonPrimaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
