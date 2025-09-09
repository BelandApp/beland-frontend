import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import { useCartStore } from "../../../stores/useCartStore";
import {
  convertUSDToBeCoins,
  formatBeCoins,
  formatUSDPrice,
  CURRENCY_CONFIG,
} from "../../../constants/currency";

interface CartBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onCheckout?: () => void;
}

export const CartBottomSheet: React.FC<CartBottomSheetProps> = ({
  visible,
  onClose,
  onCheckout,
}) => {
  const {
    products,
    removeProduct,
    removeProductFromServer,
    updateQuantity,
    updateQuantityOnServer,
    clearCart,
  } = useCartStore();
  const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const handleRemoveProduct = async (productId: string) => {
    try {
      const success = await removeProductFromServer(productId);
      if (!success) {
        console.log(
          "⚠️ CartBottomSheet: Could not remove from server, but removed locally"
        );
      }
    } catch (error) {
      console.error("❌ CartBottomSheet: Error removing product:", error);
      // En caso de error, aún eliminar localmente
      removeProduct(productId);
    }
  };

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    try {
      const success = await updateQuantityOnServer(productId, newQuantity);
      if (!success) {
        console.log(
          "⚠️ CartBottomSheet: Could not update quantity on server, but updated locally"
        );
      }
    } catch (error) {
      console.error("❌ CartBottomSheet: Error updating quantity:", error);
      // En caso de error, aún actualizar localmente
      updateQuantity(productId, newQuantity);
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
      onSwipeComplete={onClose}
      propagateSwipe
    >
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Carrito</Text>
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clear}>Vaciar</Text>
          </TouchableOpacity>
        </View>

        <View style={{ maxHeight: 400, minHeight: 100 }}>
          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tu carrito está vacío</Text>
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.itemRow}>
                  {item.image && (
                    <Image source={{ uri: item.image }} style={styles.image} />
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View>
                      <Text style={styles.itemPrice}>
                        {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                        {formatUSDPrice(item.price)}
                      </Text>
                      <Text style={styles.itemPriceBecoins}>
                        {formatBeCoins(convertUSDToBeCoins(item.price))}
                      </Text>
                    </View>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        onPress={() =>
                          handleUpdateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                      >
                        <Text style={styles.qtyBtn}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qty}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Text style={styles.qtyBtn}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveProduct(item.id)}
                  >
                    <Text style={styles.remove}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 12 }}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
        <View style={styles.footer}>
          <View>
            <Text style={styles.total}>
              Total: {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
              {formatUSDPrice(total)}
            </Text>
            <Text style={styles.totalBecoins}>
              {formatBeCoins(convertUSDToBeCoins(total))}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.checkoutBtn,
              products.length === 0 && { backgroundColor: "#ccc" },
            ]}
            disabled={products.length === 0}
            onPress={onCheckout}
          >
            <Text style={styles.checkoutText}>Finalizar compra</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    minHeight: 200,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  clear: { color: "#FF6B35", fontWeight: "600" },
  emptyContainer: { alignItems: "center", padding: 32 },
  emptyText: { color: "#888", fontSize: 16 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 8,
  },
  image: { width: 48, height: 48, borderRadius: 8, marginRight: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontWeight: "600", fontSize: 16 },
  itemPrice: { color: "#888", fontSize: 14 },
  itemPriceBecoins: {
    color: "#999",
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 2,
  },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  qtyBtn: {
    fontSize: 20,
    width: 28,
    height: 28,
    textAlign: "center",
    borderRadius: 14,
    backgroundColor: "#eee",
    color: "#FF6B35",
    marginHorizontal: 4,
  },
  qty: { fontSize: 16, fontWeight: "bold", marginHorizontal: 4 },
  remove: { color: "#FF6B35", fontSize: 20, marginLeft: 8 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  total: { fontSize: 18, fontWeight: "bold" },
  totalBecoins: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 2,
  },
  checkoutBtn: {
    backgroundColor: "#FF6B35",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  checkoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
