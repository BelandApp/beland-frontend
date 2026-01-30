import React, { useState } from "react";
import { View, Text, StyleSheet, Platform, Dimensions } from "react-native";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { RecycleIcon, WaterIcon } from "../../../components/icons";
import StatCard from "./StatCard";

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
      value: becoins,
      label: "Green BeCoins",
      sublabel: `≈ $${estimatedValue} USD`,
      color: "#059669",
      info: "Becoins verdes que ganas reciclando y ayudando al planeta.",
    },
    {
      icon: <BeCoinIcon width={32} height={32} />,
      value: becoins,
      label: "Orange BeCoins",
      sublabel: `≈ $${estimatedValue} USD`,
      color: "#F97316",
      info: "Becoins naranjas que te regalamos absorbiendo la comisión de transferencias.",
    },
    {
      icon: <RecycleIcon width={32} height={32} color="#059669" />,
      value: (bottlesRecycled * 0.025).toFixed(1),
      label: "Kg reciclados",
      sublabel: "Este mes",
      color: "#059669",
      info: "Cantidad de residuos que has ayudado a reciclar.",
    },
    {
      icon: <WaterIcon width={32} height={32} color="#3B82F6" />,
      value: Math.floor(bottlesRecycled * 0.5).toString(),
      label: "Litros conservados",
      sublabel: "de agua",
      color: "#3B82F6",
      info: "Litros de agua que has ayudado a conservar reciclando.",
    },
  ];
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu Impacto</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <StatCard stat={stat} />
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
});
