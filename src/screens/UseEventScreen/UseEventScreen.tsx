import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { colors } from "src/styles";
import { CountdownTimer } from "./components/CountdownTimer";
import { UseTicketButton } from "./components/UseTicketButton";
import { EventMap } from "./components/EventMap";

type Navigation = StackNavigationProp<RootStackParamList>;
type RouteParams = { id: string };

export const UseEventScreen = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute();
  const { id } = route.params as RouteParams;

  // Supongamos que ya tenemos este evento en el store o hacemos fetch por ID
  const event = {
    id,
    name: "Festival de Música",
    event_place: "Parque Central",
    event_city: "Quito",
    event_date: "2025-11-20T06:00:00.000Z",
    latitude: -0.1807,
    longitude: -78.4678,
  };

  const [isReadyToUse, setIsReadyToUse] = useState(false);

  const eventDate = useMemo(
    () => new Date(event.event_date),
    [event.event_date]
  );

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const diff = eventDate.getTime() - now.getTime();
      // habilitado una hora antes
      setIsReadyToUse(diff <= 60 * 60 * 1000);
    };
    checkTime();
    const interval = setInterval(checkTime, 60 * 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  const handleNavigateToScanner = () => {
    navigation.navigate("QrEventScreen", { eventId: id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.name}</Text>

      <CountdownTimer eventDate={eventDate} />

      <Text style={styles.subtitle}>
        {event.event_place}, {event.event_city}
      </Text>

      <EventMap
        latitude={event.latitude}
        longitude={event.longitude}
        name={event.name}
      />

      <UseTicketButton
        isReadyToUse={isReadyToUse}
        onPress={handleNavigateToScanner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: colors.textSecondary,
  },
});
