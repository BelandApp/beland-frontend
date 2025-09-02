import { StyleSheet, Platform } from "react-native";
import { colors } from "../../../styles/colors";

export const ordersStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // Header naranja styles
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === "android" ? 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: colors.belandOrange,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitles: {
    flex: 1,
  },
  headerMainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    opacity: 0.9,
  },

  // Legacy header styles (mantener por compatibilidad)
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 140, // Espacio para el header fijo
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Summary Card Styles
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginLeft: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.belandOrange,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 16,
  },

  // Filter Styles
  filterContainer: {
    backgroundColor: "white",
    paddingVertical: 16,
    marginBottom: 20,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filterScrollContent: {
    paddingHorizontal: 20,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterTabActive: {
    backgroundColor: colors.belandOrange + "15",
    borderColor: colors.belandOrange,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.belandOrange,
  },
  filterBadge: {
    backgroundColor: colors.textSecondary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  filterBadgeActive: {
    backgroundColor: colors.belandOrange,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
  },
  filterBadgeTextActive: {
    color: "white",
  },

  // Order Card Styles
  orderCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.belandOrange,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderMainInfo: {
    flex: 1,
  },
  orderIdRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginRight: 8,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  orderDate: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  orderPrice: {
    alignItems: "flex-end",
  },
  orderAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  orderItemCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  orderDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  orderDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: "500",
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderProgress: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 2,
    marginRight: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.belandOrange,
    borderRadius: 2,
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: colors.belandOrange,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    ...Platform.select({
      ios: {
        shadowColor: colors.belandOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },

  // Legacy styles (mantener por compatibilidad)
  ordersList: {
    gap: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewOrderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewOrderButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.belandOrange,
  },
});
