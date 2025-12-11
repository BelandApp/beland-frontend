import { StyleSheet, Dimensions, Platform } from "react-native";
import { colors } from "src/design-system/tokens";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  pageWrapper: {
    width: "100%",
    maxWidth: 1200,
    flexDirection: width > 900 ? "row" : "column",
    gap: 24,
    alignItems: "stretch",
    paddingHorizontal: 16,
  },
  leftPanel: {
    flex: width > 900 ? 1 : undefined,
    minWidth: width > 900 ? 360 : undefined,
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    padding: 48,
    paddingTop: 72,
    justifyContent: "center",
    alignItems: width > 900 ? "flex-start" : "center",
  },
  leftPanelTitle: {
    color: colors.text.primary,
    fontSize: 32,
    fontWeight: "800" as any,
    marginBottom: 16,
  },
  leftPanelText: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 420,
  },
  rightPanel: {
    flex: width > 900 ? 1.2 : undefined,
    maxWidth: 720,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 36,
    alignSelf: "center",
    zIndex: 10,
    // elevation/shadow
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700" as any,
    color: colors.text.primary,
    marginBottom: 4,
  },
  formSubtitle: { color: colors.text.secondary, marginBottom: 20 },
  inputsContainer: {
    width: "100%",
    flexDirection: width > 600 ? "row" : "column",
    gap: 12,
    alignItems: "stretch",
    marginBottom: 16,
  },
  logo: { alignSelf: "center", marginBottom: 12 },
  backButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 20,
    padding: 6,
  },
  containerRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  smallTextLink: { color: colors.brand.orange[500], fontWeight: "700" as any },
});
