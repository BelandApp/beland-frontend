import React from "react";
import { View, Text, Pressable, Linking, Platform } from "react-native";

interface Props {
  latitude?: number | null;
  longitude?: number | null;
  name?: string;
  place?: string;
  city?: string;
  address?: string;
}

export const OpenInGoogleMaps: React.FC<Props> = ({
  latitude,
  longitude,
  name,
  place,
  city,
  address,
}) => {
  const label = encodeURIComponent(name || "Ubicación");

  const handleOpenMaps = async (opts?: {
    address?: string;
    place?: string;
    city?: string;
  }) => {
    const lat = Number(latitude);
    const lng = Number(longitude);
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

    if (hasCoords) {
      const latLngStr = `${lat},${lng}`;
      if (Platform.OS === "web") {
        const url = `https://www.google.com/maps?q=${latLngStr}`;
        window.open(url, "_blank");
        return;
      }

      const url = `geo:${latLngStr}?q=${latLngStr}(${label})`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(`https://www.google.com/maps?q=${latLngStr}`);
      }
      return;
    }

    const queryParts: string[] = [];
    if (opts?.address) queryParts.push(opts.address);
    if (opts?.place) queryParts.push(opts.place);
    if (opts?.city) queryParts.push(opts.city);
    if (name) queryParts.push(name);
    const query = encodeURIComponent(queryParts.filter(Boolean).join(" "));
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    if (Platform.OS === "web") {
      window.open(mapsUrl, "_blank");
    } else {
      await Linking.openURL(mapsUrl);
    }
  };

  const isDisabled =
    !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude));

  return (
    <Pressable
      onPress={() => handleOpenMaps({ address, place, city })}
      style={{
        backgroundColor: "#007AFF",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
      }}
      disabled={false}
    >
      <Text style={{ color: "white", fontWeight: "600" }}>
        Ver en Google Maps
      </Text>
    </Pressable>
  );
};
