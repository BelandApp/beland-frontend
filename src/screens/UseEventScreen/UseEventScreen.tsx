import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  Linking,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { colors } from "src/styles";
import { CountdownTimer } from "./components/CountdownTimer";
import { UseTicketButton } from "./components/UseTicketButton";
import { EventMap } from "./components/EventMap";
import { useEventStore } from "src/stores/Event";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { OpenInGoogleMaps } from "./components/OpenInGoogleMaps";
import { ArrowLeftRight } from "lucide-react-native";

type Navigation = StackNavigationProp<RootStackParamList>;
type RouteParams = { id: string };

export const UseEventScreen = ({ route }: { route: any }) => {
  const { id } = route.params;
  const { getAcquiredEvent } = useEventStore();
  const event = getAcquiredEvent(id);
  if (!event) return null;
  const {
    name,
    event_date,
    event_place,
    event_city,
    image_url,
    user_pass_id,
    latitude,
    longitude,
  } = event;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isReadyToUse, setIsReadyToUse] = useState(true);

  const eventDate = useMemo(
    () => new Date(event_date),
    [event_date]
  );
  // TODO Desabilitado para pruebas

  // useEffect(() => {
  //   const checkTime = () => {
  //     const now = new Date();
  //     const diff = eventDate.getTime() - now.getTime();
  //     // habilitado una hora antes
  //     setIsReadyToUse(diff <= 60 * 60 * 1000);
  //   };
  //   checkTime();
  //   const interval = setInterval(checkTime, 60 * 1000);
  //   return () => clearInterval(interval);
  // }, [eventDate]);

  const handleNavigateToScanner = () => {
    if (!user_pass_id) return alert("Falta id de compra");
    navigation.navigate("QrUseEventScreen", { id: user_pass_id });
  };

  return (
    <View style={styles.container}>
      <ThemedHeader canGoBack />
      <ScrollView
      showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{name}</Text>

          <View style={styles.imageContainer}>
            <Image source={{ uri: image_url }} style={styles.image} />
          </View>
          <CountdownTimer eventDate={eventDate} />
          <Text style={styles.subtitle}>
            {event_place}, {event_city}
          </Text>
          <View style={styles.buttonContainer}>
            <OpenInGoogleMaps
              latitude={Number(latitude)}
              longitude={Number(longitude)}
              name={name}
            />

            <UseTicketButton
              isReadyToUse={isReadyToUse}
              onPress={handleNavigateToScanner}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    minWidth: Dimensions.get("window").width > 600 ? 600 : "90%",
    padding: 16,
    backgroundColor: colors.background,
    marginVertical: 8,
    marginHorizontal: "auto",
    borderRadius: 32,
    gap: 16,
  },
  imageContainer: {
    alignItems: "center",
  },
  image: {
    width: "90%",
    height: 220,
    borderRadius: 16,
    resizeMode: "cover",
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
  buttonContainer: {
    marginHorizontal:"auto",
    width: "60%",
    gap: 8
  }
});
