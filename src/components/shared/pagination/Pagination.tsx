// src/components/Pagination.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
    <View className="w-full flex flex-row items-center">
      <TouchableOpacity disabled={page === 1} onPress={onPrev}>
        <MaterialCommunityIcons
          name="chevron-left"
          size={20}
          color={page === 1 ? "#d1d5db" : "#6b7280"}
        />
      </TouchableOpacity>

      <Text>
        Página {page} de {totalPages}
      </Text>

      <TouchableOpacity disabled={page === totalPages} onPress={onNext}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={page === totalPages ? "#d1d5db" : "#6b7280"}
        />
      </TouchableOpacity>
    </View>
  );
}
