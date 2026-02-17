import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/styles/colors";

interface VerificationCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, code: number, weight?: number) => Promise<void>;
  orderNumber: string;
}

export const VerificationCodeModal: React.FC<VerificationCodeModalProps> = ({
  visible,
  onClose,
  onConfirm,
  orderNumber,
}) => {
  const [code, setCode] = useState("");
  const [recycleWeight, setRecycleWeight] = useState("");
  const [recycles, setRecycles] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setCode("");
    setRecycleWeight("");
    setRecycles(false);
    setError(null);
  };

  const validate = (): { code: number; weight?: number } | null => {
    if (!code.trim()) {
      setError("Ingrese el código de verificación");
      return null;
    }

    const parsedCode = Number(code);
    if (Number.isNaN(parsedCode)) {
      setError("El código debe ser numérico");
      return null;
    }

    if (recycles) {
      if (!recycleWeight.trim()) {
        setError("Ingrese el peso a reciclar");
        return null;
      }

      const parsedWeight = Number(recycleWeight);
      if (Number.isNaN(parsedWeight)) {
        setError("El peso del residuo debe ser un número");
        return null;
      }

      return { code: parsedCode, weight: parsedWeight };
    }

    return { code: parsedCode };
  };

  const handleConfirm = useCallback(async () => {
    const result = validate();
    if (!result) return;

    setLoading(true);
    setError(null);

    try {
      await onConfirm(orderNumber, result.code, result.weight);
      resetState();
      onClose();
    } catch (err) {
      console.error("VerificationCodeModal error:", err);
      setError(
        err instanceof Error ? err.message : "Error al verificar el código",
      );
    } finally {
      setLoading(false);
    }
  }, [code, recycleWeight, recycles]);

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose();
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
              Ingrese el código proporcionado por el cliente
            </Text>

            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={code}
              onChangeText={(text) => {
                setCode(text);
                setError(null);
              }}
              placeholder="Ej: 1234"
              keyboardType="numeric"
              maxLength={10}
              editable={!loading}
              autoFocus
            />

            <View style={styles.infoContainer}>
              <MaterialCommunityIcons
                name="information-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.infoText}>
                El código debe coincidir con el generado al crear la orden.
              </Text>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>¿Entrega residuos?</Text>
              <Switch value={recycles} onValueChange={setRecycles} />
            </View>

            {recycles && (
              <TextInput
                style={[styles.input, error && styles.inputError]}
                value={recycleWeight}
                onChangeText={(text) => {
                  setRecycleWeight(text);
                  setError(null);
                }}
                placeholder="Ej: 2 (kg)"
                keyboardType="numeric"
                editable={!loading}
              />
            )}

            {error && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={16}
                  color="#dc3545"
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
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
  switchRow: {
    flexDirection: "row",
    gap: 2,
  },
});
