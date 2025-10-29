import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { colors } from "src/design-system";

type Props = {
  method: string;
  onSelect: (m: string) => void;
  canEditAmount?: boolean;
  customAmount: string;
  onChangeAmount: (value: string) => void;
  onConfirm: () => void;
  loading: boolean;
};
export enum PaymentMethod {
  Tarjetas = "Tarjetas",
  BeCoins = "BeCoins",
  Transferencia = "Transferencia",
}
export const methods = ["Tarjetas", "BeCoins", "Transferencia"];

export const PaymentMethodsSelector = ({
  method,
  onSelect,
  canEditAmount,
  customAmount,
  onChangeAmount,
  onConfirm,
  loading,
}: Props) => (
  <View style={styles.container}>
    {canEditAmount && (
      <TextInput
        value={customAmount}
        onChangeText={onChangeAmount}
        keyboardType="numeric"
        style={styles.input}
      />
    )}

    <Text style={styles.label}>Método de pago:</Text>
    <View style={styles.methodContainer}>
      {methods.map((m) => (
        <TouchableOpacity key={m} onPress={() => onSelect(m)}>
          <Text style={[styles.method, method === m && styles.methodActive]}>
            {m}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    <TouchableOpacity
      onPress={onConfirm}
      disabled={loading}
      style={[styles.button, loading && styles.buttonDisabled]}
    >
      <Text style={styles.buttonText}>
        {loading ? "Procesando..." : "Confirmar método"}
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: Platform.OS === "web" ? 600 : "100%",
    alignSelf: "center",
    padding: 16,
    backgroundColor: colors.background.primary,
    borderRadius: 32,
    gap: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  label: { marginTop: 8 },
  methodContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  method: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    color: "#777",
    fontWeight: "600",
  },
  methodActive: { backgroundColor: colors.brand.orange[500], color: "white" },
  button: {
    backgroundColor: "#1E90FF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#aaa" },
  buttonText: { color: "white", fontWeight: "bold" },
});
