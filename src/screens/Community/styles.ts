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
      // Tablets y web móvil: 2 columnas
      return (screenWidth - 48) / 2; // MISMO CÁLCULO QUE MÓVIL
    }
  }
  // Mobile: 2 columnas con espaciado
  return (screenWidth - 48) / 2;
};

const getCardHeight = () => {
  if (isWeb) {
    if (screenWidth > 1200) return 180;
    if (screenWidth > 768) return 160;
    return 140;
  }
  return 120; // Altura más baja en móvil para dejar más espacio al contenido
};
export const containerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 0, // Quitar padding del scroll, se manejará en el grid
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
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // space-between SIEMPRE para 2 columnas
    alignItems: "flex-start", // flex-start para alineación correcta
    ...(isWeb && screenWidth > 768
      ? {
          gap: 16, // Gap solo en web grande
          justifyContent: "flex-start", // flex-start solo en pantallas grandes
        }
      : {}),
  },
  resourceCard: {
    width: getCardWidth(),
    minHeight: isWeb ? 380 : 280,
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
    padding: isWeb ? 16 : 12, // Padding más uniforme
    flex: 1,
    justifyContent: "space-between",
    minHeight: 0, // Permite que flex funcione correctamente
  },
  resourceName: {
    fontSize: isWeb ? 16 : 14, // Texto más pequeño en móvil
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4, // Menos margen
    lineHeight: isWeb ? 22 : 18,
    textAlign: isWeb ? "center" : "left",
  },
  resourceDescription: {
    fontSize: 11, // Más pequeño para ahorrar espacio
    color: colors.textSecondary,
    marginBottom: 8, // Menos margen
    lineHeight: 14,
    flex: 1,
    textAlign: isWeb ? "center" : "left",
  },
  resourcePrice: {
    fontSize: isWeb ? 17 : 15, // Más pequeño en móvil
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4, // Menos margen
    textAlign: isWeb ? "center" : "left",
  },
  resourceStock: {
    fontSize: 10, // Más pequeño
    color: colors.textSecondary,
    marginBottom: 8, // Menos margen
    textAlign: isWeb ? "center" : "left",
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    paddingVertical: isWeb ? 14 : 10, // Botón más compacto en móvil
    paddingHorizontal: 8, // Padding horizontal para no tocar bordes
    borderRadius: 8, // Radio más pequeño
    alignItems: "center",
    marginTop: 4, // Pequeño margen superior
  },
  purchaseButtonText: {
    color: colors.background,
    fontSize: 13, // Texto más pequeño
    fontWeight: "600",
  },
  purchaseButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
});
