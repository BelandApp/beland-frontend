import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Card from "./Card";
import Field from "./Field";
type Props = {
  groupName: string;
  groupType: string;
  description: string;
  location: string | null;
  deliveryTime: string;
  onChangeName: (v: string) => void;
  onChangeType: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onLocationPress: () => void;
  onTimePress: () => void;
};

export const NewBasicInfo: React.FC<Props> = ({
  groupName,
  groupType,
  description,
  location,
  deliveryTime,
  onChangeName,
  onChangeType,
  onChangeDescription,
  onLocationPress,
  onTimePress,
}) => {
  return (
    <Card>
      <View className="mb-2">
        <Text className="text-lg font-extrabold text-beland-text-primary">
          Información General
        </Text>
      </View>

      <View className="mb-3">
        <Field
          label="Nombre del Grupo"
          value={groupName}
          onChangeText={onChangeName}
          placeholder="Ej. Cena de cumpleaños"
        />
      </View>

      <View className="mb-3">
        <Text className="text-sm font-bold text-beland-text-primary mb-2">
          Categoría
        </Text>
        <TouchableOpacity
          onPress={() => onChangeType("Juntada")}
          className="h-13 rounded-xl border border-beland-border px-3 justify-center bg-white"
        >
          <Text className="text-gray-500">
            {groupType || "Selecciona un tipo de evento"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mb-3">
        <Text className="text-sm font-bold text-beland-text-primary mb-2">
          Ubicación
        </Text>
        <TouchableOpacity
          onPress={onLocationPress}
          className="h-13 rounded-xl border border-beland-border px-3 justify-center bg-white flex-row items-center"
        >
          <Text className="text-gray-500">
            {location || "¿Dónde será el evento?"}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

export default NewBasicInfo;
