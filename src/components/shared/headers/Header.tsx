import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
} from "react-native";
import { CircleArrowLeftIcon } from "lucide-react-native";
import BelandLogo from "src/components/icons/BelandLogo";
import { UserMenu } from "src/components/ui/UserMenu";
import { HeaderStyles } from "./header.styles";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";

type HeaderProps = {
  title?: string;
  logo?: boolean;
  canGoBack?: boolean;
  buttons?: React.ReactNode;
  centerTitle?: boolean; // nueva opción
};

export const ThemedHeader: React.FC<HeaderProps> = ({
  title,
  logo,
  canGoBack = false,
  buttons,
  centerTitle = false,
}) => {
  const { navigate } = useCustomNavigation();

  const renderLeftContent = () => {
    if (logo) {
      return (
        <TouchableOpacity
          style={HeaderStyles.logoContainer}
          onPress={() => navigate("MainTabs")}
        >
          <BelandLogo width={120} height={32} />
        </TouchableOpacity>
      );
    }

    return (
      <View style={HeaderStyles.left}>
        {canGoBack && (
          <TouchableOpacity onPress={() => navigate("MainTabs")}>
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
