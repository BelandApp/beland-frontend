import { StyleSheet, Platform, Dimensions } from "react-native";
import { colors } from "../../../styles/colors";

export const actionsStyles = StyleSheet.create({
  actionsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F2937",
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginVertical: 16,
  },
  actionButton: {
    flex:1,
    alignItems: "center",
    gap: 6,
    maxWidth: 100,
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
