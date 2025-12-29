import React, { useEffect, useState, useMemo } from "react";
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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { GroupService, Group } from "@/services/GroupApiService";
import { useNotify } from "src/hooks";

const FILTERS = [
  { label: "Todos", value: "all" },
  { label: "Líderes", value: "leader" },
  { label: "Miembros", value: "member" },
];

const GroupMembersScreen = () => {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<{ params: { groupId: string } }, "params">>();
  const groupId = (route.params as any)?.groupId;
  const [group, setGroup] = useState<Group | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const notify = useNotify();

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      try {
        const data = await GroupService.getGroup(groupId);
        setGroup(data);
      } catch {
        notify.error({ message: "No se pudo cargar el grupo" });
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId, notify]);

  const members = useMemo(() => {
    if (!group?.members) return [];
    let filtered = group.members;
    if (filter === "leader")
      filtered = filtered.filter((m) => m.role === "LEADER");
    if (filter === "member")
      filtered = filtered.filter((m) => m.role === "MEMBER");
    if (search) {
      filtered = filtered.filter((m) =>
        (m.user?.name || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered;
  }, [group, filter, search]);

  const handlePromote = (memberId: string) => {
    notify.success({ message: "Ascendido a líder (demo)" });
  };
  const handleMessage = (memberId: string) => {
    notify.info({ message: "Chat privado (demo)" });
  };
  const handleRemove = (memberId: string) => {
    notify.confirm({
      message: "¿Seguro que quieres expulsar a este miembro?",
      onConfirm: () => notify.success({ message: "Miembro expulsado (demo)" }),
      onCancel: () => {},
    });
  };

  const renderMember = ({ item }: any) => {
    const isLeader = item.role === "LEADER";
    const isYou = item.user?.isCurrentUser;
    return (
      <View
        className={`flex-row items-center bg-white rounded-2xl mb-3 p-3 ${
          isYou ? "border-2 border-primary/60" : ""
        }`}
      >
        <Image
          source={{
            uri: item.user?.avatar_url || "https://placehold.co/48x48",
          }}
          className="w-12 h-12 rounded-full bg-gray-200"
        />
        <View className="flex-1 ml-3 min-w-0">
          <Text className="font-bold text-base truncate text-text-main-light">
            {item.user?.name} {isYou ? "(Tú)" : ""}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xs text-text-sec-light font-medium">
              {isLeader ? "Líder" : "Miembro"}
            </Text>
            {/* Demo: tiempo en común */}
            {!isLeader && (
              <Text className="text-xs text-text-sec-light">
                • 2 m en común
              </Text>
            )}
          </View>
          {/* Demo: fecha de unión */}
          {isYou && (
            <Text className="text-xs text-text-sec-light mt-1">
              Se unió el 12 Ene 2023
            </Text>
          )}
        </View>
        {isLeader && isYou && (
          <View className="ml-2 bg-primary/10 rounded-full px-2 py-1 flex-row items-center">
            <Text className="text-xs font-bold text-primary">Líder</Text>
            <Feather
              name="shield"
              size={16}
              color="#00e074"
              style={{ marginLeft: 4 }}
            />
          </View>
        )}
        {!isYou && (
          <TouchableOpacity
            onPress={() =>
              notify.info({ message: "Opciones de miembro (demo)" })
            }
            className="ml-2 p-2"
          >
            <Feather name="more-vertical" size={22} color="#5e8d76" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background-light">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-8 pb-1 bg-background-light">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Feather name="arrow-left" size={24} color="#101815" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-center text-lg font-bold">
            Gestión de Miembros
          </Text>
          <Text className="text-center text-sm text-text-sec-light">
            Grupo: {group?.name || "-"}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      {/* Invitar nuevo miembro */}
      <TouchableOpacity
        className="mx-5 my-4 h-12 rounded-full bg-primary flex-row items-center justify-center"
        onPress={() => notify.info({ message: "Invitar miembro (demo)" })}
      >
        <Feather
          name="user-plus"
          size={22}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text className="text-white font-bold text-base">
          Invitar Nuevo Miembro
        </Text>
      </TouchableOpacity>
      {/* Search */}
      <View className="px-5 mb-2">
        <View className="flex-row items-center bg-white rounded-xl shadow-sm px-4">
          <Feather name="search" size={22} color="#5e8d76" />
          <TextInput
            className="flex-1 h-12 px-2 text-base"
            placeholder="Buscar por nombre..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#8caea0"
          />
        </View>
      </View>
      {/* Filtros */}
      <View className="flex-row gap-3 px-5 pb-2">
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            className={`h-9 flex-row items-center justify-center rounded-xl px-4 ${
              filter === f.value
                ? "bg-primary"
                : "bg-white border border-gray-200"
            }`}
            onPress={() => setFilter(f.value)}
          >
            <Text
              className={`text-sm ${
                filter === f.value
                  ? "font-bold text-[#0f2319]"
                  : "font-medium text-text-main-light"
              }`}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Lista de miembros */}
      <View className="flex-row items-center justify-between px-5 mt-2 mb-1">
        <Text className="font-bold text-base">
          Lista de Miembros ({members.length})
        </Text>
        <TouchableOpacity
          onPress={() => notify.info({ message: "Ordenar (demo)" })}
        >
          <Text className="text-primary font-medium">Ordenar</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          loading ? (
            <Text className="text-center text-text-sec-light mt-10">
              Cargando...
            </Text>
          ) : (
            <Text className="text-center text-text-sec-light mt-10">
              No se encontraron miembros
            </Text>
          )
        }
      />
      {/* Demo: Modal de opciones de miembro (puedes implementar un modal real aquí) */}
      {/* ... */}
    </View>
  );
};

export default GroupMembersScreen;
