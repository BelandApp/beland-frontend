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
import { CustomLoader } from "src/components/shared/loader/Loader";

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
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {isLoading ? (
          <CustomLoader/>
        ) : (
          <EventsTabs
            availableEvents={availableEvents}
            acquiredEvents={acquiredEvents}
            onRefreshBalance={refetchBalance}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1 },
  scroll: {
    paddingVertical: 16,
  },
});

export default EventsScreen;
