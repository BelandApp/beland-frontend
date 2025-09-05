import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";
import { Resource } from "../../../types/resource";
import { calculateResourcePrice } from "../../../utils/priceHelpers";
import {
  convertBeCoinsToUSD,
  formatUSDPrice,
  formatBeCoins,
  CURRENCY_CONFIG,
} from "../../../constants/currency";

interface PurchaseModalProps {
  visible: boolean;
  resource: Resource | null;
  userBalance: number;
  onConfirm: (quantity: number) => Promise<void>;
  onCancel: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  visible,
  resource,
  userBalance,
  onConfirm,
  onCancel,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!resource) return null;

  // Calcular precio con descuento usando la utilidad
  const priceCalc = calculateResourcePrice(resource);

  const totalPrice = priceCalc.finalPrice * quantity;
  const hasEnoughBalance = userBalance >= totalPrice;
  const maxQuantity = Math.min(
    resource.resource_quanity,
    Math.floor(userBalance / priceCalc.finalPrice)
  );

  const handleConfirm = async () => {
    // Validaciones completas antes de proceder
    if (quantity <= 0) {
      console.warn("Cantidad debe ser mayor a 0");
      return;
    }

    if (quantity > resource.resource_quanity) {
      console.warn("Cantidad excede el stock disponible");
      return;
    }

    if (quantity > maxQuantity) {
      console.warn("Cantidad excede el máximo permitido por saldo");
      return;
    }

    if (!hasEnoughBalance) {
      console.warn("Saldo insuficiente para la compra");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(quantity);
      setQuantity(1);
    } finally {
      setLoading(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, Platform.OS === "web" && styles.modalWeb]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Confirmar compra</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Resource Info */}
          <View style={styles.resourceInfo}>
            <View style={styles.resourceImage}>
              {resource.resource_img ? (
                <Image
                  source={{ uri: resource.resource_img }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>Sin imagen</Text>
                </View>
              )}
            </View>
            <View style={styles.resourceDetails}>
              <Text style={styles.resourceName}>{resource.resource_name}</Text>
              <View style={styles.priceContainer}>
                {priceCalc.hasDiscount && (
                  <View style={{ marginBottom: 8 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        marginBottom: 4,
                      }}
                    >
                      Precio original:
                    </Text>
                    <Text style={styles.originalPrice}>
                      {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                      {formatUSDPrice(
                        convertBeCoinsToUSD(priceCalc.originalPrice)
                      )}{" "}
                      c/u
                    </Text>
                    <Text
                      style={[
                        styles.becoinsReference,
                        { textDecorationLine: "line-through" },
                      ]}
                    >
                      ({formatBeCoins(priceCalc.originalPrice)} c/u)
                    </Text>
                  </View>
                )}
                <View style={{ marginBottom: 8 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: priceCalc.hasDiscount
                        ? colors.primary
                        : colors.textSecondary,
                      marginBottom: 4,
                      fontWeight: priceCalc.hasDiscount ? "600" : "normal",
                    }}
                  >
                    {priceCalc.hasDiscount ? "Tu precio:" : "Precio:"}
                  </Text>
                  <Text style={styles.resourcePrice}>
                    {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                    {formatUSDPrice(
                      convertBeCoinsToUSD(priceCalc.finalPrice)
                    )}{" "}
                    c/u
                  </Text>
                  <Text style={styles.becoinsReference}>
                    ({formatBeCoins(priceCalc.finalPrice)} c/u)
                  </Text>
                </View>
                {priceCalc.hasDiscount && (
                  <View style={styles.savingsContainer}>
                    <Text style={styles.discountBadge}>
                      -{priceCalc.discount}% OFF
                    </Text>
                    <Text style={styles.savingsText}>
                      Ahorras {formatBeCoins(Math.round(priceCalc.savings))} por
                      unidad
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.resourceStock}>
                Stock disponible: {resource.resource_quanity}
              </Text>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Cantidad</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={decrementQuantity}
                style={[
                  styles.quantityButton,
                  quantity <= 1 && styles.quantityButtonDisabled,
                ]}
                disabled={quantity <= 1}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.quantityInput}
                value={quantity.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  if (num >= 1 && num <= maxQuantity) {
                    setQuantity(num);
                  }
                }}
                keyboardType="numeric"
                maxLength={3}
              />

              <TouchableOpacity
                onPress={incrementQuantity}
                style={[
                  styles.quantityButton,
                  quantity >= maxQuantity && styles.quantityButtonDisabled,
                ]}
                disabled={quantity >= maxQuantity}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total:</Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.summaryValue}>
                  {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                  {formatUSDPrice(convertBeCoinsToUSD(totalPrice))}
                </Text>
                <Text style={styles.becoinsReference}>
                  ({formatBeCoins(totalPrice)})
                </Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tu saldo:</Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={[
                    styles.summaryValue,
                    !hasEnoughBalance && styles.insufficientBalance,
                  ]}
                >
                  {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                  {formatUSDPrice(convertBeCoinsToUSD(userBalance))}
                </Text>
                <Text style={styles.becoinsReference}>
                  ({formatBeCoins(userBalance)})
                </Text>
              </View>
            </View>
            {!hasEnoughBalance && (
              <Text style={styles.errorText}>Saldo insuficiente</Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                styles.confirmButton,
                (!hasEnoughBalance || loading) && styles.confirmButtonDisabled,
              ]}
              disabled={!hasEnoughBalance || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  Comprar {quantity > 1 ? `(${quantity})` : ""}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalWeb: {
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  resourceInfo: {
    flexDirection: "row",
    marginBottom: 20,
  },
  resourceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.belandGreenLight,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: colors.background,
    fontSize: 10,
    textAlign: "center",
  },
  resourceDetails: {
    flex: 1,
    justifyContent: "center",
  },
  resourceName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  resourcePrice: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
    marginBottom: 2,
  },
  becoinsReference: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginBottom: 4,
  },
  resourceStock: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quantitySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  quantityButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: "600",
  },
  quantityInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    color: colors.textPrimary,
    marginHorizontal: 16,
    backgroundColor: colors.cardBackground,
  },
  summary: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  insufficientBalance: {
    color: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  confirmButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.textSecondary,
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  discountBadge: {
    fontSize: 10,
    color: colors.background,
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    fontWeight: "600",
  },
  savingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
  },
  savingsText: {
    fontSize: 11,
    color: colors.belandOrange,
    fontWeight: "600",
    marginLeft: 8,
    fontStyle: "italic",
  },
});
