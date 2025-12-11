import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ThemedHeader } from "src/components/shared/headers/Header";
import ThemedTabs from "src/components/shared/Tabs/ThemedTabs";
import { useThemedTabs } from "src/components/shared/Tabs/hook/useTabs";
import { useEvents } from "src/hooks/event/useEvents";
import { AcquiredEventCard } from "src/screens/Events/components/AcquiredEventCard";
import { CustomLoader } from "src/components";

const MisEntradasScreen: React.FC = () => {
  const { tabs, onTabChange, activeTab } = useThemedTabs([
    "Próximos",
    "Anteriores",
  ]);
  const { acquiredEvents, isLoading, refresh } = useEvents();

  if (isLoading) return <CustomLoader />;

  const now = Date.now();
  const proximos = acquiredEvents.filter((e: any) => {
    return e.event_date ? new Date(e.event_date).getTime() >= now : true;
  });
  const anteriores = acquiredEvents.filter((e: any) => {
    return e.event_date ? new Date(e.event_date).getTime() < now : false;
  });

  const listToShow = activeTab === "Próximos" ? proximos : anteriores;

  return (
    <View style={styles.container}>
      <ThemedHeader title="Mis Entradas" canGoBack />
      <ThemedTabs tabs={tabs} onTabChange={onTabChange} />
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {listToShow.length === 0 ? (
          <View style={{ padding: 16 }}>
            <Text style={{ textAlign: "center" }}>
              {activeTab === "Próximos"
                ? "No tienes entradas próximas."
                : "No hay entradas anteriores."}
            </Text>
          </View>
        ) : (
          listToShow.map((ev: any) => (
            <View
              key={ev.user_pass_id || ev.id}
              style={{
                width: "48%",
                marginBottom: 16,
              }}
            >
              <AcquiredEventCard {...ev} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F8" },
});

export default MisEntradasScreen;
