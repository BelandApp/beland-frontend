import { StyleSheet, Dimensions, Platform } from "react-native";
import { colors } from "src/design-system/tokens";

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
    marginVertical: "auto",
    padding: 24,
    gap: 8,
    height: Platform.OS === "web" ? "auto" : undefined,
    borderRadius: 16,
    minWidth: width > 600 ? 600 : width - 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  logo: { alignSelf: "center", marginTop: 8 },
  title: { fontSize: 24, fontWeight: "600" as any, color: colors.text.primary },
  subtitle: { color: colors.text.secondary, fontSize: 14 },
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
    backgroundColor: colors.brand.orange[500],
    borderRadius: 50,
    padding: 10,
  },
  buttonLink: {
    color: colors.brand.orange[500],
    fontWeight: "700" as any,
    paddingHorizontal: 0,
  },
  buttonText: { color: colors.brand.orange[500], fontWeight: "700" as any },
  forgetText: {
    color: colors.text.primary,
    fontSize: 13,
  },
  containerRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  mirrorBar: {
    height: 36,
    width: "100%",
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: "rgba(248,141,42,0.10)",
  },
  localLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.brand.orange[500],
    backgroundColor: "rgba(255, 107, 53, 0.05)",
    width: "100%",
  },
  localLoginButtonText: {
    fontSize: 15,
    fontWeight: "600" as any,
    color: colors.brand.orange[500],
  },
});
