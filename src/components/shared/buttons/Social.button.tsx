import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AppleIcon } from "src/components/icons/socials/Apple";
import { FacebookIcon } from "src/components/icons/socials/Facebook";
import { GoogleIcon } from "src/components/icons/socials/Google";
import { colors } from "src/design-system";
type SocialButtonsProps = {
  onPress: () => void;
};
export const SocialButton: React.FC<SocialButtonsProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: colors.border.default,
        borderRadius: 24,
        padding: 10,
        width: 150,
        height: 45,
        marginHorizontal: "auto",
      }}
      onPress={onPress}
      aria-label="botón ingresar con redes sociales"
    >
      <GoogleIcon />
      <AppleIcon />
      <FacebookIcon/>
    </TouchableOpacity>
  );
};

export default SocialButton;
