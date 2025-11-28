import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Trophy, Star, Zap, Target } from "lucide-react-native";

interface LevelProgressCardProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalOrders?: number;
  totalSpent?: number;
}

export const LevelProgressCard: React.FC<LevelProgressCardProps> = ({
  level,
  currentXP,
  nextLevelXP,
  totalOrders = 0,
  totalSpent = 0,
}) => {
  const progress = nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 0;
  const xpRemaining = nextLevelXP - currentXP;

  const getLevelTitle = (level: number): string => {
    if (level <= 5) return "Principiante";
    if (level <= 10) return "Explorador";
    if (level <= 20) return "Veterano";
    if (level <= 30) return "Experto";
    return "Maestro";
  };

  const getLevelColor = (level: number): string => {
    if (level <= 5) return "#4CAF50";
    if (level <= 10) return "#2196F3";
    if (level <= 20) return "#9C27B0";
    if (level <= 30) return "#FF9800";
    return "#F44336";
  };

  const levelColor = getLevelColor(level);

  return (
    <View style={styles.container}>
      {/* Header with Level Badge */}
      <View style={styles.header}>
        <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
          <Trophy size={24} color="#fff" />
          <Text style={styles.levelNumber}>{level}</Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={styles.levelTitle}>{getLevelTitle(level)}</Text>
          <Text style={styles.levelSubtitle}>Nivel {level}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progreso al siguiente nivel</Text>
          <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: levelColor,
              },
            ]}
          />
        </View>
        <Text style={styles.xpText}>
          {currentXP} / {nextLevelXP} XP
          {xpRemaining > 0 && ` (faltan ${xpRemaining} XP)`}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#E3F2FD" }]}>
            <Star size={18} color="#2196F3" />
          </View>
          <Text style={styles.statValue}>{currentXP}</Text>
          <Text style={styles.statLabel}>XP Total</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#FFF3E0" }]}>
            <Zap size={18} color="#FF9800" />
          </View>
          <Text style={styles.statValue}>{totalOrders}</Text>
          <Text style={styles.statLabel}>Órdenes</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#F3E5F5" }]}>
            <Target size={18} color="#9C27B0" />
          </View>
          <Text style={styles.statValue}>${totalSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Gastado</Text>
        </View>
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
    marginHorizontal: 0,
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
    gap: 16,
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  levelNumber: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#fff",
    color: "#333",
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  levelSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: "#666",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  xpText: {
    fontSize: 12,
    color: "#999",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#999",
  },
});
