import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
} from "react-native";
import { useGroupsNavigation, useGroups } from "./hooks";
import Feather from "react-native-vector-icons/Feather";
import { Button, ThemedHeader } from "src/components";
import { CustomLoader } from "@/components/shared/loader/Loader";
import { GroupService, GroupPrivacy } from "@/services/GroupApiService";
import { GroupCard } from "./components/GroupCard";
import { point } from "leaflet";
import { Plus, PlusCircle } from "lucide-react-native";
import { green } from "react-native-reanimated/lib/typescript/Colors";
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
  const { groups, activeGroups, onRefresh, refreshing, loading } = useGroups();
  // Forzar altura del listado en web mobile para diagnosticar scroll
  const windowHeight = Dimensions.get("window").height;
  // Reservar espacio para header + tabbar aproximado (ajusta si es necesario)
  const listHeight = Math.max(400, windowHeight - 160);
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
                group.id,
              );
            counts[group.id] = Array.isArray(members) ? members.length : 0;
          } catch {
            counts[group.id] = 0;
          }
        }),
      );
      setGroupMembersCount(counts);
    };
    fetchMembersCounts();
  }, [groups]);
  const [search, setSearch] = useState("");
  // Eliminado filtro de estados
  // Obtener todos los grupos del usuario
  const todosMisGrupos = groups;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light">
        <CustomLoader />
      </View>
    );
  }

  if (!todosMisGrupos || todosMisGrupos.length === 0) {
    return (
      <>
        <ThemedHeader title="Grupos" />
        <View className="flex-1 justify-center items-center bg-background-light px-4">
          <View className="items-center w-full">
            <View className="relative mb-8 mt-2 items-center justify-center">
              <View
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-orange-500 opacity-70 shadow-2xl"
                style={{ zIndex: 0 }}
              />
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4N_ZsKNWSdlE8ZSCcyRHk3LtrbeN68wQll9_elKK53ia_bisDkguRt0mi8B-bD2k_YjQkJvPDCxSmqHqbfKiNvDJ_o2yMmMIXn9VAIJpEdoaKiX8C89MiStbEh7IEcEZ4eXgp3Fal98gM3Qi-h7HuybKV0iU6BEDSQh_1ZaRINnZppuHFE2TVsbAItxxRIFWNyYrTAJdenzvqgiRWw5if2pi0CRPyYQnlw0Hbj3x2anlMY-OZzMSw4Z6LbIDOZaOWU1hubT_5S-Q",
                }}
                className="w-20 h-20 rounded-3xl border-4 border-white shadow-xl"
                resizeMode="cover"
                style={{ zIndex: 1 }}
              />

              <PlusCircle
                color={"orange"}
                fill={"white"}
                className="absolute bottom-2 right-2 z-10  rounded-full"
              />
            </View>
            <Text className="text-2xl font-bold text-text-main mb-2 text-center tracking-tight">
              No tienes grupos aún
            </Text>
            <Text className="text-base text-gray-500 mb-8 text-center max-w-xs">
              Únete a una comunidad existente o crea tu propio espacio para
              empezar a colaborar con otros.
            </Text>
            <View className="flex md:flex-row gap-2">
              <Button
                title=" Explorar grupos"
                onPress={navigateToExploreGroups}
                className="rounded-xl"
                variant="secondary"
              />
              <Button
                title="+ Crear nuevo grupo"
                onPress={navigateToCreateGroup}
                className="rounded-xl"
              />
            </View>
          </View>
        </View>
      </>
    );
  }

  // Filtros y búsqueda
  const filteredGroups = todosMisGrupos.filter((g) => {
    const groupTypeName =
      typeof g.group_type === "string"
        ? g.group_type
        : g.group_type?.name || "";
    return (
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      groupTypeName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FB" }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <ThemedHeader title="Grupos" />
        <FlatList
          style={{ height: listHeight, backgroundColor: "#F8F9FB" }}
          nestedScrollEnabled={true}
          stickyHeaderIndices={[0]}
          ListHeaderComponentStyle={{ zIndex: 10 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 120,
            paddingHorizontal: 0,
          }}
          data={filteredGroups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              variant="my-group"
              onPress={() =>
                navigate("GroupDetailScreen", { groupId: item.id })
              }
              privacyOptions={privacyOptions}
              membersCount={groupMembersCount[item.id] || 0}
              paymentType={item.payment_type}
              isMember={true}
              isOwner={item.is_leader}
            />
          )}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#00e074"]}
            />
          }
          ListHeaderComponent={
            <View style={{ backgroundColor: "#F8F9FB" }}>
              <View className="flex-row items-center px-4 pt-2 pb-2 mt-2 justify-between bg-white">
                <Text className="text-2xl font-bold text-text-main flex-1">
                  Mis Grupos
                </Text>
                <TouchableOpacity
                  className="flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 h-10 px-4 active:scale-95"
                  onPress={navigateToExploreGroups}
                >
                  <Feather name="compass" size={18} color="#00E074" />
                  <Text className="text-primary font-bold text-sm">
                    Explorar
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Search & Filters */}
              <View className="bg-white px-4 pb-4">
                <View className="py-2">
                  <View className="flex-row items-center bg-background-light rounded-xl px-4">
                    <Feather name="search" size={20} color="#5e8d76" />
                    <TextInput
                      className="flex-1 h-12 px-2 text-base"
                      placeholder="Buscar por nombre..."
                      value={search}
                      onChangeText={setSearch}
                      placeholderTextColor="#8caea0"
                    />
                  </View>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <Text className="text-center text-text-sec-light mt-10">
              No se encontraron grupos
            </Text>
          }
        />
      </View>
      {/* Botón flotante para crear grupo */}
      <View
        style={
          (Platform.OS === "web"
            ? {
                position: "fixed" as any,
                right: 10,
                bottom: 100,
                zIndex: 9999,
                pointerEvents: "auto",
              }
            : {
                position: "absolute" as any,
                right: 24,
                bottom: 32,
                zIndex: 9999,
                pointerEvents: "auto",
              }) as any
        }
      >
        <TouchableOpacity
          style={{
            height: 56,
            width: 56,
            borderRadius: 28,
            backgroundColor: "#00E074",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={navigateToCreateGroup}
        >
          <Feather name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
