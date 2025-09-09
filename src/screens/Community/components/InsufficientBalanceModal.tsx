import React from "react";
import { View, Text, Modal, TouchableOpacity, Platform } from "react-native";
import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";
import {
  convertBeCoinsToUSD,
  formatUSDPrice,
  formatBeCoins,
  CURRENCY_CONFIG,
} from "../../../constants/currency";

interface InsufficientBalanceModalProps {
  visible: boolean;
  userBalance: number;
  requiredAmount: number;
  onRecharge: () => void;
  onCancel: () => void;
}

export const InsufficientBalanceModal: React.FC<
  InsufficientBalanceModalProps
> = ({ visible, userBalance, requiredAmount, onRecharge, onCancel }) => {
  const shortfall = requiredAmount - userBalance;

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
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>💳</Text>
            </View>
            <Text style={styles.title}>Saldo insuficiente</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.message}>
              No tienes suficientes BeCoins para completar esta compra.
            </Text>

            {/* Balance Info */}
            <View style={styles.balanceInfo}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Tu saldo actual:</Text>
                <View style={styles.balanceValueContainer}>
                  <Text style={styles.currentBalance}>
                    {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                    {formatUSDPrice(convertBeCoinsToUSD(userBalance))}
                  </Text>
                  <Text style={styles.becoinsReference}>
                    ({formatBeCoins(userBalance)})
                  </Text>
                </View>
              </View>

              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Necesitas:</Text>
                <View style={styles.balanceValueContainer}>
                  <Text style={styles.requiredBalance}>
                    {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                    {formatUSDPrice(convertBeCoinsToUSD(requiredAmount))}
                  </Text>
                  <Text style={styles.becoinsReference}>
                    ({formatBeCoins(requiredAmount)})
                  </Text>
                </View>
              </View>

              <View style={[styles.balanceRow, styles.shortfallRow]}>
                <Text style={styles.shortfallLabel}>Te faltan:</Text>
                <View style={styles.balanceValueContainer}>
                  <Text style={styles.shortfallAmount}>
                    {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                    {formatUSDPrice(convertBeCoinsToUSD(shortfall))}
                  </Text>
                  <Text style={styles.becoinsReference}>
                    ({formatBeCoins(shortfall)})
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.suggestion}>
              Recarga tu cuenta para poder completar esta compra.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Aceptar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onRecharge}
              style={styles.rechargeButton}
            >
              <Text style={styles.rechargeButtonText}>Ir a recargar</Text>
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
    padding: 24,
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
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.error + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
  content: {
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  balanceInfo: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  shortfallRow: {
    borderTopWidth: 1,
    borderTopColor: colors.textSecondary + "30",
    paddingTop: 12,
    marginBottom: 0,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  shortfallLabel: {
    fontSize: 14,
    color: colors.error,
    fontWeight: "500",
  },
  balanceValueContainer: {
    alignItems: "flex-end",
  },
  currentBalance: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  requiredBalance: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  shortfallAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.error,
  },
  becoinsReference: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  suggestion: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
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
  rechargeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  rechargeButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
});
