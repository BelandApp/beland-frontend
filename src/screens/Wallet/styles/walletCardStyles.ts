import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const walletCardStyles = StyleSheet.create({
  walletCard: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  walletContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  walletLeft: {
    flex: 1,
  },
  availableLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    marginVertical: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  estimatedValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
    minWidth: 25,
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  walletAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // Importante para que la imagen no se salga del círculo
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
});
