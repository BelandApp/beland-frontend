import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useGroupsNavigation, useGroups } from "./hooks";
import Feather from "react-native-vector-icons/Feather";

const FILTERS = [
  { label: "Todos", value: "all" },
  { label: "Activos", value: "active" },
  { label: "Social", value: "social" },
  { label: "Trabajo", value: "work" },
];

const getTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "social":
      return <Feather name="users" size={16} color="#5e8d76" />;
    case "work":
      return <Feather name="briefcase" size={16} color="#5e8d76" />;
    case "viajes":
      return <Feather name="map" size={16} color="#5e8d76" />;
    default:
      return <Feather name="tag" size={16} color="#5e8d76" />;
  }
};

export const GroupsScreen: React.FC = () => {
  const { navigateToCreateGroup } = useGroupsNavigation();
  const { navigate } = require("@react-navigation/native").useNavigation();
  const navigateToExploreGroups = () => {
    navigate("GroupExplore");
  };
  const { activeGroups, onRefresh, refreshing } = useGroups();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const groups =
    typeof activeGroups === "function" ? activeGroups() : activeGroups;

  const filteredGroups = useMemo(() => {
    let filtered = groups || [];
    if (filter === "active")
      filtered = filtered.filter((g) => g.status === "active");
    if (filter === "social")
      filtered = filtered.filter(
        (g) => (g.group_type || "").toLowerCase() === "social"
      );
    if (filter === "work")
      filtered = filtered.filter(
        (g) =>
          (g.group_type || "").toLowerCase() === "trabajo" ||
          (g.group_type || "").toLowerCase() === "work"
      );
    if (search)
      filtered = filtered.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase())
      );
    return filtered;
  }, [groups, filter, search]);

  // Estado vacío
  if (!filteredGroups || filteredGroups.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light px-4">
        <View className="items-center w-full">
          <View className="relative mb-8 mt-2 items-center justify-center">
            <View
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-emerald-100 opacity-70 shadow-2xl"
              style={{ zIndex: 0 }}
            />
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4N_ZsKNWSdlE8ZSCcyRHk3LtrbeN68wQll9_elKK53ia_bisDkguRt0mi8B-bD2k_YjQkJvPDCxSmqHqbfKiNvDJ_o2yMmMIXn9VAIJpEdoaKiX8C89MiStbEh7IEcEZ4eXgp3Fal98gM3Qi-h7HuybKV0iU6BEDSQh_1ZaRINnZppuHFE2TVsbAItxxRIFWNyYrTAJdenzvqgiRWw5if2pi0CRPyYQnlw0Hbj3x2anlMY-OZzMSw4Z6LbIDOZaOWU1hubT_5S-Q",
              }}
              className="w-40 h-40 rounded-3xl border-4 border-white shadow-xl"
              resizeMode="cover"
              style={{ zIndex: 1 }}
            />
            <View
              className="absolute bottom-2 right-2 bg-white rounded-full shadow-lg p-1 items-center justify-center"
              style={{ zIndex: 2 }}
            >
              <Text className="text-primary text-2xl">＋</Text>
            </View>
          </View>
          <Text className="text-2xl font-bold text-text-main mb-2 text-center tracking-tight">
            No tienes grupos aún
          </Text>
          <Text className="text-base text-gray-500 mb-8 text-center max-w-xs">
            Únete a una comunidad existente o crea tu propio espacio para
            empezar a colaborar con otros.
          </Text>
          <TouchableOpacity
            className="w-full flex-row items-center justify-center gap-2 rounded-xl bg-primary h-12 mb-3 shadow-lg active:scale-95"
            onPress={navigateToCreateGroup}
            style={{ maxWidth: 400 }}
          >
            <Text className="text-white text-xl">＋</Text>
            <Text className="text-white font-bold text-base">
              Crear nuevo grupo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-full flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 h-12 active:scale-95"
            onPress={navigateToExploreGroups}
            style={{ maxWidth: 400 }}
          >
            <Feather name="compass" size={22} color="#00E074" />
            <Text className="text-primary font-bold text-base">
              Explorar grupos
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-12 pb-2 justify-between bg-white sticky top-0 z-20">
        <Text className="text-2xl font-bold text-text-main flex-1">
          Mis Grupos
        </Text>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-background-light items-center justify-center">
          <Feather name="bell" size={22} color="#101815" />
        </TouchableOpacity>
      </View>
      {/* Search & Filters */}
      <View className="bg-white px-4 pb-4 sticky top-[72px] z-10">
        <View className="py-2">
          <View className="flex-row items-center bg-background-light rounded-xl px-4">
            <Feather name="search" size={20} color="#5e8d76" />
            <TextInput
              className="flex-1 h-12 px-2 text-base"
              placeholder="Buscar grupos..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#8caea0"
            />
          </View>
        </View>
        <View className="flex-row gap-3 py-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              className={`h-9 flex-row items-center justify-center px-5 rounded-full ${
                filter === f.value
                  ? "bg-primary text-white shadow-md"
                  : "bg-background-light border border-gray-100"
              }`}
              onPress={() => setFilter(f.value)}
            >
              <Text
                className={`text-sm ${
                  filter === f.value
                    ? "font-semibold text-white"
                    : "font-medium text-text-main"
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Lista de grupos */}
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00e074"]}
          />
        }
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        renderItem={({ item }) => (
          <View className="group relative flex flex-col rounded-2xl bg-white p-4 shadow-sm mb-4 border border-transparent">
            <View className="w-full h-32 rounded-xl mb-3 overflow-hidden bg-gray-100">
              <Image
                source={{
                  uri: item.image_url || "https://placehold.co/400x200",
                }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
            <View className="flex flex-col justify-between flex-1 gap-2">
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center gap-2 mb-1">
                  {item.is_leader && (
                    <Text className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      Líder
                    </Text>
                  )}
                  <View
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.status === "active" ? "bg-primary" : "bg-gray-400"
                    }`}
                  />
                  <Text
                    className={`text-xs font-medium ${
                      item.status === "active"
                        ? "text-primary"
                        : "text-gray-500"
                    }`}
                  >
                    {item.status === "active" ? "Activo" : "Inactivo"}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Feather name="more-vertical" size={20} color="#bdbdbd" />
                </TouchableOpacity>
              </View>
              <Text className="text-lg font-bold text-text-main mb-1">
                {item.name}
              </Text>
              <View className="flex-row flex-wrap items-center gap-2 mt-1">
                {item.group_type && (
                  <View className="flex-row items-center gap-1.5 bg-background-light px-2 py-1 rounded-lg">
                    {getTypeIcon(item.group_type)}
                    <Text className="text-xs text-gray-500 font-medium">
                      {item.group_type}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center gap-1.5 bg-background-light px-2 py-1 rounded-lg">
                  <Feather
                    name={item.privacy === "Público" ? "globe" : "lock"}
                    size={16}
                    color="#5e8d76"
                  />
                  <Text className="text-xs text-gray-500 font-medium">
                    {item.privacy || "Privado"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5 bg-background-light px-2 py-1 rounded-lg">
                  <Feather name="users" size={16} color="#5e8d76" />
                  <Text className="text-xs text-gray-500 font-medium">
                    {item.members_count || 0} Miembros
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      />
      {/* Botón flotante para crear grupo */}
      <TouchableOpacity
        className="absolute bottom-8 right-6 h-14 w-14 rounded-full bg-primary items-center justify-center shadow-lg"
        onPress={navigateToCreateGroup}
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};
