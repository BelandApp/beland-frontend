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
export const HeaderSteps: React.FC<headerStepsType> = ({
  step,
  onBack,
  setStep,
}) => {
  return (
    <View style={styles.header}>
      {step !== "select" && (
        <Button
          title="cerrar"
          variant="onlyIcon"
          icon={<ArrowLeft color={colors.belandOrange} />}
          onPress={() => setStep("select")}
        />
      )}
      {step === "select" && (
        <MaterialCommunityIcons
          name="truck-delivery"
          size={32}
          color={colors.belandOrange}
        />
      )}
      <Text style={styles.title}>
        {step === "select"
          ? "Dirección de entrega"
          : step === "form"
            ? "Nueva dirección"
            : step === "processing"
              ? "Confirmar pedido"
              : ""}
      </Text>
    </View>
  );
};
