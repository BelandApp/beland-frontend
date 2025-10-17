import { Platform, StyleSheet } from "react-native";
import { colors } from "src/styles";

export const HeaderStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.belandOrange,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 20 : 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
    minHeight: 120,
  },
  logoContainer: { backgroundColor: "#FFF", borderRadius: 24 },
  left: { flexDirection: "row", gap: 12, alignItems: "center" },
  right: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  text: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF" },
  centerText: {
    alignItems: "center",
  }
});