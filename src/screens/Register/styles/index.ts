import { StyleSheet, Dimensions, Platform } from "react-native";
import { colors } from "src/styles";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    position: "relative",
  },
  container: {
    flexDirection: "column",
    justifyContent: "center",
    marginHorizontal: width > 600 ? "auto" : 0,
    marginBottom: "auto",
    padding: 20,
    borderRadius: 20,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    width: width > 600 ? 600 : width,
    gap: 5,
    backgroundColor: colors.belandOrange,
    height: Platform.OS === "web" ? "auto" : height * 0.5,
  },
  inputsContainer: {
    width: "100%",
    height: Platform.OS === "web" ? "auto" : height * 0.15,
    flexDirection: width > 600 ? "row" : "column",
    gap: Platform.OS === "web" ? 10 : 0,
    alignItems: Platform.OS === "web" && width > 600 ? "flex-end" : "stretch",
  },
  logo: { margin: "auto", marginTop: 20 },
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: "white",
    marginHorizontal: "auto",
    marginBottom: 10,
  },
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
    paddingHorizontal: 0,
  },
  buttonText: { color: colors.belandOrange, fontWeight: "bold" },
  containerRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
});
