import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { EventsList } from "./EventList";
import { colors } from "src/styles";

export const EventsTabs = ({
  availableEvents,
  acquiredEvents,
  onRefreshBalance,
}: any) => {
  const [activeTab, setActiveTab] = useState<"available" | "acquired">(
    "available"
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "available" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("available")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "available" && styles.activeText,
            ]}
          >
            Disponibles
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "acquired" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("acquired")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "acquired" && styles.activeText,
            ]}
          >
            Adquiridos
          </Text>
        </Pressable>
      </View>

      <EventsList
        events={activeTab === "available" ? availableEvents : acquiredEvents}
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
