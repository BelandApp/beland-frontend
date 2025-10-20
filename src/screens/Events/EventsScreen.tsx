import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { BeCoinsBalance } from "src/components/ui";
import { eventsService } from "src/services/events";
import { Event, useEventStore } from "src/stores/Event";
import { colors } from "src/styles";
import { EventCard } from "../Community/components/event/Event.card";
import { useUserBalance } from "src/hooks";

const EventsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { events, setEvents } = useEventStore();
  const { balance, refetch: refetchBalance } = useUserBalance();
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventsService.getEvents();
      console.log(data);
      setEvents(data);
      refetchBalance();
    } catch (error) {
      console.log(error);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };
  return (
    <View style={{ flex: 1 }}>
      <ThemedHeader
        title="Eventos"
        buttons={
          <BeCoinsBalance variant="header" size="medium" balance={balance} />
        }
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        <View style={{ flexWrap: "wrap", flexDirection: "row", gap: 16 }}>
          {Object.values(events).length > 0 ? (
            Object.values(events).map((event) => (
              <EventCard key={event.id} {...event} />
            ))
          ) : (
            <Text>Vaya parece que estamos sin eventos próximos</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 16,
  },
});

export default EventsScreen;
