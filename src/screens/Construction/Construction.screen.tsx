import { View, Text } from "react-native";
import React, { ReactNode } from "react";
import { ThemedHeader } from "src/components";
type ConstructionScreenProps = {
  title: string;
  message: string;
  icon?: ReactNode;
};
const ConstructionScreen: React.FC<ConstructionScreenProps> = ({
  title,
  message,
  icon,
}) => {
  return (
    <View className="flex-1">
      <ThemedHeader title={title} canGoBack />
      <View className="m-auto justify-center items-center gap-2">
        {icon && icon}
        <Text className="text-center text-2xl font-semibold">{message}</Text>
      </View>
    </View>
  );
};

export default ConstructionScreen;
