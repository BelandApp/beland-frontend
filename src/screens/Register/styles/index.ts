import { StyleSheet, Dimensions, Platform } from "react-native";
import { colors } from "src/styles";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    position: "relative",
  },
  container: {
    flexDirection: "column",
    justifyContent: "center",
    marginHorizontal: "auto",
    marginBottom: "auto",
    padding: 20,
    borderRadius: 20,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    minWidth: width > 600 ? 600 : width * 0.9,
    gap: 5,
    backgroundColor: colors.belandOrange,
  },
  inputsContainer: {
    width: "100%",
    flexDirection: width > 600 ? "row" : "column",
    gap: 10,
    alignItems:  width > 600 ?"baseline" :"stretch",
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
