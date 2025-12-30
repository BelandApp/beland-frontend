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
} from "react-native";
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
};
const MemberOptionsModal: React.FC<MemberOptionsModalProps> = ({
  visible,
  member,
  onClose,
  onPromote,
  onRemove,
  loading,
}) => {
  if (!member) return null;
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-2xl p-6">
          <View className="flex-row items-center mb-4">
            <Image
              source={{
                uri: member.user?.avatar_url || "https://placehold.co/48x48",
              }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#e5e7eb",
                marginRight: 12,
              }}
            />
            <View>
              <Text className="text-lg font-bold">
                {member.user?.name || member.user_id}
              </Text>
              <Text className="text-sm text-gray-500">Miembro</Text>
            </View>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-2 p-3 rounded-xl mb-2 bg-green-50"
            onPress={onPromote}
            disabled={loading}
          >
            <Feather name="shield" size={20} color="#00E074" />
            <Text className="font-semibold text-green-700">
              Ascender a Líder
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center gap-2 p-3 rounded-xl mb-2 bg-red-50"
            onPress={onRemove}
            disabled={loading}
          >
            <Feather name="user-x" size={20} color="#e74c3c" />
            <Text className="font-semibold text-red-600">
              Expulsar del Grupo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="mt-2 self-end" onPress={onClose}>
            <Text className="text-gray-500 font-semibold">Cerrar</Text>
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
        className={`flex-row items-center bg-white rounded-2xl mb-3 p-3 ${
          isYou ? "border-2 border-primary/60" : ""
        }`}
      >
        <Image
          source={{ uri: avatarUrl }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#e5e7eb",
          }}
        />
        <View className="flex-1 ml-3 min-w-0">
          <Text className="font-bold text-base truncate text-text-main-light">
            {displayName} {isYou ? "(Tú)" : ""}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xs text-text-sec-light font-medium">
              {isLeader ? "Líder" : "Miembro"}
            </Text>
          </View>
          <Text className="text-xs text-text-sec-light mt-1">
            {fechaUnion ? `Se unió el ${fechaUnion}` : null}
          </Text>
        </View>
        {isLeader && (
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
        {!isLeader && (
          <TouchableOpacity
            onPress={() => {
              setSelectedMember(item);
              setOptionsModal(true);
            }}
            className="ml-2 p-2"
          >
            <Feather name="more-vertical" size={22} color="#5e8d76" />
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
      await GroupService.updateMemberRole(groupId, selectedMember.id, "LEADER");
      setOptionsModal(false);
      fetchMembers();
      notify.success({ message: "Miembro ascendido a líder" });
    } catch {
      notify.error({ message: "No se pudo ascender al miembro" });
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
      />
    </View>
  );
};

export default GroupMembersScreen;
