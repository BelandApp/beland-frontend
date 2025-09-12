import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const colors = {
  primary: "#14C38E", // Verde Turquesa
  secondary: "#FFB84C", // Amarillo Mostaza
  background: "#F2F2F2", // Gris muy claro para el fondo
  surface: "#FFFFFF", // Blanco para las tarjetas
  textPrimary: "#333333",
  textSecondary: "#888888",
  textTertiary: "#A0A0A0",
  danger: "#FF4C4C",
  success: "#14C38E",
};

export const styles = StyleSheet.create({
  // Contenedor principal del dashboard
  dashboardContainer: {
    backgroundColor: colors.background,
    padding: 16,
  },

  // Estilos del encabezado
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },

  // Estilos para tarjetas de información (Stats)
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    width: "48%", // Aproximadamente la mitad para 2 columnas
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statCardFull: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // Estilos de los botones
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#14C38E",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5.46,
    elevation: 9,
  },
  buttonText: {
    color: colors.surface,
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#FFB84C",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5.46,
    elevation: 9,
  },
  buttonSecondaryText: {
    color: colors.textPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: colors.textTertiary,
    shadowColor: "transparent",
    elevation: 0,
  },

  // Estilos de las tablas/listas
  listContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: "bold",
    color: colors.textSecondary,
    textAlign: "center",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  userName: {
    flex: 2,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  userRole: {
    flex: 1,
    color: colors.textSecondary,
    textAlign: "center",
  },
  userStatus: {
    flex: 1,
    textAlign: "center",
  },
  userActions: {
    flexDirection: "row",
    flex: 2,
    justifyContent: "space-evenly",
  },

  // Otros estilos genéricos
  textCenter: {
    textAlign: "center",
  },
  errorText: {
    color: colors.danger,
    textAlign: "center",
    marginTop: 10,
  },
  // Estilos de paginación
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paginationButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  paginationButtonText: {
    color: colors.surface,
    fontWeight: "bold",
  },
  paginationButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  paginationText: {
    fontSize: 16,
    color: colors.textPrimary,
  },

  // Estilos de la sección de perfil
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  profileInfo: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  // Estilos para los "paneles"
  panelContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  // Estilos agregados para solucionar el error
  noUserContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noUserText: {
    color: colors.textSecondary,
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  // Nuevos estilos para UserPanel
  noDataContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 10,
  },
  noDataIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  noDataText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
