import { StyleSheet, Dimensions, Platform } from "react-native";
import { colors } from "src/styles";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    position: "relative",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flexDirection: "column",
    marginHorizontal: "auto",
    marginBottom: 40,
    padding: 20,
    gap: 5,
    height:"auto",
    borderRadius: 20,
    width: width > 500 ? 400 : width * 0.9,
    // TODO PROBAR RESPONSIVE BACKGROUND
    // backgroundColor: colors.belandOrange,
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
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
    backgroundColor: colors.belandOrange,
    borderRadius: 50,
    padding: 10,
  },
  buttonLink: {
    color: "white",
    fontWeight: "bold",
    paddingHorizontal: 0,
  },
  buttonText: { color: colors.belandOrange, fontWeight: "bold" },
  forgetText: {
    color: colors.cardBackground,
    textDecorationLine: "underline",
    fontSize: 12,
  },
  containerRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
});
