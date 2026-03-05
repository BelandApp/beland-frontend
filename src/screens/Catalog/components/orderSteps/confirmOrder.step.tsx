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
import { preOrderType } from "../../hooks";
import { UserAddress } from "src/services";
import { convertUSDToBeCoins } from "src/constants";
import { CartItem } from "src/stores";

type ProcessingStepProps = {
  preOrder: preOrderType | null;
  onSubmit: (address: UserAddress, addressId: string) => void;
  submitStatus: "idle" | "loading" | "success" | "error";
  onCancel: () => void;
};
export const ConfirmOrder: React.FC<ProcessingStepProps> = ({
  preOrder,
  onSubmit,
  onCancel,
  submitStatus,
}) => {
  if (!preOrder) {
    return (
      <View>
        <Text>Tuvimos un problema, recarga la pagina</Text>
      </View>
    );
  }
  const { products, address, addressId } = preOrder;
  const SHIPPING_COST = preOrder.cost;
  const subtotal = products.reduce(
    (s: any, p: CartItem) => s + p.price * p.quantity,
    0,
  );
  const total = (subtotal + SHIPPING_COST).toFixed(2);

  if (submitStatus === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.belandOrange} />
        <Text style={styles.loadingText}>Creando tu orden...</Text>
      </View>
    );
  }

  if (submitStatus === "success") {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons
          name="check-circle"
          size={64}
          color={colors.belandGreen}
        />
        <Text style={styles.loadingText}>¡Orden creada con éxito!</Text>
      </View>
    );
  }

  if (submitStatus === "error") {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="red" />
        <Text style={styles.loadingText}>
          Ocurrió un error al crear la orden
        </Text>
        <Button title="Volver" onPress={onCancel} />
      </View>
    );
  }
  return (
    <View>
      {/* Products Section */}
      <View style={styles.section}>
        <View style={styles.productsWrapper}>
          {products.map((product: CartItem) => (
            <View style={styles.productCard} key={product.id}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{product.name}</Text>
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityText}>x{product.quantity}</Text>
                </View>
              </View>
              <View style={styles.productDetails}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Precio unitario</Text>
                  <Text style={styles.priceValue}>Usd${product.price}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.subtotalLabel}>Subtotal</Text>
                  <Text style={styles.subtotalValue}>
                    Usd${(product.price * product.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Address and Total Row */}
      <View style={styles.infoRow}>
        {/* Delivery Address */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="map-marker"
              size={24}
              color={colors.belandOrange}
            />
            <Text style={styles.sectionTitle}>Dirección de entrega</Text>
          </View>
          <View style={styles.addressContent}>
            {address.addressLine1 && (
              <View style={styles.addressRow}>
                <MaterialCommunityIcons
                  name="home-outline"
                  size={18}
                  color="#666"
                />
                <Text style={styles.addressText}>{address.addressLine1}</Text>
              </View>
            )}
            {address.city && (
              <View style={styles.addressRow}>
                <MaterialCommunityIcons name="city" size={18} color="#666" />
                <Text style={styles.addressText}>
                  {address.city}
                  {address.state ? `, ${address.state}` : ""}
                </Text>
              </View>
            )}
            {address.postalCode && (
              <View style={styles.addressRow}>
                <MaterialCommunityIcons name="mailbox" size={18} color="#666" />
                <Text style={styles.addressText}>
                  C.P: {address.postalCode}
                </Text>
              </View>
            )}
            {address.country && (
              <View style={styles.addressRow}>
                <MaterialCommunityIcons name="earth" size={18} color="#666" />
                <Text style={styles.addressText}>{address.country}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Total Section */}
        <View style={styles.totalCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="receipt"
              size={24}
              color={colors.belandOrange}
            />
            <Text style={styles.sectionTitle}>Resumen</Text>
          </View>
          <View style={styles.totalContent}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Artículos</Text>
              <Text style={styles.totalValue}>
                {products.length} {products.length !== 1 ? "items" : "item"}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>Usd$ {subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Envío</Text>
              <Text style={styles.totalValue}>Usd$ {SHIPPING_COST}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelBold}>Total USD</Text>
              <Text style={styles.totalPrice}>Usd$ {total}</Text>
            </View>
            <View style={styles.becoinsRow}>
              <MaterialCommunityIcons
                name="currency-usd"
                size={20}
                color={colors.belandGreen}
              />
              <Text style={styles.becoinsText}>
                ≈ {convertUSDToBeCoins(total)} Becoins
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  productsWrapper: {
    gap: 12,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.belandGreen,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
  },
  quantityBadge: {
    backgroundColor: colors.belandOrange,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quantityText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  productDetails: {
    gap: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  subtotalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.belandOrange,
  },
  infoRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  infoCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addressContent: {
    gap: 10,
    marginTop: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  totalCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  totalContent: {
    gap: 12,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
  },
  totalValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 4,
  },
  totalLabelBold: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.belandOrange,
  },
  becoinsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  becoinsText: {
    fontSize: 14,
    color: colors.belandGreen,
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  processingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.belandOrange + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
});
