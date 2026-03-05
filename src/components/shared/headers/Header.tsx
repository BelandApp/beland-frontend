import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CircleArrowLeftIcon } from "lucide-react-native";
import BelandLogo from "src/components/icons/BelandLogo";
import { UserMenu } from "@/components";
import { HeaderStyles } from "./header.styles";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";

type HeaderProps = {
  title?: string;
  subtitle?: string;
  logo?: boolean;
  canGoBack?: boolean;
  onBackPress?: () => void;
  buttons?: React.ReactNode;
  centerTitle?: boolean;
  hideUserMenu?: boolean;
};

export const ThemedHeader: React.FC<HeaderProps> = ({
  title,
  subtitle,
  logo,
  canGoBack = false,
  onBackPress,
  buttons,
  centerTitle = false,
  hideUserMenu = false,
}) => {
  const { navigate } = useCustomNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      console.log("Navegando");
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
        <View>
          {title && (
            <Text
              style={[
                HeaderStyles.text,
                centerTitle && HeaderStyles.centerText,
              ]}
            >
              {title}
            </Text>
          )}
          {subtitle && <Text style={HeaderStyles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={HeaderStyles.container}>
      {renderLeftContent()}
      <View style={HeaderStyles.right}>
        {buttons}
        {!hideUserMenu && <UserMenu />}
      </View>
    </View>
  );
};
