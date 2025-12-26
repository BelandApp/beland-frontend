import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
};

export const NewHeader: React.FC<Props> = ({ title, subtitle, onBack }) => {
  return (
    <View className="w-full flex-row items-center justify-between px-4 py-3 bg-transparent">
      <View className="flex-row items-center">
        <View>
          <Text className="text-lg font-bold text-beland-text-primary">
            {title || "GroupManager"}
          </Text>
          {subtitle ? (
            <Text className="text-sm text-beland-text-secondary">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          className="px-3 py-2 rounded-full border border-beland-border bg-white"
        >
          <Text className="text-sm font-bold">Cancelar</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default NewHeader;
