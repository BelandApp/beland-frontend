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
import { GroupService, Group } from "@/services/GroupApiService";

const FILTERS = [
  { label: "Todos", value: "all", icon: "users" },
  { label: "Públicos", value: "public", icon: "globe" },
  { label: "Privados", value: "private", icon: "lock" },
];

const getPrivacyIcon = (privacy: string) =>
  privacy === "Público" ? "globe" : "lock";

type RootStackParamList = {
  GroupDetailScreen: { groupId: string };
};
const GroupExploreScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

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
    if (filter === "public")
      return matchesSearch && (g.privacy || "Público") === "Público";
    if (filter === "private")
      return matchesSearch && (g.privacy || "Privado") === "Privado";
    return matchesSearch;
  });

  const renderGroup = ({ item }: { item: Group }) => {
    const isPublic = (item.privacy || "Público") === "Público";
    const membersCount = item.members?.length || 0;
    // Estado de membresía simulado para demo
    let action = "Unirse";
    let actionStyle = "bg-primary text-[#0f2319]";
    if (!isPublic) {
      action = "Solicitar";
      actionStyle = "bg-gray-100 text-text-main-light";
    }

    if (item.status === "PENDING") {
      action = "Pendiente";
      actionStyle = "bg-transparent border border-gray-200 text-text-sec-light";
    }
    return (
      <TouchableOpacity
        className="flex-row items-center gap-4 bg-white p-3 pr-4 rounded-2xl shadow-sm border border-transparent mb-3"
        onPress={() =>
          navigation.navigate("GroupDetailScreen", { groupId: item.id })
        }
      >
        <View className="relative shrink-0">
          <Image
            source={{ uri: item.image_url || "https://placehold.co/64x64" }}
            className="w-16 h-16 rounded-xl bg-gray-200"
          />
        </View>
        <View className="flex-1 min-w-0">
          <Text className="text-base font-bold leading-tight truncate text-text-main-light">
            {item.name}
          </Text>
          <View className="flex-row items-center gap-1 mt-1">
            <Feather
              name={getPrivacyIcon(item.privacy || "Público")}
              size={14}
              color={isPublic ? "#00e074" : "#5e8d76"}
            />
            <Text className="text-xs font-medium text-text-sec-light truncate">
              {item.privacy || "Público"} • {membersCount} miembros
            </Text>
          </View>
        </View>
        <View className="shrink-0">
          <TouchableOpacity
            className={`min-w-[84px] h-9 px-4 rounded-xl items-center justify-center ${actionStyle} flex-row`}
            disabled={action === "Pendiente"}
          >
            <Text
              className={`text-sm font-bold ${
                action === "Pendiente" ? "text-text-sec-light" : ""
              }`}
            >
              {action}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background-light">
      {/* Header */}
      <View className="sticky top-0 z-10 bg-background-light/95 flex-row items-center justify-between p-4 pb-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="size-12 items-center justify-center rounded-full"
        >
          <Feather name="arrow-left" size={24} color="#101815" />
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
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            className={`h-9 flex-row items-center gap-x-2 rounded-xl px-4 ${
              filter === f.value
                ? "bg-primary shadow-md"
                : "bg-white border border-gray-200"
            }`}
            onPress={() => setFilter(f.value)}
          >
            <Feather
              name={f.icon as any}
              size={20}
              color={filter === f.value ? "#0f2319" : "#101815"}
            />
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
