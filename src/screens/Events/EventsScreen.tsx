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
import { Ticket } from "lucide-react-native";

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
    <View style={styles.content}>
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
        <View style={styles.wrapperContainer}>
          {events &&events.length > 0 ? (
            events.map((event) => (
              <EventCard key={event.id} {...event} />
            ))
          ) : (
            <View style={styles.noEventsContainer}>
              <Ticket color={colors.textSecondary} size={48} />
              <Text style={styles.noEventsText}>
                Vaya parece que estamos sin eventos próximos
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1 },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  wrapperContainer: { flexWrap: "wrap", flexDirection: "row", gap: 16 },
  noEventsContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  noEventsText: {
    fontSize: 25,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default EventsScreen;
