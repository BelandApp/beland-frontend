import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "src/styles";
import { Button } from "src/components";
import { CartProduct } from "src/stores/useCartStore";
import { useState } from "react";
import { DeliveryAddress } from "src/types";
import { preOrderType } from "../../hooks";
type ProcessingStepProps = {
  preOrder: preOrderType | null;
  onSubmit: (address: DeliveryAddress, addressId: string) => void;
  onCancel: () => void;
};
export const ConfirmOrder: React.FC<ProcessingStepProps> = ({
  preOrder,
  onSubmit,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!preOrder) {
    return (
      <View>
        <Text>Tuvimos un problema, recarga la pagina</Text>
      </View>
    );
  }
  const { products, address, addressId } = preOrder;
  const total = products
    .reduce((s: any, p: CartProduct) => s + p.price * p.quantity, 0)
    .toFixed(2);
  const handleSubmit = () => {
    setIsSubmitting(true);
    onSubmit(address, addressId);
  };
  if (isSubmitting) {
    return (
      <View>
        {" "}
        <View style={styles.processingIcon}>
          <MaterialCommunityIcons
            name="truck-check"
            size={36}
            color={colors.belandOrange}
          />
        </View>
        <ActivityIndicator
          size="large"
          color={colors.belandOrange}
          style={{ marginVertical: 12 }}
        />
        <Text>Creando tu orden...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Tu orden:</Text>
        <View>
          <Text style={styles.subtitle}>Dirección de entrega:</Text>
          <Text style={styles.detailText}>
            {address.street}, {address.city}, {address.state} -{" "}
            {address.zipCode}
          </Text>
        </View>
        <Text style={styles.detailText}>
          {products.length} artículo{products.length !== 1 ? "s" : ""} • Total:
          $ {total}
        </Text>
        <View
          style={{
            flexDirection: "row",
            marginTop: 8,
            marginHorizontal: "auto",
            gap: 12,
          }}
        >
          <Button title="Volver" onPress={onCancel} variant="ghost" />
          <Button onPress={handleSubmit} title="Confirmar" />
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {padding: 16, gap: 8},
  processingIcon: {},
  title: {fontSize: 18, fontWeight: "bold", marginBottom: 8},
  subtitle: {},
  detailText: {fontSize: 16},
});
