import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "src/styles";
import { Button } from "src/components";
import { useState } from "react";
import { preOrderType } from "../../hooks";
import { UserAddress } from "src/services";
import { convertUSDToBeCoins } from "src/constants";
import { CartItem } from "src/stores";
type ProcessingStepProps = {
  preOrder: preOrderType | null;
  onSubmit: (address: UserAddress, addressId: string) => void;
  onCancel: () => void;
};
export const ConfirmOrder: React.FC<ProcessingStepProps> = ({
  preOrder,
  onSubmit,
  onCancel,
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
    .reduce((s: any, p: CartItem) => s + p.price * p.quantity, 0)
    .toFixed(2);
  const handleSubmit = () => {
    setIsSubmitting(true);
    onSubmit(address, addressId);
  };
  if (isSubmitting) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
  const isMobile = Dimensions.get("window").width <= 600;
  return (
    <ScrollView contentContainerStyle={[styles.container, isMobile ? null : {flexGrow: 1}]}>
      <View style={styles.cards}>
        <Text style={styles.title}>Tu orden:</Text>
        <View style={styles.productsWrapper}>
          {products.map((product: CartItem) => (
            <View style={styles.product} key={product.id}>
              <Text style={styles.productTitle}>{product.name}</Text>
              <Text>Precio Unitario: Usd${product.price}</Text>
              <Text>Cantidad: {product.quantity}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.cards}>
          <Text style={styles.title}>Dirección de entrega:</Text>
          <Text>Calle: {address.addressLine1}</Text>
          <Text>Ciudad: {address.city}</Text>
          <Text>Estado/Provincia: {address.state}</Text>
          <Text>C.P: {address.postalCode}</Text>
        </View>
        <View style={styles.cards}>
          <Text style={styles.title}>Totales:</Text>
          <Text style={styles.detailText}>
            {products.length} artículo{products.length !== 1 ? "s" : ""}
          </Text>
          <Text style={styles.price}>
            Usd$ {total} ~ Becoins: {convertUSDToBeCoins(total)}
          </Text>
        </View>
      </View>
      <View
        style={{
          paddingTop: 12,
          marginHorizontal: "auto",
          flexDirection: "row",
          gap: 12,
        }}
      >
        <Button title="Volver" onPress={onCancel} variant="ghost" />
        <Button onPress={handleSubmit} title="Confirmar" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    justifyContent: "space-between",
  },
  row: {
    flexDirection: Dimensions.get("window").width > 600 ? "row" : "column",
    justifyContent: "space-between",
    gap: 30,
  },
  productsWrapper: {
    flexDirection: Dimensions.get("window").width > 600 ? "row" : "column",
    flexWrap: "wrap",
    gap: 12,
    width: "100%",
    overflow: "scroll",
  },
  processingIcon: {},
  product: {
    borderColor: colors.belandGreen,
    borderBottomWidth: 2,
    borderTopWidth: 2,
    borderRadius: 5,
    padding: 8,
    width: Dimensions.get("window").width > 600 ? "48%" : "100%",
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  cards: {
    flexDirection: "column",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  price: { fontSize: 18, fontWeight: "bold", color: colors.belandOrange },
  subtitle: {},
  detailText: { fontSize: 16 },
});
