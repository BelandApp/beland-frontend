import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { TreesIcon, CommunityIcon } from "../../../components/icons";

interface HeroSectionProps {
  balance: number;
  locked_balance?: number;
  estimatedValue: string;
  onGetStarted?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  balance,
  locked_balance,
  estimatedValue,
  onGetStarted,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenido a Beland</Text>
          <Text style={styles.subtitle}>
            Recicla, gana BeCoins y accede a beneficios exclusivos
          </Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <BeCoinIcon width={32} height={32} />
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceAmount}>
                {balance.toLocaleString()}
              </Text>
              <Text style={styles.balanceLabel}>BeCoins</Text>
              {locked_balance && locked_balance > 0 && (
                <Text style={styles.lockedBalanceLabel}>
                  {locked_balance.toLocaleString()} bloqueados
                </Text>
              )}
            </View>
            <View style={styles.usdValue}>
              <Text style={styles.usdAmount}>${estimatedValue}</Text>
              <Text style={styles.usdLabel}>USD aprox.</Text>
            </View>
          </View>
        </View>

        {/* <View style={styles.features}>
          <View style={styles.feature}>
            <TreesIcon width={40} height={40} />
            <Text style={styles.featureTitle}>Recicla</Text>
            <Text style={styles.featureDesc}>
              Encuentra puntos de reciclaje cerca de ti
            </Text>
          </View>

          <View style={styles.feature}>
            <BeCoinIcon width={40} height={40} />
            <Text style={styles.featureTitle}>Gana BeCoins</Text>
            <Text style={styles.featureDesc}>
              Cada botella reciclada suma puntos
            </Text>
          </View>

          <View style={styles.feature}>
            <CommunityIcon width={40} height={40} />
            <Text style={styles.featureTitle}>Beneficios</Text>
            <Text style={styles.featureDesc}>
              Canjea por productos y descuentos
            </Text>
          </View>
        </View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E293B",
    borderRadius: Platform.OS === "web" ? 24 : 20,
    marginHorizontal: Platform.OS === "web" ? 0 : 16,
    marginVertical: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  content: {
    padding: Platform.OS === "web" ? 40 : 28,
  },
  header: {
    marginBottom: 28,
    alignItems: "center",
  },
  title: {
    fontSize: Platform.OS === "web" ? 36 : 30,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Platform.OS === "web" ? 18 : 16,
    color: "#CBD5E1",
    textAlign: "center",
    lineHeight: 26,
    maxWidth: Platform.OS === "web" ? 500 : 280,
    fontWeight: "500",
  },
  balanceCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceInfo: {
    flex: 1,
    marginLeft: 16,
  },
  balanceAmount: {
    fontSize: Platform.OS === "web" ? 32 : 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  balanceLabel: {
    fontSize: 15,
    color: "#CBD5E1",
    marginTop: 2,
    fontWeight: "500",
  },
  lockedBalanceLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 1,
    fontWeight: "400",
    fontStyle: "italic",
  },
  usdValue: {
    alignItems: "flex-end",
  },
  usdAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
  },
  usdLabel: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 2,
    fontWeight: "500",
  },
  features: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: Platform.OS === "web" ? 20 : 16,
  },
  feature: {
    flex: Platform.OS === "web" ? 1 : undefined,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: "#CBD5E1",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "400",
  },
});
