import React from "react";
import { View, Text, StyleSheet, Platform, Dimensions } from "react-native";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { RecycleIcon, WaterIcon } from "../../../components/icons";

interface StatsCardProps {
  becoins: number;
  bottlesRecycled: number; // Usado para calcular kg reciclados y litros conservados
  estimatedValue: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  becoins,
  bottlesRecycled,
  estimatedValue,
}) => {
  const stats = [
    {
      icon: <BeCoinIcon width={32} height={32} />,
      value: becoins.toLocaleString(),
      label: "BeCoins ganados",
      sublabel: `≈ $${estimatedValue} USD`,
      color: "#1E40AF",
    },
    {
      icon: <RecycleIcon width={32} height={32} color="#059669" />,
      value: (bottlesRecycled * 0.025).toFixed(1),
      label: "Kg reciclados",
      sublabel: "Este mes",
      color: "#059669",
    },
    {
      icon: <WaterIcon width={32} height={32} color="#3B82F6" />,
      value: Math.floor(bottlesRecycled * 0.5).toString(),
      label: "Litros conservados",
      sublabel: "de agua",
      color: "#3B82F6",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu Impacto</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${stat.color}20` },
              ]}
            >
              {stat.icon}
            </View>

            <View style={styles.textContainer}>
              <View style={styles.textContainer}>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              <Text style={styles.statSublabel}>{stat.sublabel}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: Platform.OS === "web" ? 32 : 24,
    marginHorizontal: Platform.OS === "web" ? 0 : 16,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  title: {
    fontSize: Platform.OS === "web" ? 24 : 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: Dimensions.get("window").width > 600 ? "row" : "column",
    gap: Platform.OS === "web" ? 24 : 16,
    justifyContent: "space-between",
  },
  statItem: {
    width: Dimensions.get("window").width > 600 ? "30%" : "100%", // 3 items en un row,
    flexDirection: Dimensions.get("window").width > 600 ? "column" : "row",
    justifyContent:
      Dimensions.get("window").width > 600 ? "center" : "space-evenly",
    alignItems: "center",
    padding: Platform.OS === "web" ? 20 : 18,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  iconContainer: {
    width: Platform.OS === "web" ? 60 : 56,
    height: Platform.OS === "web" ? 60 : 56,
    borderRadius: Platform.OS === "web" ? 30 : 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  statValue: {
    fontSize: Platform.OS === "web" ? 28 : 24,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: Platform.OS === "web" ? 15 : 14,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    marginBottom: 4,
  },
  statSublabel: {
    fontSize: Platform.OS === "web" ? 13 : 12,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
  },
  textContainer: {
    alignItems: "center",
  },
});
