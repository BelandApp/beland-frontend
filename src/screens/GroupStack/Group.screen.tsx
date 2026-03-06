import { View, Text, Image } from "react-native";
import React, { useState } from "react";
import LoadingScreen from "../Loading/Loading.screen";
import { Button, SearchBarInput, ThemedHeader } from "src/components";
import { FlatList, RefreshControl } from "react-native-gesture-handler";
import GroupListItem from "./components/GroupList/GroupList.renderItem";
import { useGroupList } from "./hooks/useGroupsList";
import { useCustomNavigation, useResponsiveLayout } from "src/hooks";

export const GroupScreen = () => {
  const { data, loading, refresh, error } = useGroupList();
  // TODO implementar filter
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(data);
  console.log(data);
  const { navigate } = useCustomNavigation();
  const { screenHeight, screenWidth } = useResponsiveLayout();
  if (loading) {
    return <LoadingScreen title="Grupos" />;
  }
  if (error) {
    return <Text>Parece que tuvimos un error</Text>;
  }

  return (
    <FlatList
      ListHeaderComponent={
        <React.Fragment>
          <ThemedHeader title="Grupos" />
          <SearchBarInput
            searchQuery={search}
            onSearchChange={setSearch}
            placeholder="Buscar por nombre..."
            styleContainer={{ marginTop: 4, marginHorizontal: 16 }}
          />
        </React.Fragment>
      }
      renderItem={GroupListItem}
      keyExtractor={(item) => item.id}
      data={data}
      extraData={filtered}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
      ListEmptyComponent={
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
      }
    />
  );
};

export default GroupScreen;
