import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { EventsList } from "./EventList";
import { colors } from "src/styles";
import ThemedTabs from "src/components/shared/Tabs/ThemedTabs";

export const EventsTabs = ({
  availableEvents,
  acquiredEvents,
  onRefreshBalance,
}: any) => {
  const [activeTab, setActiveTab] = useState("Disponibles");

  return (
    <View style={{ flex: 1 }}>
      <ThemedTabs
        tabs={["Disponibles", "Adquiridos"]}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
      />
      <EventsList
        events={activeTab === "Disponibles" ? availableEvents : acquiredEvents}
        tab={activeTab}
        onRefreshBalance={onRefreshBalance}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "center",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  activeText: {
    color: colors.primary,
    fontWeight: "600",
  },
});
