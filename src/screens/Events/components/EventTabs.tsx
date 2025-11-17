import React from "react";
import { View,  StyleSheet } from "react-native";
import { EventsList } from "./EventList";
import { colors } from "src/styles";
import ThemedTabs from "src/components/shared/Tabs/ThemedTabs";
import { useThemedTabs } from "src/components/shared/Tabs/hook/useTabs";

export const EventsTabs = ({
  availableEvents,
  acquiredEvents,
  onRefreshBalance,
}: any) => {
  const {tabs,onTabChange, activeTab}= useThemedTabs(["Disponibles", "Adquiridos"]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ThemedTabs tabs={tabs} onTabChange={onTabChange} />
      <EventsList
        events={activeTab === "Disponibles" ? availableEvents : acquiredEvents}
        tab={activeTab}
        onRefreshBalance={onRefreshBalance}
      />
    </View>
  );
};
