import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { colors } from "src/styles";
import { MapPin } from "lucide-react-native";

interface Props {
  latitude: number;
  longitude: number;
  name: string;
}

export const EventMap: React.FC<Props> = ({ latitude, longitude, name }) => {
  const [region, setRegion] = React.useState({
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const handleGoToLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const location = await Location.getCurrentPositionAsync({});
    setRegion({
      ...region,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        <Marker coordinate={{ latitude, longitude }} title={name} />
      </MapView>

      <Pressable style={styles.button} onPress={handleGoToLocation}>
        <MapPin color="white" />
        <Text style={styles.buttonText}>Llévame</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  button: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
