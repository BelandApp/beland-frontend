import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { AppleIcon } from "src/components/icons/socials/Apple";
import { FacebookIcon } from "src/components/icons/socials/Facebook";
import { GoogleIcon } from "src/components/icons/socials/Google";
import { colors } from "src/styles";
type SocialButtonsProps = {
  onPress: () => void;
  disabled: boolean;
};
export const SocialButton: React.FC<SocialButtonsProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: Dimensions.get("window").width > 600 ? "row" : "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: colors.belandOrange,
        borderRadius: 24,
        padding: 10,
        width: "100%",
        margin: "auto",
      }}
      onPress={onPress}
      disabled={disabled}
      aria-label="botón ingresar con redes sociales"
    >
      <Text style={{ color: colors.belandOrange, fontWeight: "semibold" }}>
        Ingresar con redes sociales:
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <GoogleIcon />
        <AppleIcon />
        <FacebookIcon />
      </View>
    </TouchableOpacity>
  );
};

export default SocialButton;
