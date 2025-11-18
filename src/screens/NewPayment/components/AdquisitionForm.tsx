import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
} from "react-native";
import { Button, CustomLoader } from "src/components";
import { useAuth } from "src/context";
import { colors } from "src/design-system";
import { useCustomNavigation } from "src/hooks";
import { notify } from "src/hooks/notification/notify.external";
type Props = {
  Form: any;
  setForm: any;
  canPurchase: boolean;
  onSubmit: () => void;
  canBuyForOthers?: boolean;
  loading?: boolean;
};
export const AdquisitionForm: React.FC<Props> = ({
  Form,
  setForm,
  canBuyForOthers,
  loading,
  canPurchase,
  onSubmit
}) => {
  const { user } = useAuth();
  const {navigate} =useCustomNavigation()
  const [isForOther, setIsForOther] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const handleSubmit = () => {
    if (!isForOther) {
      Form.holder_email = user!.email;
      Form.holder_name = user!.full_name;
    }
    if (
      !Form.holder_name ||
      !Form.holder_email ||
      !Form.holder_phone ||
      !Form.holder_instagram_tiktok
    ) {
      notify.error({ message: "Todos los campos son obligatorios" });
      return;
    }
    onSubmit()
    setIsSaved(true);
  };
  const handleRrecharge = () => {
    navigate("RechargeScreen")
  }
  return isSaved ? (
    <View style={styles.form}>
      <Text>Comprando para:</Text>
      <View style={styles.toggleContainer}>
        <Text>{Form.holder_name}</Text>
        <Text>Email: {Form.holder_email}</Text>
      </View>
     <CustomLoader/>
    </View>
  ) : (
    <View style={styles.form}>
      {canBuyForOthers && (
        <View style={styles.toggleContainer}>
          <Text>La entrada es: </Text>
          <Button
            title={"Para mi"}
            onPress={() => setIsForOther(false)}
            variant={isForOther ? "inline" : "primary"}
          />
          <Button
            title={"Para otro"}
            onPress={() => setIsForOther(true)}
            variant={!isForOther ? "inline" : "primary"}
          />
        </View>
      )}
      {isForOther && (
        <>
          <View style={styles.inputContainer}>
            <Text>Nombre completo</Text>
            <TextInput
              style={styles.input}
              value={Form.holder_name}
              onChangeText={(e) => setForm({ ...Form, holder_name: e })}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text>Email</Text>
            <TextInput
              style={styles.input}
              value={Form.holder_email}
              onChangeText={(e) => setForm({ ...Form, holder_email: e })}
            />
          </View>
        </>
      )}
      <View style={styles.inputContainer}>
        <Text>Teléfono</Text>
        <TextInput
          textContentType="telephoneNumber"
          keyboardType="phone-pad"
          style={styles.input}
          value={Form.holder_phone.toLocaleString()}
          onChangeText={(text) => setForm({ ...Form, holder_phone: text })}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text>Instagram</Text>
        <TextInput
          style={styles.input}
          value={Form.holder_instagram_tiktok}
          onChangeText={(e) => setForm({ ...Form, holder_instagram_tiktok: e })}
        />
      </View>
      <Button
        title={canPurchase ? "Comprar" : "Fondos insuficientes, recargar"}
        onPress={canPurchase ? handleSubmit : handleRrecharge}
        isLoading={loading}
      />
      <Text style={{ textAlign: "center", fontSize: 12, fontStyle: "italic" }}>
        Se usará tus becoins
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: "white",
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 16,
    marginVertical: 10,
    alignItems:"center"
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
    width: "90%",
    maxWidth: 600,
    alignSelf: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 18,
    marginVertical: 8,
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
