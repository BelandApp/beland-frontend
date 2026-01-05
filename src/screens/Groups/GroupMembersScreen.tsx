import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
  Image,
  FlatList,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Feather from "react-native-vector-icons/Feather";
// removed GroupMembersList import to render list inline for better web/mobile scroll control
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { GroupService, GroupMember } from "@/services/GroupApiService";
import { useNotify } from "src/hooks";
import { useAuth } from "src/context/AuthContext";
import { CustomLoader } from "@/components/shared/loader/Loader";

const FILTERS = [
  { label: "Todos", value: "all" },
  { label: "Líderes", value: "LEADER" },
  { label: "Miembros", value: "MEMBER" },
];

type InviteMemberModalProps = {
  visible: boolean;
  onClose: () => void;
  onInvite: (data: { email: string; role: "LEADER" | "MEMBER" }) => void;
  loading: boolean;
};
const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  visible,
  onClose,
  onInvite,
  loading,
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"LEADER" | "MEMBER">("MEMBER");
  const handleInvite = () => {
    if (!email) return;
    onInvite({ email, role });
  };
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-2xl p-6">
          <Text className="text-lg font-bold mb-2">Invitar Nuevo Miembro</Text>
          <TextInput
            className="border rounded-lg px-4 py-2 mb-4"
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View className="flex-row mb-4">
            <TouchableOpacity
              className={`flex-1 p-2 rounded-lg border mr-2 ${
                role === "MEMBER"
                  ? "border-primary bg-primary/10"
                  : "border-gray-200"
              }`}
              onPress={() => setRole("MEMBER")}
            >
              <Text
                className={
                  role === "MEMBER" ? "text-primary font-bold" : "text-gray-700"
                }
              >
                Miembro
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-2 rounded-lg border ${
                role === "LEADER"
                  ? "border-primary bg-primary/10"
                  : "border-gray-200"
              }`}
              onPress={() => setRole("LEADER")}
            >
              <Text
                className={
                  role === "LEADER" ? "text-primary font-bold" : "text-gray-700"
                }
              >
                Líder
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-end gap-2">
            <Pressable
              onPress={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100"
            >
              <Text className="text-gray-700 font-semibold">Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={handleInvite}
              className="px-4 py-2 rounded-lg bg-primary"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold">Invitar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

type MemberOptionsModalProps = {
  visible: boolean;
  member: GroupMember | null;
  onClose: () => void;
  onPromote: () => void;
  onRemove: () => void;
  loading: boolean;
  isGroupLeader: boolean;
};
const MemberOptionsModal: React.FC<MemberOptionsModalProps> = ({
  visible,
  member,
  onClose,
  onPromote,
  onRemove,
  loading,
  isGroupLeader,
}) => {
  if (!member) return null;

  const isLeader = member.role === "LEADER";

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl p-6">
          {/* Header con avatar */}
          <View className="flex-row items-center mb-6 pb-4 border-b border-gray-100">
            <Image
              source={{
                uri:
                  member.user?.profile_picture_url ||
                  member.user?.avatar_url ||
                  "https://placehold.co/64x64",
              }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "#e5e7eb",
                marginRight: 12,
              }}
            />
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {member.user?.name || member.user?.full_name || member.user_id}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <MaterialCommunityIcons
                  name={isLeader ? "crown" : "account"}
                  size={14}
                  color={isLeader ? "#6BA43A" : "#666"}
                />
                <Text
                  className={`text-sm font-semibold ${
                    isLeader ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {isLeader ? "Líder del grupo" : "Miembro"}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                {member.user?.email || "Sin email"}
              </Text>
            </View>
          </View>

          {/* Información adicional */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-xs text-gray-600 font-medium mb-1">
                  FECHA DE UNIÓN
                </Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {(() => {
                    const dateStr = member.joined_at || member.created_at;
                    if (!dateStr) return "Sin fecha";
                    return new Date(dateStr as string).toLocaleDateString(
                      "es-AR",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    );
                  })()}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-gray-600 font-medium mb-1">
                  ESTADO
                </Text>
                <View className="flex-row items-center gap-1">
                  <View className="w-2 h-2 rounded-full bg-green-500" />
                  <Text className="text-sm font-semibold text-gray-900">
                    Activo
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Acciones */}
          {isGroupLeader && (
            <View className="gap-3 mb-4">
              {/* Cambiar rol */}
              {!isLeader && (
                <TouchableOpacity
                  className="flex-row items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200"
                  onPress={onPromote}
                  disabled={loading}
                >
                  <MaterialCommunityIcons
                    name="crown"
                    size={20}
                    color="#6BA43A"
                  />
                  <Text className="flex-1 font-semibold text-green-700">
                    Ascender a Líder
                  </Text>
                  {loading && <ActivityIndicator color="#6BA43A" />}
                </TouchableOpacity>
              )}

              {isLeader && (
                <TouchableOpacity
                  className="flex-row items-center gap-3 p-4 rounded-xl bg-orange-50 border border-orange-200"
                  onPress={onPromote}
                  disabled={loading}
                >
                  <MaterialCommunityIcons
                    name="shield-account"
                    size={20}
                    color="#F88D2A"
                  />
                  <Text className="flex-1 font-semibold text-orange-700">
                    Remover del Liderazgo
                  </Text>
                  {loading && <ActivityIndicator color="#F88D2A" />}
                </TouchableOpacity>
              )}

              {/* Remover miembro */}
              <TouchableOpacity
                className="flex-row items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200"
                onPress={onRemove}
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name="account-remove"
                  size={20}
                  color="#DC2626"
                />
                <Text className="flex-1 font-semibold text-red-700">
                  Expulsar del Grupo
                </Text>
                {loading && <ActivityIndicator color="#DC2626" />}
              </TouchableOpacity>
            </View>
          )}

          {/* Botón cerrar */}
          <TouchableOpacity
            className="w-full py-3 rounded-lg bg-gray-100"
            onPress={onClose}
            disabled={loading}
          >
            <Text className="text-center font-semibold text-gray-700">
              Cerrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const GroupMembersScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route =
    useRoute<
      RouteProp<{ params: { groupId: string; groupName?: string } }, "params">
    >();
  const groupId = (route.params as any)?.groupId;
  const groupName = (route.params as any)?.groupName || "-";
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(
    null
  );
  const [optionsModal, setOptionsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const notify = useNotify();
  const isCurrentUserLeader = members.some(
    (m) =>
      (m.user?.id === user?.id || m.user_id === user?.id) && m.role === "LEADER"
  );

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await GroupService.getGroupMembers(groupId);
      setMembers(data);
    } catch {
      notify.error({ message: "No se pudo cargar la lista de miembros" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const filteredMembers = useMemo(() => {
    let filtered = members;
    if (filter !== "all") filtered = filtered.filter((m) => m.role === filter);
    if (search)
      filtered = filtered.filter((m) =>
        (m.user?.name || "").toLowerCase().includes(search.toLowerCase())
      );
    return filtered;
  }, [members, filter, search]);

  const windowHeight = Dimensions.get("window").height;
  const listHeight = Math.max(420, windowHeight - 160);

  const renderMember = ({ item }: { item: any }) => {
    const isLeader = item.role === "LEADER";
    const isYou =
      user && (item.user?.id === user.id || item.user_id === user.id);
    let fechaUnion = "";
    const rawDate = item.joined_at || item.created_at;
    if (rawDate) {
      const date = new Date(rawDate);
      fechaUnion = date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    const displayName =
      item.user?.full_name || item.user?.email || item.user_id;
    const avatarUrl =
      item.user?.profile_picture_url || "https://placehold.co/48x48";

    return (
      <View
        className={`flex-row items-center bg-white rounded-2xl mb-3 p-4 mx-5 ${
          isYou
            ? "border-2 border-green-500 bg-green-50/30"
            : "border border-gray-200"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        {/* Avatar */}
        <View className="relative">
          <Image
            source={{ uri: avatarUrl }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "#e5e7eb",
            }}
          />
          {isLeader && (
            <View className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-white">
              <MaterialCommunityIcons name="crown" size={12} color="#000" />
            </View>
          )}
        </View>

        {/* Info */}
        <View className="flex-1 ml-4 min-w-0">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="font-bold text-base truncate text-gray-900">
              {displayName}
            </Text>
            {isYou && (
              <View className="bg-blue-100 rounded-full px-2 py-0.5">
                <Text className="text-xs font-bold text-blue-700">Tú</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center gap-2 mb-1">
            <MaterialCommunityIcons
              name={isLeader ? "shield-check" : "account"}
              size={14}
              color={isLeader ? "#6BA43A" : "#666"}
            />
            <Text
              className={`text-xs font-semibold ${
                isLeader ? "text-green-600" : "text-gray-600"
              }`}
            >
              {isLeader ? "Líder del grupo" : "Miembro"}
            </Text>
          </View>

          {fechaUnion && (
            <Text className="text-xs text-gray-500 mt-0.5">
              Se unió el {fechaUnion}
            </Text>
          )}
        </View>

        {/* Acciones */}
        {isCurrentUserLeader && !isYou && (
          <TouchableOpacity
            onPress={() => {
              setSelectedMember(item);
              setOptionsModal(true);
            }}
            className="ml-3 p-2 hover:bg-gray-100 rounded-lg"
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={20}
              color="#6BA43A"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleInvite = async ({ email, role }: any) => {
    setInviteLoading(true);
    try {
      await GroupService.inviteToGroup(groupId, { email, role });
      setInviteModal(false);
      fetchMembers();
      notify.success({ message: "Invitación enviada" });
    } catch {
      notify.error({ message: "No se pudo invitar al miembro" });
    } finally {
      setInviteLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      const newRole = selectedMember.role === "LEADER" ? "MEMBER" : "LEADER";
      await GroupService.updateMemberRole(groupId, selectedMember.id, newRole);
      setOptionsModal(false);
      fetchMembers();
      const message =
        newRole === "LEADER"
          ? "Miembro ascendido a líder"
          : "Líder degradado a miembro";
      notify.success({ message });
    } catch {
      notify.error({ message: "No se pudo cambiar el rol del miembro" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      await GroupService.removeMember(groupId, selectedMember.id);
      setOptionsModal(false);
      fetchMembers();
      notify.success({ message: "Miembro expulsado" });
    } catch {
      notify.error({ message: "No se pudo expulsar al miembro" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background-light">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-8 pb-1 bg-background-light">
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          className="mr-4 p-2 border-2 border-green-500 rounded-full"
        >
          <Feather name="arrow-left" size={24} color="#00E074" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-center text-lg font-bold">
            Gestión de Miembros
          </Text>
          <Text className="text-center text-sm text-text-sec-light">
            Grupo: {groupName}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      {/* Invitar nuevo miembro */}
      <TouchableOpacity
        className="mx-5 my-4 h-12 rounded-full bg-primary flex-row items-center justify-center"
        onPress={() => setInviteModal(true)}
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
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        style={
          Platform.OS === "web"
            ? ({ height: listHeight, overflow: "auto" } as any)
            : { flex: 1 }
        }
        contentContainerStyle={{
          paddingHorizontal: 0,
          paddingBottom: 40,
          flexGrow: 1,
        }}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingTop: 24 }}>
              <CustomLoader />
            </View>
          ) : (
            <Text className="text-center text-text-sec-light mt-10">
              No se encontraron miembros
            </Text>
          )
        }
      />
      <InviteMemberModal
        visible={inviteModal}
        onClose={() => setInviteModal(false)}
        onInvite={handleInvite}
        loading={inviteLoading}
      />
      <MemberOptionsModal
        visible={optionsModal}
        member={selectedMember}
        onClose={() => setOptionsModal(false)}
        onPromote={handlePromote}
        onRemove={handleRemove}
        loading={actionLoading}
        isGroupLeader={isCurrentUserLeader}
      />
    </View>
  );
};

export default GroupMembersScreen;
