import { StyleSheet, Platform, Dimensions } from "react-native";
import { colors } from "../../../styles/colors";

const { width: screenWidth } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

// Calcular anchos adaptativos
const getCardWidth = () => {
  if (isWeb) {
    if (screenWidth > 1200) return 200; // Pantallas grandes
    if (screenWidth > 768) return 180; // Tablets grandes
    return 160; // Tablets pequeños
  }
  // Mobile: 2 columnas con espaciado
  return (screenWidth - 48) / 2; // 16 padding + 8 gap por cada lado
};

export const productStyles = StyleSheet.create({
  // Product grid
  productGrid: {
    paddingHorizontal: 16,
    width: "100%",
    boxSizing: "border-box",
  },
  productRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 16,
    flexWrap: "wrap",
    ...(Platform.OS === "web"
      ? {
          gap: 16,
          justifyContent: "center",
          width: "100%",
        }
      : {}),
  },
  // Product card
  productCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === "web"
      ? {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          width: getCardWidth(),
          minHeight: 280,
          boxSizing: "border-box",
        }
      : {
          width: getCardWidth(),
          minHeight: 260,
        }),
  },
  productImageContainer: {
    width: "100%",
    height: isWeb ? 140 : 120,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web"
      ? {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }
      : {}),
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  productBrand: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: "500" as const,
    textAlign: "center" as const,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 16,
    textAlign: "center" as const,
    minHeight: 32, // Altura mínima para mantener alineación
  },
  productCategory: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: "center" as const,
  },
  productPriceRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: "auto" as const, // Empuja hacia abajo
    width: "100%",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.belandGreen,
    flex: 1,
  },
  addToCartButton: {
    backgroundColor: colors.belandOrange,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginLeft: 8,
  },
  addToCartButtonLoading: {
    backgroundColor: colors.textSecondary,
    opacity: 0.7,
  },
  addToCartText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center" as const,
    marginTop: 16,
  },
});
