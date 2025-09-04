import { StyleSheet, Platform, Dimensions } from "react-native";
import { colors } from "../../styles/colors";

const { width: screenWidth } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

// Función para calcular el ancho de las cards según la plataforma
const getCardWidth = () => {
  if (isWeb) {
    if (screenWidth > 1200) {
      // Pantallas muy grandes: 4 columnas
      return (screenWidth - 160) / 4;
    } else if (screenWidth > 768) {
      // Pantallas medianas: 3 columnas
      return (screenWidth - 120) / 3;
    } else {
      // Tablets: 2 columnas
      return (screenWidth - 80) / 2;
    }
  }
  // Mobile: 2 columnas - cálculo exacto en pixeles
  return (screenWidth - 48) / 2; // 24 padding total + 8 gap
};

const getCardHeight = () => {
  if (isWeb) {
    if (screenWidth > 1200) return 180;
    if (screenWidth > 768) return 160;
    return 140;
  }
  return 130;
};
export const containerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: isWeb ? 20 : 12, // Padding optimizado
  },
});

export const headerStyles = StyleSheet.create({
  titleContainer: {
    backgroundColor: colors.belandOrange,
    marginHorizontal: -16,
    marginTop: -16,
    paddingHorizontal: 30,
    paddingTop: Platform.OS === "android" ? 20 : 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  titleSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  sectionSlogan: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontStyle: "italic",
    marginTop: 2,
  },
  balanceContainer: {
    marginLeft: 12,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.background,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.background,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.9,
  },
});

export const categoryStyles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.background,
  },
});

export const gridStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: isWeb ? "flex-start" : "space-between",
    ...(isWeb
      ? {
          gap: 16, // Gap solo en web
        }
      : {}),
  },
  resourceCard: {
    width: getCardWidth(),
    minHeight: isWeb ? 380 : 320,
    marginBottom: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    ...(isWeb
      ? {
          maxWidth: 280, // Ancho máximo en web
        }
      : {}),
  },
  resourceImage: {
    width: "100%",
    height: getCardHeight(),
    backgroundColor: "#F8F9FA", // Color neutro en lugar de verde
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  resourceContent: {
    padding: isWeb ? 16 : 14,
    flex: 1,
    justifyContent: "space-between",
  },
  resourceName: {
    fontSize: isWeb ? 16 : 15,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 6,
    lineHeight: isWeb ? 22 : 20,
    textAlign: isWeb ? "center" : "left",
  },
  resourceDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 16,
    flex: 1,
    textAlign: isWeb ? "center" : "left",
  },
  resourcePrice: {
    fontSize: isWeb ? 17 : 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 6,
    textAlign: isWeb ? "center" : "left",
  },
  resourceStock: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: isWeb ? "center" : "left",
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    paddingVertical: isWeb ? 14 : 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: "auto",
  },
  purchaseButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: "600",
  },
  purchaseButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
});
