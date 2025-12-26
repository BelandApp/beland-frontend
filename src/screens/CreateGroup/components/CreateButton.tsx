import React from "react";
import { TouchableOpacity, Text } from "react-native";

const NewCreateButton: React.FC<{
  isLoading?: boolean;
  onPress: () => void;
}> = ({ isLoading, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="w-full rounded-full h-12 items-center justify-center bg-beland-orange-500"
    >
      <Text className="font-bold text-beland-text-inverse">
        {isLoading ? "Creando Grupo..." : "Crear Grupo"}
      </Text>
    </TouchableOpacity>
  );
};
export default NewCreateButton;
