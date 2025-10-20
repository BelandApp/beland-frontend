import { StyleSheet, Platform } from "react-native";
import { colors } from "../../../styles/colors";

export const containerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: Platform.OS === "android" ? 96 : 86, // Espacio extra para la nueva barra de navegación
  },
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
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  waveContainer: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
});
