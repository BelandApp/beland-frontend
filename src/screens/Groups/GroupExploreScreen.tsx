import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  FlatList,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { GroupService, Group, GroupMember } from "@/services/GroupApiService";
import { GroupPrivacy } from "@/services/GroupApiService";
import { useAuth } from "@/context/AuthContext";
import { getGroupTypeFeatherIcon } from "./GroupsScreen";
import { notify } from "@/hooks/notification/notify.external";

// Los filtros se generan dinámicamente según los tipos de privacidad

const getPrivacyIcon = (privacyCode: string) => {
  if (privacyCode === "public") return "globe";
  return "lock";
};

type RootStackParamList = {
  GroupDetailScreen: { groupId: string };
};
const GroupExploreScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroupIds, setMyGroupIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  // Tipos de privacidad
  const [privacyOptions, setPrivacyOptions] = useState<GroupPrivacy[]>([]);
  useEffect(() => {
    GroupService.getGroupPrivacies()
      .then(setPrivacyOptions)
      .catch(() => setPrivacyOptions([]));
  }, []);

  // Cargar los grupos a los que pertenece el usuario
  useEffect(() => {
    const fetchMyGroups = async () => {
      if (!user) return;
      try {
        const res = await GroupService.getMyGroups();
        const ids = (res.data || []).map((g: Group) => g.id);
        setMyGroupIds(new Set(ids));
      } catch {
        setMyGroupIds(new Set());
      }
    };
    fetchMyGroups();
  }, [user]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [groupMembersCount, setGroupMembersCount] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
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

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        // Aquí podrías filtrar por públicos/privados si el backend lo soporta
        const res = await GroupService.getGroups();
        setGroups(res.data || []);
      } catch {
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.group_type?.name || "").toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    // Buscar el code del tipo de privacidad
    const groupPrivacy = privacyOptions.find((p) => p.id === g.privacy_id);
    if (groupPrivacy && filter === groupPrivacy.code) return matchesSearch;
    return false;
  });

  const renderGroup = ({ item }: { item: Group }) => {
    const groupPrivacy = privacyOptions.find((p) => p.id === item.privacy_id);
    const isPublic = groupPrivacy?.code === "public";
    const membersCount = groupMembersCount[item.id] ?? 0;
    const isMember = myGroupIds.has(item.id);
    const isOwner = user && item.user_id === user.id;
    let action = isPublic ? "Unirse" : "Solicitar";
    let actionStyle = isPublic
      ? "bg-primary text-[#0f2319]"
      : "bg-gray-100 text-text-main-light";
    let disabled = false;
    if (isMember || isOwner) {
      action = "Miembro";
      actionStyle = "bg-gray-200 text-text-main-light";
      disabled = true;
    } else if (groupPrivacy?.require_approval) {
      action = "Solicitar acceso";
      actionStyle = "bg-gray-100 text-text-main-light";
    }

    // Handler para unirse al grupo
    const handleJoin = async () => {
      if (!user) return;
      if (groupPrivacy?.require_approval) {
        notify.info({
          message:
            "Este grupo requiere aprobación del administrador. No puedes unirte directamente. Espera a que el administrador te invite o apruebe tu solicitud.",
        });
        return;
      }
      try {
        await GroupService.post("group-members", {
          group_id: item.id,
          user_id: user.id,
        });
        // Refrescar grupos del usuario
        const res = await GroupService.getMyGroups();
        const ids = (res.data || []).map((g: Group) => g.id);
        setMyGroupIds(new Set(ids));
        notify.success({ message: "¡Te has unido al grupo exitosamente!" });
      } catch (e: any) {
        let msg = "No se pudo unir al grupo. Intenta nuevamente.";
        if (e?.response?.data?.message) {
          msg = e.response.data.message;
        } else if (e?.message) {
          msg = e.message;
        }
        notify.error({ message: msg });
      }
    };

    return (
      <View className="flex-row items-center gap-4 bg-white p-3 pr-4 rounded-2xl shadow-sm border border-transparent mb-3">
        <View className="relative shrink-0">
          <Feather
            name={
              item.group_type
                ? typeof item.group_type === "string"
                  ? getGroupTypeFeatherIcon(item.group_type).name
                  : "users"
                : "users"
            }
            size={48}
            color={
              item.group_type
                ? typeof item.group_type === "string"
                  ? getGroupTypeFeatherIcon(item.group_type).color
                  : "#5e8d76"
                : "#5e8d76"
            }
            style={{ opacity: 0.7 }}
          />
        </View>
        <View className="flex-1 min-w-0">
          <Text className="text-base font-bold leading-tight truncate text-text-main-light">
            {item.name}
          </Text>
          <View className="flex-row items-center gap-1 mt-1">
            <Feather
              name={getPrivacyIcon(groupPrivacy?.code || "lock")}
              size={14}
              color={isPublic ? "#00e074" : "#5e8d76"}
            />
            <Text className="text-xs font-medium text-text-sec-light truncate">
              {groupPrivacy?.name || "Privado"} • {membersCount} miembros
            </Text>
          </View>
        </View>
        <View className="shrink-0">
          <TouchableOpacity
            className={`min-w-[84px] h-9 px-4 rounded-xl items-center justify-center ${actionStyle} flex-row`}
            onPress={!disabled ? handleJoin : undefined}
            disabled={disabled}
          >
            <Text className="text-sm font-bold">{action}</Text>
          </TouchableOpacity>
        </View>
        {/* Solo si eres miembro puedes navegar al detalle */}
        {isMember && (
          <TouchableOpacity
            className="absolute inset-0"
            style={{ zIndex: 1 }}
            onPress={() =>
              navigation.navigate("GroupDetailScreen", { groupId: item.id })
            }
          />
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background-light">
      {/* Header */}
      <View className="sticky top-0 z-10 bg-background-light/95 flex-row items-center justify-between p-4 pb-2">
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
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
      {/* Filter Chips */}
      <View className="flex-row gap-3 px-4 py-3 pb-4">
        <TouchableOpacity
          key="all"
          className={`h-9 flex-row items-center gap-x-2 rounded-xl px-4 ${
            filter === "all"
              ? "bg-primary shadow-md"
              : "bg-white border border-gray-200"
          }`}
          onPress={() => setFilter("all")}
        >
          <Feather
            name="users"
            size={20}
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
            className={`h-9 flex-row items-center gap-x-2 rounded-xl px-4 ${
              filter === p.code
                ? "bg-primary shadow-md"
                : "bg-white border border-gray-200"
            }`}
            onPress={() => setFilter(p.code)}
          >
            <Feather
              name={getPrivacyIcon(p.code)}
              size={20}
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
      </View>
      {/* Groups List */}
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          loading ? (
            <Text className="text-center text-text-sec-light mt-10">
              Cargando...
            </Text>
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
