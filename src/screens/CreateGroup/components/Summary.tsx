import React from "react";
import { View, Text } from "react-native";
import PrimaryButton from "./PrimaryButton";
import Card from "./Card";

type Props = {
  total: number;
  perPerson: number;
  participantsCount: number;
  splitType: "equal" | "per_item";
  onCreate: () => void;
  loading: boolean;
};

export const NewSummary: React.FC<Props> = ({
  total,
  perPerson,
  participantsCount,
  splitType,
  onCreate,
  loading,
}) => {
  return (
    <Card>
      <Text className="text-lg font-extrabold mb-3 text-beland-text-primary">
        División de Gastos
      </Text>
      <View className="mb-3">
        <View className="p-4 rounded-xl border border-beland-border mb-2 bg-white">
          <Text className="font-bold text-beland-text-primary">
            Igualitaria
          </Text>
          <Text className="text-xs text-beland-text-secondary">
            Todos pagan lo mismo
          </Text>
        </View>
        <View className="p-4 rounded-xl border border-beland-border mb-2 bg-white">
          <Text className="font-bold text-beland-text-primary">Por Ítem</Text>
          <Text className="text-xs text-beland-text-secondary">
            Pagas lo que consumes
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-100 pt-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-beland-text-secondary">
            Total Estimado
          </Text>
          <Text className="font-bold text-beland-text-primary">
            ${total.toFixed(2)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-beland-text-secondary">
            Por persona ({participantsCount})
          </Text>
          <Text className="font-semibold text-beland-text-primary">
            ~${perPerson.toFixed(2)}
          </Text>
        </View>
        <PrimaryButton loading={loading} onPress={onCreate}>
          Crear Grupo
        </PrimaryButton>
      </View>
    </Card>
  );
};

export default NewSummary;
