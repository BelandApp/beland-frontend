import { JSX } from "react";
import { Dimensions, Platform } from "react-native";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tooltip } from "src/components";
type StatCardProps = {
  stat: {
    icon: JSX.Element;
    value: number | string;
    label: string;
    sublabel: string;
    color: string;
    info: string;
  };
};
const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  return (
    <View key={stat.value} style={styles.statItem}>
      <View
        style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}
      >
        {stat.icon}
      </View>

      <View style={styles.textContainer}>
        <View style={styles.textContainer}>
          <Text style={[styles.statValue, { color: stat.color }]}>
            {stat.value}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Tooltip text={stat.info} direction="top">
              <Ionicons name="information-circle" size={20} color="gray" />
            </Tooltip>
          </View>
        </View>
        <Text style={styles.statSublabel}>{stat.sublabel}</Text>
      </View>
    </View>
  );
};

export default StatCard;

const styles = StyleSheet.create({
  statItem: {
    flex: 1,
    flexDirection: Dimensions.get("window").width > 600 ? "column" : "row",
    justifyContent:
      Dimensions.get("window").width > 600 ? "center" : "space-evenly",
    alignItems: "center",
    padding: Platform.OS === "web" ? 20 : 18,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "visible",
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
