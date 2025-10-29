import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { CustomInput } from "src/components/shared";
import { useAuth } from "src/context";
import { colors } from "src/design-system";
type Props = {
  product: { id: string };
  canBuyForOthers?: boolean;
  onSubmit: (recipient?: {
    holder_name: string;
    holder_phone: string;
    holder_email: string;
    holder_instagram_tiktok: string;
  }) => void;
  loading?: boolean;
};
export const AdquisitionForm: React.FC<Props> = ({
  canBuyForOthers,
  onSubmit,
  product,
  loading,
}) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    holder_name: "",
    holder_email: "",
    holder_phone: "",
    holder_instagram_tiktok: "",
    event_pass_id: product.id,
  });
  const [isForOther, setIsForOther] = useState(false);
  const handleSubmit = () => {
    if (!isForOther) {
      form.holder_email = user!.email;
      form.holder_name = user!.full_name;
    }
    onSubmit(form);
  };
  return (
    <View style={styles.form}>
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
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              value={form.holder_name}
              onChangeText={(e) => setForm({ ...form, holder_name: e })}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.holder_email}
              onChangeText={(e) => setForm({ ...form, holder_email: e })}
            />
          </View>
        </>
      )}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Teléfono</Text>
        <TextInput
          textContentType="telephoneNumber"
          keyboardType="phone-pad"
          style={styles.input}
          value={form.holder_phone.toLocaleString()}
          onChangeText={(text) => setForm({ ...form, holder_phone: text })}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Instagram</Text>
        <TextInput
          style={styles.input}
          value={form.holder_instagram_tiktok}
          onChangeText={(e) => setForm({ ...form, holder_instagram_tiktok: e })}
        />
      </View>
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
  inputContainer: {
    backgroundColor: "white",
  },
  inputLabel: {},
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
  form: {
    gap: 10,
    width: Platform.OS === "web" ? 600 : "100%",
    alignSelf: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 18,
    marginVertical: 8
  },
  input: {
    backgroundColor: colors.background.secondary,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
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
