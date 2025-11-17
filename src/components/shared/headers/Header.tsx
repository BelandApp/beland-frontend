import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CircleArrowLeftIcon } from "lucide-react-native";
import BelandLogo from "src/components/icons/BelandLogo";
import { UserMenu } from "src/components/ui/UserMenu";
import { HeaderStyles } from "./header.styles";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";

type HeaderProps = {
  title?: string;
  logo?: boolean;
  canGoBack?: boolean;
  onBackPress?: () => void;
  buttons?: React.ReactNode;
  centerTitle?: boolean;
};

export const ThemedHeader: React.FC<HeaderProps> = ({
  title,
  logo,
  canGoBack = false,
  onBackPress,
  buttons,
  centerTitle = false,
}) => {
  const { navigate } = useCustomNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigate("MainTabs", { screen: "Home" });
    }
  };

  const renderLeftContent = () => {
    if (logo) {
      return (
        <TouchableOpacity
          style={HeaderStyles.logoContainer}
          onPress={() => navigate("MainTabs", { screen: "Home" })}
        >
          <BelandLogo width={120} height={32} />
        </TouchableOpacity>
      );
    }

    return (
      <View style={HeaderStyles.left}>
        {canGoBack && (
          <TouchableOpacity onPress={handleBackPress}>
            <CircleArrowLeftIcon size={32} color="#FFF" />
          </TouchableOpacity>
        )}
        {title && (
          <Text
            style={[HeaderStyles.text, centerTitle && HeaderStyles.centerText]}
          >
            {title}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={HeaderStyles.container}>
      {renderLeftContent()}
      <View style={HeaderStyles.right}>
        {buttons}
        <UserMenu />
      </View>
    </View>
  );
};
