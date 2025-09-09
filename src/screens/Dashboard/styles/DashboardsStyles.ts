import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Global Styles
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: "#2563eb",
    color: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  textCenter: {
    textAlign: "center",
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
    marginTop: 20,
  },
  noUserContainer: {
    padding: 20,
    backgroundColor: "#fee2e2",
    borderRadius: 6,
    marginTop: 20,
  },
  noUserText: {
    color: "#b91c1c",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Panel Header Styles (Reusable)
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  panelHeaderInfo: {
    flex: 1,
    marginRight: 16,
  },
  panelHeaderGreeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  panelHeaderEmail: {
    color: "#6b7280",
  },
  panelHeaderImage: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: "#2563eb",
  },

  // UserPanel Specific Styles (Re-added)
  userPanelHeader: {
    backgroundColor: "white",
    padding: 24,
    paddingBottom: 8,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16,
    position: "relative",
  },
  userPanelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  userPanelHeaderText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1f2937",
  },
  userPanelIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userPanelIcon: {
    width: 24,
    height: 24,
  },
  userProfileImageLarge: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: "#d1d5db",
  },
  userPanelBalanceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  userPanelBalanceTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  userPanelBalanceLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  userPanelBalanceValue: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1f2937",
  },
  userProfileImageSmall: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: "#9ca3af",
  },
  userPanelActionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  userPanelActionButton: {
    flexDirection: "column",
    alignItems: "center",
  },
  userPanelActionButtonIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#dbeafe",
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  userPanelActionButtonText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  userPanelActivitySection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  userPanelActivityTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  userPanelActivityCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  userPanelActivityCard: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 6,
    padding: 16,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2,
  },
  userPanelCardLabel: {
    color: "#4b5563",
    marginTop: 8,
  },
  noDataContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  noDataIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  noDataText: {
    color: "#6b7280",
    fontSize: 14,
  },

  // EmpresaPanel Specific Styles
  empresaBalanceCard: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  empresaBalanceLabel: {
    color: "#bfdbfe",
    fontSize: 18,
    marginBottom: 4,
  },
  empresaBalanceValue: {
    color: "white",
    fontSize: 36,
    fontWeight: "700",
  },
  empresaStatCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  empresaStatValue: {
    color: "#4b5563",
    textAlign: "center",
    fontSize: 30,
    fontWeight: "700",
  },
  empresaStatLabel: {
    color: "#6b7280",
    textAlign: "center",
  },

  // LeaderPanel Specific Styles
  leaderStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 16,
  },
  leaderStatCard: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    padding: 16,
  },
  leaderStatValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#2563eb",
  },
  leaderStatLabel: {
    color: "#4b5563",
    marginTop: 8,
    textAlign: "center",
  },

  // Admin & SuperAdmin Panels Specific Styles
  userListContainer: {
    marginBottom: 20,
  },
  userItemCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2,
    marginBottom: 16,
  },
  userItemText: {
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  userItemStatusText: {
    color: "#dc2626",
    marginLeft: 8,
  },
  userItemButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  userItemButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  userItemButtonRed: {
    backgroundColor: "#ef4444",
  },
  userItemButtonGreen: {
    backgroundColor: "#22c55e",
  },
  userItemButtonBlue: {
    backgroundColor: "#2563eb",
  },
  userItemButtonText: {
    color: "white",
  },
  roleButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  roleButtonActive: {
    borderColor: "#2563eb",
  },
  roleButtonText: {
    color: "#4b5563",
  },
  roleButtonTextActive: {
    color: "#2563eb",
    fontWeight: "600",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  paginationButton: {
    backgroundColor: "#d1d5db",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  paginationButtonText: {
    color: "#4b5563",
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontWeight: "600",
  },
});
