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
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latLngStr}`;
        window.open(url, "_blank");
        return;
      }

      // Native platforms: prefer navigation intents / app schemes
      try {
        if (Platform.OS === "android") {
          // Google Maps navigation intent
          const navUrl = `google.navigation:q=${latLngStr}`;
          if (await Linking.canOpenURL(navUrl)) {
            await Linking.openURL(navUrl);
            return;
          }
          // geo fallback
          // Do not include the event name in the geo query; only coordinates
          const geoUrl = `geo:${latLngStr}?q=${latLngStr}`;
          if (await Linking.canOpenURL(geoUrl)) {
            await Linking.openURL(geoUrl);
            return;
          }
        } else if (Platform.OS === "ios") {
          // Try Google Maps app deep link
          const googleApp = `comgooglemaps://?daddr=${latLngStr}&directionsmode=driving`;
          if (await Linking.canOpenURL(googleApp)) {
            await Linking.openURL(googleApp);
            return;
          }
          // Apple Maps fallback
          const appleUrl = `http://maps.apple.com/?daddr=${latLngStr}&dirflg=d`;
          if (await Linking.canOpenURL(appleUrl)) {
            await Linking.openURL(appleUrl);
            return;
          }
        }
      } catch (e) {
        // ignore and fallback to web
      }

      // Final fallback to web directions
      const fallback = `https://www.google.com/maps/dir/?api=1&destination=${latLngStr}`;
      await Linking.openURL(fallback);
      return;
    }

    const queryParts: string[] = [];
    if (opts?.address) queryParts.push(opts.address);
    if (opts?.place) queryParts.push(opts.place);
    if (opts?.city) queryParts.push(opts.city);
    const query = encodeURIComponent(queryParts.filter(Boolean).join(" "));
    // Use directions URL so the maps app opens into navigation/search results for the address
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

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
