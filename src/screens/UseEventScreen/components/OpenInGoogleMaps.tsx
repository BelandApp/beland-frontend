import React from "react";
import { View, Text, Pressable, Linking, Platform } from "react-native";

interface Props {
  latitude: number;
  longitude: number;
  name?: string;
}

export const OpenInGoogleMaps: React.FC<Props> = ({
  latitude,
  longitude,
  name,
}) => {
  const label = encodeURIComponent(name || "Ubicación");
  const latLng = `${latitude},${longitude}`;

  const handleOpenMaps = async () => {
    if (Platform.OS === "web") {
      // 🌐 En navegador -> abrir Google Maps en nueva pestaña
      const url = `https://www.google.com/maps?q=${latLng}`;
      window.open(url, "_blank");
    } else {
      // 📱 En nativo -> abrir app de Google Maps
      const url = `geo:${latLng}?q=${latLng}(${label})`;

      // Si no hay app de mapas, fallback al navegador
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(`https://www.google.com/maps?q=${latLng}`);
      }
    }
  };

  return (
    <Pressable
      onPress={handleOpenMaps}
      style={{
        backgroundColor: "#007AFF",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
      }}
      disabled={!latitude || !longitude}
    >
      <Text style={{ color: "white", fontWeight: "600" }}>
        Ver en Google Maps
      </Text>
    </Pressable>
  );
};
