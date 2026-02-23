import { Dimensions, StyleSheet } from "react-native";
import { colors } from "src/styles";

export const OrderDeliveryModalStyles = StyleSheet.create({
  overlay: { justifyContent: "flex-end", margin: 0 },
  scroll: {
    width: "100%",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 34, // Para el safe area en iPhone
    minHeight: "80%",
    maxHeight: "98%",
    marginTop: "auto",
  },
  remove: { color: colors.error, fontSize: 20 },
  removeContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 2,
    right: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 3,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#333" },
  selectContainer: {
    justifyContent: "space-between",
    flex: 1,
  },
  selectWrapper: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 12,
    marginHorizontal: "auto",
  },
  addressCard: {
    position: "relative",
    flexDirection: "column",
    gap: 6,
    padding: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: Dimensions.get("window").width > 600 ? 200 : "100%",
    height: 200,
    justifyContent: "space-between",
  },
  actionsContainer: {
    paddingTop: 12,
    marginHorizontal: "auto",
    flexDirection: Dimensions.get("window").width > 600 ? "row" : "column",
    gap: 12,
  },
});
