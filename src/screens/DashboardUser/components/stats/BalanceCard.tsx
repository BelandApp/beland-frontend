import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Wallet, DollarSign, TrendingUp } from "lucide-react-native";

interface BalanceCardProps {
  beCoinsBalance: number;
  usdBalance: number;
  locked?: number;
  lockedUSD?: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  beCoinsBalance,
  usdBalance,
  locked = 0,
  lockedUSD = 0,
}) => {
  // Asegurar que todos los valores sean números
  const bcBalance = Number(beCoinsBalance) || 0;
  const usdBal = Number(usdBalance) || 0;
  const lockedBC = Number(locked) || 0;
  const lockedUsd = Number(lockedUSD) || 0;

  const availableBC = bcBalance - lockedBC;
  const availableUSD = usdBal - lockedUsd;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Wallet size={20} color="#FF6B35" />
        <Text style={styles.title}>Mi Balance</Text>
      </View>

      {/* Balance Principal */}
      <View style={styles.mainBalance}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Balance Total</Text>
          <View style={styles.balanceValues}>
            <Text style={styles.balanceBC}>{bcBalance.toFixed(0)} BC</Text>
            <Text style={styles.balanceUSD}>${usdBal.toFixed(2)} USD</Text>
          </View>
        </View>

        {lockedBC > 0 && (
          <>
            <View style={styles.divider} />

            {/* Balance Bloqueado */}
            <View style={styles.balanceRow}>
              <View style={styles.labelWithIcon}>
                <Text style={styles.subBalanceLabel}>Bloqueado</Text>
                <Text style={styles.subBalanceHint}>
                  (en órdenes pendientes)
                </Text>
              </View>
              <View style={styles.balanceValues}>
                <Text style={styles.subBalanceBC}>
                  {lockedBC.toFixed(0)} BC
                </Text>
                <Text style={styles.subBalanceUSD}>
                  ${lockedUsd.toFixed(2)} USD
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Balance Disponible */}
            <View style={styles.balanceRow}>
              <View style={styles.labelWithIcon}>
                <Text style={styles.subBalanceLabel}>Disponible</Text>
              </View>
              <View style={styles.balanceValues}>
                <Text style={styles.availableBC}>
                  {availableBC.toFixed(0)} BC
                </Text>
                <Text style={styles.availableUSD}>
                  ${availableUSD.toFixed(2)} USD
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  mainBalance: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  balanceValues: {
    alignItems: "flex-end",
  },
  balanceBC: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  balanceUSD: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  labelWithIcon: {
    flexDirection: "column",
  },
  subBalanceLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  subBalanceHint: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  subBalanceBC: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
  },
  subBalanceUSD: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999",
    marginTop: 2,
  },
  availableBC: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  availableUSD: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4CAF50",
    marginTop: 2,
  },
  footer: {
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
  },
});
