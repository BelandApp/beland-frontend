import { View, Text } from "react-native";
import React from "react";
import { CustomLoader, ThemedHeader } from "src/components";
type LoadingScreenProps = {
  title: string;
  onBackPress?: () => void;
};
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title,
  onBackPress,
}) => {
  return (
    <React.Fragment>
      <ThemedHeader
        title={title}
        canGoBack
        onBackPress={onBackPress ?? undefined}
      />
      <View className="m-auto">
        <CustomLoader />
      </View>
    </React.Fragment>
  );
};

export default LoadingScreen;
