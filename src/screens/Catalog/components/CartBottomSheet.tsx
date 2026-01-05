import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import Modal from "react-native-modal";
import { useUserBalance } from "../../../hooks/useUserBalance";
import {
  convertUSDToBeCoins,
  formatBeCoins,
  formatUSDPrice,
  CURRENCY_CONFIG,
} from "@/constants";
import { InsufficientBalanceModal } from "../../Community/components";
import { useNotify } from "@/hooks";
import { getBackendErrorMessage } from "src/services";
import { Button, toastConfig } from "src/components";
import { ArrowDown } from "lucide-react-native";
import { colors } from "src/styles";
import { useCartStore } from "@/stores";
import Toast from "react-native-toast-message";
import { useAuth } from "src/context";
import WarpperModal from "src/components/shared/modals/wrapperModal";
import { GroupOrderButton } from "../../../components/buttons/GroupOrderButton";

interface CartBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onCheckout?: () => void;
  onNavigateToRecharge?: () => void;
}

export const CartBottomSheet: React.FC<CartBottomSheetProps> = ({
  visible,
  onClose,
  onCheckout,
  onNavigateToRecharge,
}) => {
  const { isAuthenticated, handleAuth0Login, user } = useAuth();
  const {
    items,
    removeProduct,
    updateQuantity,
    clearCart,
    totalUSD,
    totalBecoins,
    syncCart,
  } = useCartStore();
  const notify = useNotify();
  const { balance } = useUserBalance();
  const [insufficientModalVisible, setInsufficientModalVisible] =
    useState(false);

  useEffect(() => {
    if (user) syncCart();
  }, [user]);
  const handleRemoveProduct = async (productId: string) => {
    try {
      removeProduct(productId);
      notify.success({ message: "Producto eliminado del carrito" });
      if (items.length <= 1) onClose();
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
    }
  };

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    try {
      updateQuantity(productId, newQuantity);
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
    }
  };
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemRow}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <View>
          <Text style={styles.itemPrice}>
            {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
            {formatUSDPrice(item.price)}
          </Text>
          <Text style={styles.itemPriceBecoins}>
            {formatBeCoins(convertUSDToBeCoins(item.price))}
          </Text>
        </View>
      </View>

      <View style={styles.qtyContainer}>
        <Text style={{ fontSize: 10, color: "#666" }}>Cantidad</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() =>
              handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
            }
          >
            <Text style={styles.qtyBtn}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qty}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.qtyBtn}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleRemoveProduct(item.id)}
        style={styles.removeContainer}
      >
        <Text style={styles.remove}>✕</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <>
      <WarpperModal
        isOpen={visible}
        onClose={onClose}
        header={
          <View style={styles.header}>
            <Text style={styles.title}>Carrito</Text>
            <Button
              title="Vaciar"
              variant="secondary"
              onPress={clearCart}
              disabled={items.length === 0}
              style={{ marginLeft: "auto" }}
            />
          </View>
        }
        content={
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            // Importante: esto permite que el modal no se cierre
            // accidentalmente mientras scrolleas la lista
            bounces={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tu carrito está vacío</Text>
              </View>
            }
          />
        }
        actions={
          <View>
            <View style={styles.groupOrderButtonContainer}>
              <GroupOrderButton
                disabled={
                  items.length === 0 ||
                  (balance || 0) < totalBecoins() ||
                  !isAuthenticated
                }
                onOrderCreated={(orderId) => {
                  // Aquí puedes hacer lo que necesites después de crear la orden
                  onClose();
                  clearCart();
                  notify.success({
                    message: `Orden de grupo #${orderId} creada exitosamente`,
                  });
                }}
              />
            </View>
            <View style={styles.footer}>
              <View>
                <Text style={styles.total}>
                  Total: {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                  {formatUSDPrice(totalUSD())}
                </Text>
                <Text style={styles.totalBecoins}>
                  {formatBeCoins(totalBecoins())}
                </Text>
              </View>
              <Button
                title="Finalizar compra"
                disabled={items.length === 0}
                onPress={() => {
                  if (!isAuthenticated) {
                    notify.confirm({
                      message: "Debes iniciar sesión para comprar",
                      onConfirm: () => handleAuth0Login(),
                    });
                    return;
                  }

                  if ((balance || 0) < totalBecoins()) {
                    setInsufficientModalVisible(true);
                    return;
                  }
                  onCheckout && onCheckout();
                }}
              />{" "}
            </View>{" "}
          </View>
        }
      />

      {/* Modal de saldo insuficiente reutilizable */}
      <InsufficientBalanceModal
        visible={insufficientModalVisible}
        userBalance={balance || 0}
        requiredAmount={totalBecoins()}
        onRecharge={() => {
          setInsufficientModalVisible(false);
          onClose();
          onNavigateToRecharge && onNavigateToRecharge();
        }}
        onCancel={() => setInsufficientModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  clear: { color: "#FF6B35", fontWeight: "600" },
  emptyContainer: { alignItems: "center", padding: 32 },
  itemContainer: {
    justifyContent: "flex-start",
    minHeight: 100,
    marginBottom: "auto",
  },
  emptyText: { color: "#888", fontSize: 16 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    height: 90,
    overflow: "hidden",
  },
  image: { width: 48, height: 48, borderRadius: 8, marginRight: 10 },
  itemInfo: { flex: 1, paddingVertical: 10, paddingLeft: 10 },
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
  qtyContainer: {
    alignItems: "center",
  },

  groupOrderButtonContainer: {
    marginBottom: 12,
  },

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
  remove: { color: "#f9f4f3ff", fontSize: 20, marginHorizontal: 10 },
  removeContainer: {
    backgroundColor: "#6BA43A",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
});
