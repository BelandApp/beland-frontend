import React from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { BeCoinsBalance } from "src/components/ui";
import { colors } from "src/styles";
import { useUserBalance } from "src/hooks";
import { useEvents } from "src/hooks/event/useEvents";
import { EventsTabs } from "./components/EventTabs";

const EventsScreen = () => {
  const { availableEvents, acquiredEvents, refreshing, onRefresh, isLoading } =
    useEvents();
    const { balance, refetch: refetchBalance } = useUserBalance();
  return (
    <View style={styles.content}>
      <ThemedHeader
        title="Eventos"
        buttons={
          <BeCoinsBalance variant="header" size="medium" balance={balance} />
        }
      />
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {isLoading? <View><Text>Cargando...</Text></View> :<EventsTabs
          availableEvents={availableEvents}
          acquiredEvents={acquiredEvents}
          onRefreshBalance={refetchBalance}
        />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1 },
  scroll: {
    padding: 16,
  },
});

export default EventsScreen;
