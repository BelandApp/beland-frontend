import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

type SocialButtonsProps = {
  imagePath: string;
  title: string;
  onPress: () => void;
}
export const SocialButton: React.FC<SocialButtonsProps> = ({
  onPress,
  title,
  imagePath = "https://developers.google.com/identity/images/g-logo.png",
}) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: "#E5E7EB",
        width: "100%",
        borderRadius: 2,
        padding: 20,
        alignItems: "center",
        marginBottom: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      }}
      onPress={onPress}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={{
            uri: imagePath,
          }}
          style={{ width: 20, height: 20, marginRight: 12 }}
        />
        <Text>Continuar con {title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default SocialButton;