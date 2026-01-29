import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { Ionicons } from "@expo/vector-icons";
import { useCustomNavigation } from "src/hooks";

interface HeroSectionProps {
  balance: number;
  locked_balance?: number;
  estimatedValue: string;
  isLoading: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  balance,
  locked_balance,
  estimatedValue,
  isLoading,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const { navigate } = useCustomNavigation();
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0F172A", "#1E293B", "#0F172A"]} // Dark premium gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative Background Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardSubtitle}>Balance Total</Text>
            <TouchableOpacity
              onPress={() => setShowBalance(!showBalance)}
              style={styles.eyeButton}
            >
              {showBalance ? (
                <Ionicons name="eye-outline" size={16} color="#94A3B8" />
              ) : (
                <Ionicons name="eye-off-outline" size={16} color="#94A3B8" />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => navigate("Wallet")}
            style={styles.logoContainer}
          >
            <Ionicons name="wallet-outline" size={20} color="#F97316" />
            <Text style={styles.logoText}>Beland Wallet</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <Text style={styles.balanceAmount}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : showBalance ? (
              estimatedValue.replace("$", "")
            ) : (
              "****"
            )}
          </Text>
          <Text style={styles.currencyLabel}>USD</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.footerContainer}>
          {/* BeCoins Balance */}
          <View style={styles.footerItem}>
            <View style={styles.iconContainer}>
              <BeCoinIcon width={16} height={16} />
            </View>
            <View>
              <Text style={styles.footerLabel}>Disponible</Text>
              <Text style={styles.footerValue}>
                {isLoading
                  ? "..."
                  : showBalance
                    ? balance.toLocaleString()
                    : "***"}{" "}
                <Text style={styles.unit}>BC</Text>
              </Text>
            </View>
          </View>

          {/* Locked Balance */}
          {locked_balance && locked_balance > 0 && (
            <View style={styles.footerItemRight}>
              <View style={styles.lockedIconContainer}>
                <Ionicons name="lock-closed" size={12} color="#94A3B8" />
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.footerLabel}>Bloqueado</Text>
                <Text style={styles.footerLockedValue}>
                  {isLoading
                    ? "..."
                    : showBalance
                      ? locked_balance.toLocaleString()
                      : "***"}{" "}
                  <Text style={styles.unitLocked}>BC</Text>
                </Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Platform.OS === "web" ? 0 : 16,
    paddingVertical: 16,
    width: "100%",
    maxWidth: "100%", // Allow full width to match other cards
    alignSelf: "center",
  },
  card: {
    borderRadius: 24,
    padding: 24,
    minHeight: 220,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#F97316",
    opacity: 0.05,
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -80,
    left: -20,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#10B981",
    opacity: 0.03,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardSubtitle: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  eyeButton: {
    padding: 4,
    marginLeft: -4,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  logoText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // Change to flex-start for superscript effect
    marginVertical: 20,
  },
  currencySymbol: {
    color: "#10B981",
    fontSize: 28,
    fontWeight: "600",
    marginTop: 8, // Adjust to align with top of huge numbers
    marginRight: 4,
  },
  balanceAmount: {
    color: "#FFFFFF",
    fontSize: 56, // Huge font
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: 64,
  },
  currencyLabel: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 40, // Bottom align relative to big text
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 16,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  footerItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(249, 115, 22, 0.15)", // Orange tint
    justifyContent: "center",
    alignItems: "center",
  },
  lockedIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  footerLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  footerValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footerLockedValue: {
    color: "#CBD5E1",
    fontSize: 15,
    fontWeight: "600",
  },
  unit: {
    fontSize: 12,
    color: "#F97316",
    fontWeight: "600",
  },
  unitLocked: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
});
