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
import { getGroupTypeFeatherIcon } from "./GroupsScreen";
import { notify } from "@/hooks/notification/notify.external";
import { useGroupPaymentTypes } from "@/hooks/useGroupPaymentTypes";

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
    }, [reloadMyGroups])
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

  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.group_type?.name || "").toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    const groupPrivacy = privacyOptions.find((p) => p.id === g.privacy_id);
    if (groupPrivacy && filter === groupPrivacy.code) return matchesSearch;
    return false;
  });

  const renderGroup = ({ item }: { item: Group }) => {
    const groupPrivacy = privacyOptions.find((p) => p.id === item.privacy_id);
    // Usar allow_free_join para determinar si es público (permite unirse libremente)
    const isPublic = groupPrivacy?.allow_free_join === true;

    const membersCount = groupMembersCount[item.id] ?? 0;
    const isMember = myGroupIds.has(item.id);
    const isOwner = user && item.user_id === user.id;

    let action = isPublic ? "Unirse" : "Privado";
    let actionStyle = isPublic
      ? "bg-primary text-[#0f2319]"
      : "bg-gray-100 text-text-main-light";
    let disabled = false;
    if (isMember || isOwner) {
      action = "Miembro";
      actionStyle = "bg-gray-200 text-text-main-light";
      disabled = true;
    } else if (!isPublic) {
      action = "Privado";
      actionStyle = "bg-gray-100 text-text-main-light";
      disabled = true; // Desabilitar porque no se puede unir desde aquí
    }

    const handleJoin = async () => {
      if (!user) {
        notify.error({
          message: "Debes estar autenticado para unirte a un grupo.",
        });
        return;
      }

      setJoiningGroupId(item.id);
      try {
        // Obtener información de privacidad del grupo
        const groupPrivacy = privacyOptions.find(
          (p) => p.id === item.privacy_id
        );
        const isPublic = groupPrivacy?.allow_free_join === true;

        // Si es privado, mostrar error
        if (!isPublic) {
          notify.error({
            message:
              "Este grupo es privado. Contacta al creador del grupo para solicitar acceso.",
          });
          return;
        }

        // Unirse a grupo público
        await GroupService.joinGroup(item.id, user.id);
        notify.success({
          message: "¡Te has unido al grupo exitosamente!",
        });

        // Recargar la lista de mis grupos desde el backend
        await reloadMyGroups();
      } catch (error: any) {
        let errorMsg = "No se pudo unir al grupo. Intenta nuevamente.";

        if (error?.response?.status === 403) {
          errorMsg = "No tienes permiso para unirte a este grupo.";
        } else if (error?.response?.status === 409) {
          errorMsg = "Ya eres miembro de este grupo.";
          // Recargar desde el backend para sincronizar
          await reloadMyGroups();
        } else if (error?.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error?.message) {
          errorMsg = error.message;
        }

        notify.error({ message: errorMsg });
      } finally {
        setJoiningGroupId(null);
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
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xs text-gray-600">
              {item.group_type && typeof item.group_type !== "string"
                ? item.group_type.name
                : "Otro"}
            </Text>
            <View className="w-1 h-1 bg-gray-400 rounded-full" />
            <Text className="text-xs text-gray-600">
              {(() => {
                if (!item.payment_type_id) return "Sin especificar";
                const paymentType = paymentTypesMap[item.payment_type_id];
                if (!paymentType) return "Sin especificar";

                switch (paymentType.code) {
                  case "EQUAL_SPLIT":
                    return "Dividida";
                  case "SPLIT":
                    return "Por Consumo";
                  case "FULL":
                    return "Completo";
                  default:
                    return paymentType.code || "Pago";
                }
              })()}
            </Text>
          </View>
        </View>
        <View className="shrink-0">
          <TouchableOpacity
            className={`min-w-[84px] h-9 px-4 rounded-xl items-center justify-center ${actionStyle} flex-row ${
              joiningGroupId === item.id ? "opacity-70" : ""
            }`}
            onPress={
              isMember || isOwner
                ? () =>
                    navigation.navigate("GroupDetailScreen", {
                      groupId: item.id,
                    })
                : !disabled && joiningGroupId !== item.id
                ? handleJoin
                : undefined
            }
            disabled={
              (!isMember && !isOwner && disabled) || joiningGroupId === item.id
            }
          >
            {joiningGroupId === item.id ? (
              <ActivityIndicator size="small" color="#0f2319" />
            ) : (
              <Text className="text-sm font-bold">{action}</Text>
            )}
          </TouchableOpacity>
        </View>
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
