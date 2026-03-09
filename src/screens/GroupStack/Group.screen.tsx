import { View, Text, Image } from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import LoadingScreen from "../Loading/Loading.screen";
import {
  Button,
  SearchBarInput,
  ThemedHeader,
  useThemedTabs,
} from "src/components";
import { FlatList, RefreshControl } from "react-native-gesture-handler";
import GroupListItem from "./components/GroupList/GroupList.renderItem";
import { useGroupList } from "./hooks/useGroupsList";
import { useCustomNavigation, useResponsiveLayout } from "src/hooks";
import { Group } from "src/services";
import ThemedTabs from "src/components/shared/Tabs/ThemedTabs";

export const GroupScreen = () => {
  const { data, loading, refresh, error, sortEvents, filters } = useGroupList();

  const [search, setSearch] = useState("");
  const { tabs, onTabChange, getFilteredByActiveTab, activeTab } =
    useThemedTabs([
      { label: "Todos" },
      { label: "Pendientes" },
      { label: "Finalizados" },
    ]);
  const { navigate } = useCustomNavigation();
  const { screenHeight, screenWidth } = useResponsiveLayout();
  const renderItem = useCallback(
    ({ item }: { item: Group }) => <GroupListItem item={item} />,
    [],
  );
  const filteredData = useMemo(() => {
    if (!data) return [];

    let result = [...data];

    // 🔎 search
    if (search) {
      const query = search.toLowerCase();
      result = result.filter((g) => g.name.toLowerCase().includes(query));
    }

    // 📑 tabs
    result = getFilteredByActiveTab(result, filters);

    // 📅 orden
    result = sortEvents(result);

    return result;
  }, [data, search, activeTab]);

  if (loading) {
    return <LoadingScreen title="Grupos" />;
  }
  if (error) {
    return <Text>Parece que tuvimos un error</Text>;
  }
  const hasNoGroups = !data || data.length === 0;
  const hasNoFilteredResults =
    data && data?.length > 0 && filteredData.length === 0;
  return (
    <FlatList
      ListHeaderComponent={
        <React.Fragment>
          <ThemedHeader title="Grupos" />
          <ThemedTabs tabs={tabs} onTabChange={onTabChange} />
          <SearchBarInput
            searchQuery={search}
            onSearchChange={setSearch}
            placeholder="Buscar por nombre..."
            styleContainer={{ marginTop: 4, marginHorizontal: 16 }}
          />
        </React.Fragment>
      }
      showsVerticalScrollIndicator={false}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 120 }}
      keyExtractor={(item) => item.id}
      data={filteredData}
      initialNumToRender={5}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
      ListEmptyComponent={
        hasNoGroups ? (
          <View className="m-auto mt-10 gap-4">
            <View className="bg-beland-orange-200 p-3 rounded-full mx-auto shadow">
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4N_ZsKNWSdlE8ZSCcyRHk3LtrbeN68wQll9_elKK53ia_bisDkguRt0mi8B-bD2k_YjQkJvPDCxSmqHqbfKiNvDJ_o2yMmMIXn9VAIJpEdoaKiX8C89MiStbEh7IEcEZ4eXgp3Fal98gM3Qi-h7HuybKV0iU6BEDSQh_1ZaRINnZppuHFE2TVsbAItxxRIFWNyYrTAJdenzvqgiRWw5if2pi0CRPyYQnlw0Hbj3x2anlMY-OZzMSw4Z6LbIDOZaOWU1hubT_5S-Q",
                }}
                className=" rounded-full border-4 border-white shadow-xl"
                resizeMode="cover"
                style={{ height: screenHeight / 3, width: screenWidth / 4 }}
              />
            </View>
            <Text className="text-center text-2xl">
              Al parecer aún no tienes grupos...
            </Text>
            <Text className="text-center text-xl text-gray-600">
              Que tal si creas uno para organizar una juntada?
            </Text>
            <View className="md:flex-row mx-auto gap-4">
              <Button
                title="Explorar Grupos"
                variant="secondary"
                onPress={() => navigate("GroupExplore")}
              />
              <Button
                title="Crear Grupo"
                onPress={() => navigate("GroupCreate")}
              />
            </View>
          </View>
        ) : hasNoFilteredResults ? (
          <View>
            <View className="text-center text-2xl">
              No encontramos lo que buscas
            </View>
            <Button
              title="Limpiar"
              onPress={() => {
                setSearch("");
                onTabChange("Todos");
              }}
              className="w-fit mx-auto"
            />
          </View>
        ) : null
      }
    />
  );
};

export default GroupScreen;
