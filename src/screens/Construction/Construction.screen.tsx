import { View, Text } from "react-native";
import React, { ReactNode } from "react";
import { ThemedHeader, WaveBottom } from "src/components";
import { useResponsiveLayout } from "src/hooks";
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
  const { screenWidth, screenHeight } = useResponsiveLayout();
  return (
    <React.Fragment>
      <View className="flex-1">
        <ThemedHeader title={title} canGoBack />
        <View className="m-auto justify-center items-center gap-2">
          {icon && icon}
          <Text className="text-center text-2xl font-semibold">{message}</Text>
        </View>
      </View>
      <View className="absolute bottom-0 opacity-40">
        <WaveBottom width={screenWidth} height={screenHeight / 2} />
      </View>
    </React.Fragment>
  );
};

export default ConstructionScreen;
