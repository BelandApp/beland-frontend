import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { ActionMenu } from "src/screens/Groups/components/ActionMenu";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { GroupsStackParamList } from "@/types/navigation";
import { GroupService, Group, GroupMember } from "@/services/GroupApiService";
import { GroupPrivacy } from "@/services/GroupApiService";
import { addressService, UserAddress } from "@/services/addressService";
import * as Clipboard from "expo-clipboard";
import { useNotify } from "src/hooks";
import { reverseGeocode } from "@/services/mapboxService";
import * as Linking from "expo-linking";
import { GroupMembersList } from "src/components";
import { useAuth } from "src/context/AuthContext";

type GroupDetailParams = { groupId: string };
export const GroupDetailScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<GroupsStackParamList>>();
  const route = useRoute<RouteProp<{ params: GroupDetailParams }, "params">>();
  const groupId = (route.params as any)?.groupId;
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [address, setAddress] = useState<UserAddress | null>(null);
  // Edición por campo
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  // Tipos de privacidad
  const [privacyOptions, setPrivacyOptions] = useState<GroupPrivacy[]>([]);
  useEffect(() => {
    GroupService.getGroupPrivacies()
      .then(setPrivacyOptions)
      .catch(() => setPrivacyOptions([]));
  }, []);

  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  // Ubicación legible por Mapbox
  const [locationName, setLocationName] = useState<string>("");

  const notify = useNotify();

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const data = await GroupService.getGroup(groupId);
      setGroup(data);
      // Obtener miembros del grupo
      const membersData = await GroupService.getGroupMembers(groupId);
      setMembers(membersData);
    } catch (e) {
      notify.error({ message: "No se pudo cargar el grupo" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    if (group?.user_address_id) {
      addressService
        .getAddressById(group.user_address_id)
        .then(setAddress)
        .catch(() => setAddress(null));
      setLocationName("");
    } else if (group?.latitude && group?.longitude) {
      setAddress(null);
      reverseGeocode(Number(group.latitude), Number(group.longitude)).then(
        (place) => {
          setLocationName(place?.full_address || "");
        }
      );
    } else {
      setAddress(null);
      setLocationName("");
    }
  }, [group?.user_address_id, group?.latitude, group?.longitude]);

  const handleCopy = async () => {
    if (group?.message_invitation) {
      try {
        await Clipboard.setStringAsync(group.message_invitation);
        notify.success({ message: "Mensaje copiado al portapapeles" });
      } catch {
        notify.error({ message: "No se pudo copiar el mensaje" });
      }
    }
  };

  const handleEditName = () => {
    setEditName(group?.name || "");
    setEditingName(true);
  };
  const handleEditDescription = () => {
    setEditDescription(group?.description || "");
    setEditingDescription(true);
  };
  const cancelEditName = () => {
    setEditName(group?.name || "");
    setEditingName(false);
  };
  const cancelEditDescription = () => {
    setEditDescription(group?.description || "");
    setEditingDescription(false);
  };
  const saveEditName = async () => {
    try {
      await GroupService.updateGroup(groupId, {
        name: editName,
        description: group?.description || "",
      });
      notify.success({ message: "Nombre actualizado" });
      setLocationName("");
      setEditingName(false);
      fetchGroup();
    } catch {
      notify.error({ message: "No se pudo actualizar el nombre" });
    }
  };
  const saveEditDescription = async () => {
    try {
      await GroupService.updateGroup(groupId, {
        name: group?.name || "",
        description: editDescription,
      });
      notify.success({ message: "Descripción actualizada" });
      setEditingDescription(false);
      fetchGroup();
    } catch {
      notify.error({ message: "No se pudo actualizar la descripción" });
    }
  };

  const handleDelete = () => {
    notify.confirm({
      message: "¿Estás seguro de que deseas eliminar este grupo?",
      onConfirm: async () => {
        try {
          await GroupService.deleteGroup(groupId);
          notify.success({ message: "Grupo eliminado" });
          navigation.goBack();
        } catch {
          notify.error({ message: "No se pudo eliminar el grupo" });
        }
      },
      onCancel: () => {},
    });
  };

  // Menú profesional desplegable
  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const groupActions = [
    {
      label: "Gestión de miembros",
      onPress: () =>
        navigation.navigate("GroupMembersScreen", {
          groupId,
          groupName: group?.name || "",
        }),
    },

    { label: "Eliminar grupo", onPress: handleDelete, destructive: true },
  ];

  // Eliminar submitEdit, ahora es saveEdit

  const submitInvite = async () => {
    try {
      await GroupService.inviteToGroup(groupId, { email: inviteEmail });
      notify.success({ message: "Invitación enviada" });
      setInviteModal(false);
    } catch {
      notify.error({ message: "No se pudo invitar" });
    }
  };

  if (loading || !group) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light">
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-8 pb-3 bg-background-light border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          className="mr-4 p-2 border-2 border-green-500 rounded-full"
        >
          <Feather name="arrow-left" size={24} color="#00E074" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold">
          Detalle de Grupo
        </Text>
        <TouchableOpacity className="p-2" onPress={openMenu}>
          <Feather name="more-vertical" size={24} color="#101815" />
        </TouchableOpacity>
        <ActionMenu
          visible={menuVisible}
          onClose={closeMenu}
          actions={groupActions}
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Avatar y estado */}
        <View className="items-center pt-6 pb-2">
          <View
            className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center"
            style={{ borderWidth: 4, borderColor: "#fff" }}
          >
            <Feather name="users" size={64} color="#5e8d76" />
          </View>
          <View className="flex-row items-center justify-center mt-4">
            {editingName ? (
              <View className="w-full items-center">
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                  className="text-2xl font-bold text-center min-w-[120px] border-b border-primary px-2 py-1"
                />
                <View className="flex-row justify-center gap-3 mt-3">
                  <TouchableOpacity
                    onPress={saveEditName}
                    className="bg-primary rounded-lg px-5 py-2"
                  >
                    <Text className="text-white font-semibold">Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={cancelEditName}
                    className="bg-gray-100 rounded-lg px-5 py-2"
                  >
                    <Text className="text-gray-700 font-semibold">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center justify-center w-full">
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={handleEditName}
                  className="flex-1"
                >
                  <Text className="text-2xl font-bold text-center select-none">
                    {group.name}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View className="mt-2">
            <Text className="px-3 py-1 rounded-full bg-primary/20 text-green-800 text-xs font-semibold uppercase">
              {group.is_active === true ? "Activo" : group.is_active}
            </Text>
          </View>
        </View>
        {/* Descripción */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-center">
            {editingDescription ? (
              <View className="w-full items-center">
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  autoFocus
                  className="text-base text-center min-w-[600px] border-b border-primary px-2 py-1"
                  multiline
                />
                <View className="flex-row justify-center gap-3 mt-3">
                  <TouchableOpacity
                    onPress={saveEditDescription}
                    className="bg-primary rounded-lg px-5 py-2"
                  >
                    <Text className="text-white font-semibold">Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={cancelEditDescription}
                    className="bg-gray-100 rounded-lg px-5 py-2"
                  >
                    <Text className="text-gray-700 font-semibold">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center justify-center w-full">
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={handleEditDescription}
                  className="flex-1"
                >
                  <Text className="text-center text-text-sec-light text-base leading-relaxed select-none">
                    {group.description}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        {/* Detalles */}
        <View className="px-4 py-2">
          <View className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            {/* Privacidad */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Feather name="lock" size={18} color="#5e8d76" />
                </View>
                <Text className="text-sm font-medium text-text-sec-light">
                  Privacidad
                </Text>
              </View>
              <Text className="text-sm font-semibold text-text-main-light">
                {privacyOptions.find((p) => p.id === group.privacy_id)?.name ||
                  "Privado"}
              </Text>
            </View>
            {/* Tipo */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Feather name="tag" size={18} color="#5e8d76" />
                </View>
                <Text className="text-sm font-medium text-text-sec-light">
                  Tipo
                </Text>
              </View>
              <Text className="text-sm font-semibold text-text-main-light">
                {group.group_type.name || "-"}
              </Text>
            </View>
            {/* Ubicación */}
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Feather name="map-pin" size={18} color="#5e8d76" />
                </View>
                <Text className="text-sm font-medium text-text-sec-light">
                  Ubicación
                </Text>
              </View>
              <Text
                className="text-sm font-semibold text-text-main-light text-right max-w-[50%]"
                numberOfLines={1}
                ellipsizeMode="tail"
                onPress={() => {
                  if (group?.latitude && group?.longitude) {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${group.latitude},${group.longitude}`;
                    Linking.openURL(url);
                  }
                }}
                style={{
                  textDecorationLine:
                    !address && locationName ? "underline" : "none",
                }}
              >
                {address && address.addressLine1
                  ? `${address.addressLine1}${
                      address.city ? ", " + address.city : ""
                    }${address.country ? ", " + address.country : ""}`.replace(
                      /^, |, ,/g,
                      ""
                    )
                  : locationName
                  ? locationName
                  : "-"}
              </Text>
            </View>
          </View>
        </View>
        {/* Mensaje de invitación */}
        {group.message_invitation ? (
          <View className="px-4 py-4">
            <View className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-4">
              <View className="flex-row items-center gap-2">
                <Feather name="mail" size={18} color="#00E074" />
                <Text className="text-primary font-bold text-sm uppercase">
                  Mensaje de Invitación
                </Text>
              </View>
              <Text className="text-base font-medium italic text-text-main-light">
                "{group.message_invitation}"
              </Text>
              <TouchableOpacity
                onPress={handleCopy}
                className="self-start flex-row items-center gap-2 px-4 py-2 bg-primary text-black text-sm font-bold rounded-lg mt-2"
              >
                <Feather name="copy" size={18} color="#000" />
                <Text>Copiar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        {/* Acciones eliminadas del cuerpo, ahora solo en menú */}

        {/* Edición inline, sin modal */}

        {/* Modal Invitar Miembro profesional */}
        <Modal visible={inviteModal} transparent animationType="fade">
          <View className="flex-1 bg-black/20 justify-center items-center">
            <View className="bg-white rounded-2xl px-8 py-7 w-80 shadow-xl items-center border border-gray-100">
              <Text className="text-2xl font-bold mb-4 text-center text-text-main-light">
                Invitar Miembro
              </Text>
              <TextInput
                className="border border-gray-200 rounded-lg px-4 py-2 text-base w-64 mb-4 bg-gray-50 focus:border-primary outline-none"
                placeholder="Correo electrónico"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
              <View className="flex-row justify-end w-full gap-3">
                <TouchableOpacity
                  onPress={() => setInviteModal(false)}
                  className="bg-gray-100 rounded-lg px-5 py-2"
                >
                  <Text className="text-gray-700 font-semibold">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submitInvite}
                  className="bg-primary rounded-lg px-5 py-2"
                >
                  <Text className="text-white font-semibold">Invitar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* Lista de miembros */}
        <View className="px-4 py-4">
          <Text className="font-bold text-base mb-2">Miembros del grupo</Text>
          <GroupMembersList members={members} currentUserId={user?.id} />
        </View>
      </ScrollView>
    </View>
  );
};

export default GroupDetailScreen;
