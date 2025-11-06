import { CustomInput } from "src/components/shared";
import { View, Text, TouchableHighlight, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { CodeStepProps } from "src/types";
import ThemedButton from "src/components/shared/buttons/Themed.button";
import { colors } from "src/styles";
const CodeStep: React.FC<CodeStepProps> = ({
  onSubmit,
  onResendCode,
  onStepBack,
  isLoading
}) => {
  const [code, setCode] = useState("");
  const [count, setCount] = useState<number>(50);
  setTimeout(() => {
    if (count > 0) {
      setCount(count - 1);
    }
  }, 1000);

  const handleResendCode = () => {
    onResendCode();
    setCount(50);
  }
  return (
    <View>
      <Text style={{ marginBottom: 5, color: "#ffffffaa" }}>
        Introduce el código enviado a tu mail
      </Text>
      <CustomInput
        label="Código"
        onChangeText={(text) => setCode(text)}
        value={code}
        maxLength={6}
      />
      <View style={styles.rowContainer}>
        <ThemedButton
          label="Volver"
          onPress={onStepBack}
          variant="primary"
          style={{ paddingLeft: 0 }}
        />
        <ThemedButton
          label="Siguiente"
          onPress={() => onSubmit(code)}
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
        <ThemedButton
          label="Reenviar"
          onPress={handleResendCode}
          variant="primary"
          disabled={count != 0}
          style={{ margin: 0, paddingLeft: 0 }}
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
