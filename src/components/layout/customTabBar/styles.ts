import { Dimensions, Platform, StyleSheet } from "react-native";
import { colors } from "src/design-system";

export const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: Dimensions.get("window").width > 600 ? 30 : 0,
    left: Dimensions.get("window").width > 600 ? 20 : 2,
    right: Dimensions.get("window").width > 600 ? 20 : 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  glassContainer: {
    flexDirection: "row",
    alignItems: "center",

    paddingBottom: Dimensions.get("window").width > 600 ? 0 : 20,
    borderRadius: Dimensions.get("window").width > 600 ? 50 : 0,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",

    gap: Dimensions.get("window").width > 600 ? 24 : 0,
    width: Dimensions.get("window").width > 600 ? "auto" : "100%",
    justifyContent:
      Dimensions.get("window").width > 600 ? "flex-start" : "space-between",
  },

  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Dimensions.get("window").width > 600 ? 24 : 12,
    paddingVertical: Dimensions.get("window").width > 600 ? 20 : 10,
    borderRadius: 40,
  },

  activeTab: {
    backgroundColor: colors.brand.orange[500],
  },

  label: {
    marginLeft: 6,
    fontWeight: "600",
  },

  qrButton: {
    position: "absolute",
    bottom: Dimensions.get("window").width > 700 ? 0 : 70,
    right: Dimensions.get("window").width > 700 ? 0 : 10,
    marginLeft: 16,
    width: Dimensions.get("window").width > 600 ? 72 : 56,
    height: Dimensions.get("window").width > 600 ? 72 : 56,
    borderRadius: 50,
    backgroundColor: colors.brand.green[500],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
