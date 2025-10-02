import { StyleSheet, Dimensions, Platform } from "react-native";
import { colors } from "src/styles";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    flexDirection: "column",
    margin: "auto",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    width: width > 500 ? 400 : width * 0.9,
    gap: 8,
  },
  logo: { margin: "auto" },
  title: { fontSize: 24, fontWeight: 600, color: "white" },
  subtitle: { color: "white" },
  button: {
    backgroundColor: "white",
    borderRadius: 5,
    paddingVertical: 12,
    width: "100%",
  },
  buttonLink: {
    color: "white",
    fontWeight: "bold",
    paddingHorizontal: 0,
  },
  buttonText: { color: colors.belandOrange, fontWeight: "bold" },
  containerRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
});
