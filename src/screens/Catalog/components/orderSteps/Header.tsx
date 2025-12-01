

import { ArrowDown, ArrowLeft } from "lucide-react-native";
import { View, Text } from "react-native";
import { OrderDeliveryModalStyles as styles } from "./styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "src/styles";
import { Button } from "src/components";
import { Dispatch, SetStateAction } from "react";
import { DeliveryStep } from "../../hooks";
type headerStepsType = {
  step: string;
  setStep: Dispatch<SetStateAction<DeliveryStep>>;
  onBack: () => void;
};
export const HeaderSteps: React.FC<headerStepsType> = ({step, onBack, setStep}) => {
  return (
    <View style={styles.header}>
      <MaterialCommunityIcons
        name="truck-delivery"
        size={32}
        color={colors.belandOrange}
      />
      <Text style={styles.title}>
        {step === "select"
          ? "Seleccionar dirección de entrega"
          : step === "form"
          ? "Nueva dirección de entrega"
          : step === "processing"
          ? "Confirmar pedido"
          : ""}
      </Text>
      <Button
        title="cerrar"
        variant="onlyIcon"
        icon={
          step === "form" ? (
            <ArrowLeft color={colors.belandOrange} />
          ) : (
            <ArrowDown color={colors.belandOrange} />
          )
        }
        onPress={() => (step === "form" ? setStep("select") : onBack())}
      />
    </View>
  );
};
