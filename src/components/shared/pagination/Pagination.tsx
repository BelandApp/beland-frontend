// src/components/Pagination.tsx
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "src/styles";

export type PaginationComponentProps = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: PaginationComponentProps) {
  if (totalPages <= 1) return null;

  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        disabled={page === 1}
        onPress={onPrev}
        style={[
          styles.paginationButton,
          page === 1 && styles.paginationButtonDisabled,
        ]}
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={20}
          color={page === 1 ? colors.textSecondary : colors.belandOrange}
        />
        <Text
          style={[
            styles.paginationButtonText,
            page === 1 && styles.paginationButtonTextDisabled,
          ]}
        >
          Anterior
        </Text>
      </TouchableOpacity>

      <Text style={styles.paginationText}>
        Página {page} de {totalPages}
      </Text>

      <TouchableOpacity
        disabled={page === totalPages}
        onPress={onNext}
        style={[
          styles.paginationButton,
          page === totalPages && styles.paginationButtonDisabled,
        ]}
      >
        <Text
          style={[
            styles.paginationButtonText,
            page === totalPages && styles.paginationButtonTextDisabled,
          ]}
        >
          Siguiente
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={page === totalPages ? "#d1d5db" : "#6b7280"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  paginationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    gap: 8,
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.belandOrange,
  },
  paginationButtonTextDisabled: {
    color: colors.textSecondary,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 10,
  },
});
