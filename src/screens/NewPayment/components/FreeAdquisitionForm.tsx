import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { colors } from "src/design-system";

type Props = {
  product: { id: string; condition?: string };
  canBuyForOthers?: boolean;
  onSubmit: (recipient?: {
    name: string;
    phone: number;
    document: string;
  }) => void;
  loading?: boolean;
};

export const FreeAcquisitionForm = ({
  product,
  canBuyForOthers,
  onSubmit,
  loading,
}: Props) => {
  const [isForOther, setIsForOther] = useState(false);
  const [recipient, setRecipient] = useState({
    name: "",
    phone: 0,
    document: "",
  });

  const handleSubmit = () => {
    if (
      isForOther &&
      (!recipient.name || !recipient.phone || !recipient.document)
    ) {
      Alert.alert("Datos incompletos", "Por favor completa todos los campos");
      return;
    }
    recipient.phone = Number(recipient.phone);
    onSubmit(isForOther ? recipient : undefined);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>
        Este producto es gratuito. Para adquirirlo:
      </Text>

      {product.condition && (
        <Text style={styles.condition}>{product.condition}</Text>
      )}

      {canBuyForOthers && (
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setIsForOther(false)}
            style={[
              styles.toggleButton,
              !isForOther && styles.toggleButtonActive,
            ]}
          >
            <Text
              style={!isForOther ? styles.toggleTextActive : styles.toggleText}
            >
              Es para mí
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsForOther(true)}
            style={[
              styles.toggleButton,
              isForOther && styles.toggleButtonActive,
            ]}
          >
            <Text
              style={isForOther ? styles.toggleTextActive : styles.toggleText}
            >
              Para otra persona
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isForOther && (
        <View style={styles.form}>
          <TextInput
            placeholder="Nombre completo"
            value={recipient.name}
            onChangeText={(v) => setRecipient((r) => ({ ...r, name: v }))}
            style={styles.input}
          />

          <TextInput
            placeholder="Teléfono"
            value={recipient.phone.toLocaleString()}
            keyboardType="phone-pad"
            onChangeText={(v) =>
              setRecipient((r) => ({ ...r, phone: Number(v) }))
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Documento"
            value={recipient.document}
            onChangeText={(v) => setRecipient((r) => ({ ...r, document: v }))}
            style={styles.input}
          />
        </View>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={[styles.button, loading && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>
          {loading ? "Procesando..." : "Adquirir"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  infoText: { fontSize: 16, textAlign: "center", color: colors.text.primary },
  condition: {
    textAlign: "center",
    fontSize: 14,
    color: colors.text.secondary,
    backgroundColor: colors.background.secondary,
    padding: 10,
    borderRadius: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  toggleButtonActive: {
    backgroundColor: colors.brand.orange[500],
    borderColor: colors.brand.orange[500],
  },
  toggleText: { color: colors.text.secondary },
  toggleTextActive: { color: "white", fontWeight: "600" },
  form: { gap: 10 },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#1E90FF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#aaa" },
  buttonText: { color: "white", fontWeight: "bold" },
});
