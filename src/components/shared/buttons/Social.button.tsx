import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
type SocialButtonsProps = {
  onPress: () => void;
};
export const SocialButton: React.FC<SocialButtonsProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: "#E5E7EB",
        paddingHorizontal: 20,
        borderRadius: 24,
        paddingVertical: 10,
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      }}
      onPress={onPress}
    >
      <Text>Ingresar con tus Redes</Text>
    </TouchableOpacity>
  );
};

export default SocialButton;
