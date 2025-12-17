import React from "react";
import { View } from "react-native";
import { EventsList } from "./EventList";
import ThemedTabs from "src/components/shared/Tabs/ThemedTabs";
import { useThemedTabs } from "src/components/shared/Tabs/hook/useTabs";

export const EventsTabs = ({ availableEvents, onRefreshBalance }: any) => {
  const { tabs, onTabChange, activeTab } = useThemedTabs(["Disponibles"]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <EventsList
        events={availableEvents}
        tab={"Disponibles"}
        onRefreshBalance={onRefreshBalance}
      />
    </View>
  );
};
