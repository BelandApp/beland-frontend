import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  GroupService,
  Group,
  GroupMember,
  PaymentType,
} from "@/services/GroupApiService";
import { GroupPrivacy } from "@/services/GroupApiService";
import { useAuth } from "@/context/AuthContext";
import { CustomLoader } from "@/components/shared/loader/Loader";
import { GroupCard } from "./components/GroupCard";
import { getGroupTypeFeatherIcon } from "./GroupsScreen";
import { notify } from "@/hooks/notification/notify.external";
import { useGroupPaymentTypes } from "@/hooks/useGroupPaymentTypes";
import { useCustomNavigation } from "src/hooks";

// Los filtros se generan dinámicamente según los tipos de privacidad

const getPrivacyIcon = (privacyCode: string) => {
  if (privacyCode === "public") return "globe";
  return "lock";
};

const GroupExploreScreen = () => {
  const { navigate, goBack } = useCustomNavigation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroupIds, setMyGroupIds] = useState<Set<string>>(new Set());
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const { user } = useAuth();

  // Tipos de privacidad
  const [privacyOptions, setPrivacyOptions] = useState<GroupPrivacy[]>([]);

  // Cargar payment types con hook (cachado con useMemo)
  const { paymentTypesMap } = useGroupPaymentTypes();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [groupMembersCount, setGroupMembersCount] = useState<
    Record<string, number>
  >({});

  // Cargar privacidades y grupos en paralelo
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar privacidades y grupos en paralelo
        const [privaciesData, groupsRes] = await Promise.all([
          GroupService.getGroupPrivacies().catch(() => []),
          GroupService.getGroups().catch(() => ({ data: [] })),
        ]);

        setPrivacyOptions(privaciesData || []);
        setGroups(groupsRes?.data || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setPrivacyOptions([]);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Función para recargar myGroupIds desde el backend
  const reloadMyGroups = React.useCallback(async () => {
    if (!user) return;
    try {
      const res = await GroupService.getMyGroups();
      // getMyGroups() devuelve un array directo, no una respuesta paginada
      const groups = Array.isArray(res) ? res : res?.data || [];
      const ids = groups.map((g: Group) => g.id);
      setMyGroupIds(new Set(ids));
    } catch (error) {
      setMyGroupIds(new Set());
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      reloadMyGroups();
    }, [reloadMyGroups]),
  );

  // Cargar los grupos a los que pertenece el usuario al montar
  useEffect(() => {
    reloadMyGroups();
  }, [reloadMyGroups]);

  useEffect(() => {
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

  const filteredGroups = groups.filter((g) => {
    const groupPrivacy = privacyOptions.find((p) => p.id === g.privacy_id);
    const isPublic = groupPrivacy?.allow_free_join === true;
    const isMember = myGroupIds.has(g.id);
    const isOwner = user?.id === g.user_id;

    // Filter out private groups that belong to others (not member/owner)
    if (!isPublic && !isMember && !isOwner) return false;

    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (typeof g.group_type === "string"
        ? g.group_type
        : g.group_type?.name || ""
      )
        .toLowerCase()
        .includes(search.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (groupPrivacy && filter === groupPrivacy.code) return matchesSearch;
    return false;
  });

  const renderGroup = ({ item }: { item: Group }) => {
    const membersCount = groupMembersCount[item.id] ?? 0;
    const isMember = myGroupIds.has(item.id);
    const isOwner = user && item.user_id === user.id;

    // Action Logic
    const isJoining = joiningGroupId === item.id;
    // We need to re-derive groupPrivacy to check if we can join freely
    const groupPrivacy = privacyOptions.find((p) => p.id === item.privacy_id);
    const isPublic = groupPrivacy?.allow_free_join === true;

    // Determine button state
    // If member/owner -> "Miembro" (disabled)
    // If not public -> "Privado" (disabled)
    // If public -> "Unirse" (enabled)
    const canJoin = !isMember && !isOwner && isPublic;

    // Label logic
    let label = "Unirse";
    if (isJoining) label = "Uniéndose...";
    else if (isMember || isOwner) label = "Miembro";
    else if (!isPublic) label = "Privado";

    const handleAction = async () => {
      if (!isPublic) {
        notify.error({
          message: "Este grupo es privado. Contacta al creador.",
        });
        return;
      }
      if (!user) {
        notify.error({ message: "Debes estar autenticado para unirte." });
        return;
      }

      setJoiningGroupId(item.id);
      try {
        await GroupService.joinGroup(item.id, user.id);
        notify.success({ message: "¡Te has unido al grupo exitosamente!" });
        navigate("Groups", {
          screen: "GroupDetailScreen",
          params: { groupId: item.id },
        });
        await reloadMyGroups();
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.message || "No se pudo unir al grupo.";
        notify.error({ message: errorMsg });
      } finally {
        setJoiningGroupId(null);
      }
    };

    return (
      <GroupCard
        group={item}
        variant="explore"
        onPress={() =>
          navigate("Groups", {
            screen: "GroupDetailScreen",
            params: { groupId: item.id },
          })
        }
        privacyOptions={privacyOptions}
        membersCount={membersCount}
        paymentType={
          item.payment_type_id
            ? paymentTypesMap[item.payment_type_id]
            : undefined
        }
        isMember={isMember}
        isOwner={isOwner || false}
        onActionPress={handleAction}
        actionDisabled={!canJoin || isJoining}
        actionLabel={label}
        compact={true}
      />
    );
  };

  return (
    <View className="flex-1 bg-background-light">
      {/* Header */}
      <View className="sticky top-0 z-10 bg-background-light/95 flex-row items-center justify-between p-4 pb-2">
        <TouchableOpacity
          onPress={() => goBack()}
          className="mr-4 p-2 border-2 border-green-500 rounded-full"
        >
          <Feather name="arrow-left" size={24} color="#00E074" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold">
          Explorar Grupos
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-2">
        <View className="flex-row items-center bg-white rounded-xl shadow-sm px-4">
          <Feather name="search" size={22} color="#5e8d76" />
          <TextInput
            className="flex-1 h-12 px-2 text-base"
            placeholder="Buscar por nombre o categoría..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#8caea0"
          />
        </View>
      </View>

      {/* Filter Chips (sticky, scrollable horizontally, compact spacing) */}
      <View className="sticky top-16 z-10 bg-background-light/95">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingTop: 8,
            paddingBottom: 8,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            key="all"
            className={`h-8 flex-row items-center gap-x-2 rounded-xl px-3 mr-2 ${
              filter === "all"
                ? "bg-primary shadow-md"
                : "bg-white border border-gray-200"
            }`}
            onPress={() => setFilter("all")}
          >
            <Feather
              name="users"
              size={18}
              color={filter === "all" ? "#0f2319" : "#101815"}
            />
            <Text
              className={`text-sm ${
                filter === "all"
                  ? "font-bold text-[#0f2319]"
                  : "font-medium text-text-main-light"
              }`}
            >
              Todos
            </Text>
          </TouchableOpacity>
          {privacyOptions.map((p) => (
            <TouchableOpacity
              key={p.code}
              className={`h-8 flex-row items-center gap-x-2 rounded-xl px-3 mr-2 ${
                filter === p.code
                  ? "bg-primary shadow-md"
                  : "bg-white border border-gray-200"
              }`}
              onPress={() => setFilter(p.code)}
            >
              <Feather
                name={getPrivacyIcon(p.code)}
                size={18}
                color={filter === p.code ? "#0f2319" : "#101815"}
              />
              <Text
                className={`text-sm ${
                  filter === p.code
                    ? "font-bold text-[#0f2319]"
                    : "font-medium text-text-main-light"
                }`}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Groups List */}
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingTop: 24 }}>
              <CustomLoader />
            </View>
          ) : (
            <Text className="text-center text-text-sec-light mt-10">
              No se encontraron grupos
            </Text>
          )
        }
      />
    </View>
  );
};

export default GroupExploreScreen;
