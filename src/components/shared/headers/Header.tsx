import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
} from "react-native";
import { CircleArrowLeftIcon } from "lucide-react-native";
import BelandLogo2 from "src/components/icons/BelandLogo2";
import { UserMenu } from "src/components/ui/UserMenu";
import { colors } from "src/styles";
import { HeaderStyles } from "./header.styles";

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
  const navigation = useNavigation();

  const renderLeftContent = () => {
    if (logo) {
      return (
        <TouchableOpacity
          style={HeaderStyles.logoContainer}
          onPress={() => navigation.navigate("Home" as never)}
        >
          <BelandLogo2 width={120} height={32} />
        </TouchableOpacity>
      );
    }

    return (
      <View style={HeaderStyles.left}>
        {canGoBack && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
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
