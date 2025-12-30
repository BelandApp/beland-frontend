import React, { useState, useMemo, useEffect } from "react";
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
import { ThemedHeader } from "src/components";
import { GroupService, GroupPrivacy } from "@/services/GroupApiService";
// Ícono según código de privacidad
const getPrivacyIcon = (privacyCode: string) => {
  if (privacyCode === "public") return "globe";
  return "lock";
};

// Mapea el nombre de la categoría a un ícono Feather
export const getGroupTypeFeatherIcon = (type: any) => {
  if (!type) return { name: "tag", color: "#5e8d76" };
  const t = type.toLowerCase();
  if (t.includes("cumple")) return { name: "gift", color: "#eab308" };
  if (t.includes("gradu")) return { name: "award", color: "#6366f1" };
  if (t.includes("aniversa")) return { name: "heart", color: "#f43f5e" };
  if (t.includes("amig")) return { name: "users", color: "#5e8d76" };
  if (t.includes("famil")) return { name: "home", color: "#f59e42" };
  if (t.includes("temat")) return { name: "star", color: "#fbbf24" };
  if (t.includes("picnic")) return { name: "sun", color: "#fbbf24" };
  if (t.includes("asado")) return { name: "coffee", color: "#a16207" };
  if (t.includes("año nuevo")) return { name: "calendar", color: "#0ea5e9" };
  if (t.includes("romant")) return { name: "heart", color: "#f43f5e" };
  if (t.includes("bienven")) return { name: "smile", color: "#22d3ee" };
  if (t.includes("desped")) return { name: "flag", color: "#f87171" };
  if (t.includes("infant")) return { name: "smile", color: "#fbbf24" };
  if (t.includes("deport")) return { name: "activity", color: "#22c55e" };
  if (t.includes("trabajo")) return { name: "briefcase", color: "#6366f1" };
  return { name: "tag", color: "#5e8d76" };
};

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
  // Tipos de privacidad dinámicos
  const [privacyOptions, setPrivacyOptions] = useState<GroupPrivacy[]>([]);
  useEffect(() => {
    GroupService.getGroupPrivacies()
      .then(setPrivacyOptions)
      .catch(() => setPrivacyOptions([]));
  }, []);
  const { navigateToCreateGroup } = useGroupsNavigation();
  const { navigate } = require("@react-navigation/native").useNavigation();
  const navigateToExploreGroups = () => {
    navigate("GroupExplore");
  };
  const { groups, activeGroups, onRefresh, refreshing } = useGroups();
  const [groupMembersCount, setGroupMembersCount] = useState<
    Record<string, number>
  >({});

  React.useEffect(() => {
    const fetchMembersCounts = async () => {
      if (!groups || !Array.isArray(groups)) return;
      const counts: Record<string, number> = {};
      await Promise.all(
        groups.map(async (group) => {
          try {
            const members =
              await require("@/services/GroupApiService").GroupService.getGroupMembers(
                group.id
              );
            counts[group.id] = Array.isArray(members) ? members.length : 0;
          } catch {
            counts[group.id] = 0;
          }
        })
      );
      setGroupMembersCount(counts);
    };
    fetchMembersCounts();
  }, [groups]);
  const [search, setSearch] = useState("");
  // Eliminado filtro de estados
  // Obtener todos los grupos del usuario
  const todosMisGrupos = groups;

  if (!todosMisGrupos || todosMisGrupos.length === 0) {
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

  // Filtros y búsqueda usando group_type como string
  // Solo búsqueda por nombre o tipo
  const filteredGroups = todosMisGrupos.filter((g) => {
    const groupTypeName = g.group_type || "";
    return (
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      groupTypeName.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Estado: sin resultados para filtro/búsqueda
  if (filteredGroups.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light px-4">
        <Text className="text-xl font-bold text-gray-500 mb-4 text-center">
          No hay resultados para tu búsqueda o filtro
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
    );
  }

  return (
    <View className="flex-1 bg-background-light">
      {/* Header */}
      <ThemedHeader title="Grupos" />
      <View className="flex-row items-center px-4 pt-12 pb-2 mt-2 justify-between bg-white sticky top-0 ">
        <Text className="text-2xl font-bold text-text-main flex-1">
          Mis Grupos
        </Text>
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
        {/* Filtros eliminados, solo búsqueda */}
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
          <TouchableOpacity
            className="group relative flex flex-col rounded-2xl bg-white p-4 shadow-sm mb-4 border border-transparent"
            onPress={() => navigate("GroupDetailScreen", { groupId: item.id })}
          >
            <View className="w-full h-32 rounded-xl mb-3 overflow-hidden bg-gray-100 items-center justify-center">
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <Feather
                  name={getGroupTypeFeatherIcon(item.group_type).name}
                  size={56}
                  color={getGroupTypeFeatherIcon(item.group_type).color}
                  style={{ opacity: 0.7 }}
                />
              )}
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
                      item.is_active === true ? "bg-primary" : "bg-gray-400"
                    }`}
                  />
                  <Text
                    className={`text-xs font-medium ${
                      item.is_active === true ? "text-primary" : "text-gray-500"
                    }`}
                  >
                    {item.is_active === true ? "Activo" : "Inactivo"}
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
                {/* Privacidad dinámica */}
                {(() => {
                  const groupPrivacy = privacyOptions.find(
                    (p) => p.id === ((item as any).privacy_id || item.privacy)
                  );
                  return (
                    <View className="flex-row items-center gap-1.5 bg-background-light px-2 py-1 rounded-lg">
                      <Feather
                        name={getPrivacyIcon(groupPrivacy?.code || "")}
                        size={16}
                        color="#5e8d76"
                      />
                      <Text className="text-xs text-gray-500 font-medium">
                        {groupPrivacy?.name || "Privado"}
                      </Text>
                    </View>
                  );
                })()}
                <View className="flex-row items-center gap-1.5 bg-background-light px-2 py-1 rounded-lg">
                  <Feather name="users" size={16} color="#5e8d76" />
                  <Text className="text-xs text-gray-500 font-medium">
                    {groupMembersCount[item.id] ?? 0} Miembros
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
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
