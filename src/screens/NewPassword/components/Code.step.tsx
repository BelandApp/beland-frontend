import { CustomInput } from "src/components/shared";
import { View, Text, TouchableHighlight, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { CodeStepProps } from "src/types";
import { Button } from "@components/shared";
import { useValidation } from "src/hooks/form/useValidation";
const CodeStep: React.FC<CodeStepProps> = ({
  FormData,
  onSubmit,
  onResendCode,
  onStepBack,
  isLoading
}) => {
  const [code, setCode] = useState("");
  const [count, setCount] = useState<number>(50);
  const {validateForm, errors}=useValidation()
  setTimeout(() => {
    if (count > 0) {
      setCount(count - 1);
    }
  }, 1000);

  const handleSubmit = () => {
    const isValid = validateForm({ code });
    if(!isValid) return
    onSubmit(code);
  }
  const handleResendCode = () => {
    onResendCode();
    setCount(150);
  }
  return (
    <View>
      <Text style={{ marginBottom: 5, color: "#ffffffaa" }}>
        Introduce el código enviado a tu mail: {FormData.email}
      </Text>
      <CustomInput
        label="Código"
        onChangeText={(text) => setCode(text)}
        value={code}
        maxLength={6}
        keyboardType="numeric"
        error={errors.code}
        onBlur={()=>{validateForm({ code })}}
      />
      <View style={styles.rowContainer}>
        <Button
          title="Volver"
          onPress={onStepBack}
          variant="primary"
          style={{ paddingLeft: 0 }}
        />
        <Button
          title="Confirmar"
          onPress={handleSubmit}
          variant="secondary"
          disabled={!code}
          isLoading={isLoading}
        />
      </View>
      <View style={[styles.rowContainer, styles.footerContainer]}>
        <Text style={styles.secondaryText}>
          ¿No recibiste el código? {""}
          {count > 0 && count}
        </Text>
        <Button
          title="Reenviar"
          onPress={handleResendCode}
          variant="primary"
          disabled={count != 0}
          style={{ marginRight: "auto ", paddingLeft: 0 }}
          isLoading={isLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  footerContainer: {
    marginTop: 8,
    width: "80%",
    gap: 10,
  },
  text: {},
  secondaryText: {
    color: "#ffffffaa",
  },
});
export default CodeStep;
