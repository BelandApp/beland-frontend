import { StyleSheet, Platform } from "react-native";
import { colors } from "../../../styles/colors";

export const headerStyles = StyleSheet.create({
  titleContainer: {
    backgroundColor: colors.belandOrange,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 20 : 50, // Reducido para Android porque la barra de estado está oculta
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
    zIndex:1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 0,
  },
});
