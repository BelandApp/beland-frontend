import { StyleSheet, Platform } from "react-native";
import { colors } from "../../../styles/colors";

export const actionsStyles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F2937",
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: Platform.OS === "web" ? 16 : 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginHorizontal: Platform.OS === "web" ? 0 : 16,
    marginVertical: 16,
  },
  actionButton: {
    alignItems: "center",
    gap: 10,
    flex: 1,
    maxWidth: Platform.OS === "web" ? 100 : 80,
    padding: Platform.OS === "web" ? 12 : 10,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  actionIcon: {
    width: Platform.OS === "web" ? 56 : 52,
    height: Platform.OS === "web" ? 56 : 52,
    borderRadius: Platform.OS === "web" ? 28 : 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  actionLabel: {
    fontSize: Platform.OS === "web" ? 13 : 12,
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },
});
