import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  RefreshControl,
} from "react-native";
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

  const windowWidth = Dimensions.get("window").width;
  const numColumns = windowWidth >= 760 ? 2 : 1;

  if (isLoading) return <CustomLoader />;

  const now = Date.now();
  const proximos = acquiredEvents.filter((e: any) =>
    e?.event_date ? new Date(e.event_date).getTime() >= now : true
  );
  const anteriores = acquiredEvents.filter((e: any) =>
    e?.event_date ? new Date(e.event_date).getTime() < now : false
  );

  const listToShow = activeTab === "Próximos" ? proximos : anteriores;

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.itemContainer, numColumns > 1 && styles.itemTablet]}>
      <AcquiredEventCard {...item} />
    </View>
  );

  return (
    <View style={styles.container}>
      <ThemedHeader title="Mis Entradas" canGoBack />
      <ThemedTabs tabs={tabs} onTabChange={onTabChange} />

      <FlatList
        data={listToShow}
        keyExtractor={(ev: any) =>
          String(ev.user_pass_id || ev.id || ev.event_pass_id)
        }
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === "Próximos"
                ? "No tienes entradas próximas."
                : "No hay entradas anteriores."}
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => refresh().catch(() => {})}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F8" },
  listContent: { padding: 12, paddingBottom: 24 },
  itemContainer: { marginBottom: 12, width: "100%" },
  itemTablet: { flex: 1, paddingHorizontal: 8 },
  columnWrapper: { justifyContent: "space-between" },
  emptyContainer: { padding: 20 },
  emptyText: { textAlign: "center", color: "#666" },
});

export default MisEntradasScreen;
