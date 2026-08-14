import React from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  BeCoinsBalance,
  ThemedHeader,
  CustomLoader,
  Button,
} from "@components/shared";
import { colors } from "src/styles";
import { useUserBalance } from "src/hooks";
import { useEvents } from "src/hooks/event/useEvents";
import { EventsTabs } from "./components/EventTabs";

const EventsScreen = () => {
  const { availableEvents, acquiredEvents, refresh, isLoading } = useEvents();
  const { balance, refetch: refetchBalance } = useUserBalance();

  return (
    <View style={styles.content}>
      <ThemedHeader
        title="Eventos"
        buttons={
          <>
            <Button
              title="Recargar"
              variant="secondary"
              onPress={refresh}
              className="w-fit my-2 mx-auto"
            />
            <BeCoinsBalance variant="header" size="medium" balance={balance} />
          </>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={[colors.primary]}
            style={{ padding: 0 }}
          />
        }
      >
        {isLoading ? (
          <CustomLoader />
        ) : (
          <>
            <EventsTabs
              availableEvents={availableEvents}
              acquiredEvents={acquiredEvents}
              onRefreshBalance={refetchBalance}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1 },
  scroll: {
    flex: 1,
  },
});

export default EventsScreen;
