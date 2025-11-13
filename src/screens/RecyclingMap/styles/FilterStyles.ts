import { StyleSheet } from "react-native";
import { colors } from "@styles/colors";

export const styles = StyleSheet.create({
  header: {
    paddingBottom: 16,
    backgroundColor: colors.cardBackground,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingVertical: 6,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  activeFilterText: {
    color: "white",
  },
});
