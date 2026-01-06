import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
import { CustomLoader } from "@/components/shared/loader/Loader";
import { reverseGeocode } from "@/services/mapboxService";
import * as Linking from "expo-linking";
import { GroupMembersList, ThemedHeader } from "src/components";
import { useAuth } from "src/context/AuthContext";
import { GroupServicesScreen } from "src/screens/Groups";
import { GroupOrdersHistoryScreen } from "src/screens/Groups";
import { Service } from "@/services/ServicesApiService";
import { GroupServiceModal } from "@/components/modals/GroupServiceModal";

type GroupDetailParams = { groupId: string };
export const GroupDetailScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<GroupsStackParamList>>();
  const route = useRoute<RouteProp<{ params: GroupDetailParams }, "params">>();
  const groupId = (route.params as any)?.groupId;
  // Calcular altura para scroll en web/mobile
  const windowHeight = Dimensions.get("window").height;
  const listHeight = Math.max(420, windowHeight - 220);
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
  const [activeTab, setActiveTab] = useState<
    "info" | "servicios" | "historial"
  >("info");
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
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

  const handleLeaveGroup = () => {
    notify.confirm({
      message: "¿Estás seguro de que deseas salir de este grupo?",
      onConfirm: async () => {
        try {
          if (!user?.id) {
            throw new Error("Usuario no autenticado");
          }
          await GroupService.leaveGroup(groupId, user.id);
          notify.success({ message: "Has salido del grupo" });
          navigation.goBack();
        } catch (error: any) {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            "No se pudo salir del grupo";
          notify.error({ message });
        }
      },
      onCancel: () => {},
    });
  };

  // Menú profesional desplegable
  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  // Construir acciones dinámicamente según el rol del usuario
  const isMember = members.some((m) => m.user_id === user?.id);
  const isOwner = user && group?.user_id === user.id;

  const groupActions = isOwner
    ? [
        {
          label: "Gestión de miembros",
          onPress: () =>
            navigation.navigate("GroupMembersScreen", {
              groupId,
              groupName: group?.name || "",
            }),
        },
        { label: "Eliminar grupo", onPress: handleDelete, destructive: true },
      ]
    : isMember
    ? [
        {
          label: "Salir del grupo",
          onPress: handleLeaveGroup,
          destructive: true,
        },
      ]
    : [];

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
        <CustomLoader />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light">
      {/* Header */}
      <ThemedHeader
        canGoBack
        title="Detalle de Grupo"
        hideUserMenu={true}
        buttons={
          <>
            <TouchableOpacity className="p-2" onPress={openMenu}>
              <Feather name="more-vertical" size={24} color="#101815" />
            </TouchableOpacity>
            <ActionMenu
              visible={menuVisible}
              onClose={closeMenu}
              actions={groupActions}
            />
          </>
        }
      />
      {/* <View className="flex-row items-center justify-between px-4 pt-8 pb-3 bg-background-light border-b border-gray-100">
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
      </View> */}

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setActiveTab("info")}
          className={`flex-1 py-3 px-4 flex-row items-center justify-center gap-2 ${
            activeTab === "info"
              ? "border-b-2 border-green-500 bg-green-50"
              : ""
          }`}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={activeTab === "info" ? "#6BA43A" : "#666"}
          />
          <Text
            className={`font-semibold text-sm ${
              activeTab === "info" ? "text-green-600" : "text-gray-600"
            }`}
          >
            Información
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("servicios")}
          className={`flex-1 py-3 px-4 flex-row items-center justify-center gap-2 ${
            activeTab === "servicios"
              ? "border-b-2 border-orange-400 bg-orange-50"
              : ""
          }`}
        >
          <MaterialCommunityIcons
            name="shopping-outline"
            size={20}
            color={activeTab === "servicios" ? "#F88D2A" : "#666"}
          />
          <Text
            className={`font-semibold text-sm ${
              activeTab === "servicios" ? "text-orange-600" : "text-gray-600"
            }`}
          >
            Servicios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("historial")}
          className={`flex-1 py-3 px-4 flex-row items-center justify-center gap-2 ${
            activeTab === "historial"
              ? "border-b-2 border-blue-500 bg-blue-50"
              : ""
          }`}
        >
          <MaterialCommunityIcons
            name="history"
            size={20}
            color={activeTab === "historial" ? "#0066CC" : "#666"}
          />
          <Text
            className={`font-semibold text-sm ${
              activeTab === "historial" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            Historial
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      {activeTab === "info" ? (
        <ScrollView
          // En web forzamos height + overflow para asegurar scrolling dentro del contenedor
          style={
            Platform.OS === "web"
              ? ({ height: listHeight, overflow: "auto" } as any)
              : { flex: 1 }
          }
          contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
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
                  {privacyOptions.find((p) => p.id === group.privacy_id)
                    ?.name || "Privado"}
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
                  {group.group_type?.name || "Sin tipo"}
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
                    const lat = address?.latitude || group?.latitude;
                    const lon = address?.longitude || group?.longitude;
                    if (lat && lon) {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
                      Linking.openURL(url);
                    }
                  }}
                >
                  {address && address.addressLine1
                    ? `${address.addressLine1}${
                        address.city ? ", " + address.city : ""
                      }${
                        address.country ? ", " + address.country : ""
                      }`.replace(/^, |, ,/g, "")
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
                    <Text className="text-gray-700 font-semibold">
                      Cancelar
                    </Text>
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
          {/* Accesos Rápidos */}
          <View className="px-4 py-4 gap-2">
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("GroupServicesHistoryScreen" as any, {
                    groupId,
                    groupName: group?.name,
                  })
                }
                className="flex-1 bg-purple-50 rounded-xl p-3 border border-purple-200 flex-row items-center gap-3"
              >
                <MaterialCommunityIcons
                  name="history"
                  size={20}
                  color="#9333EA"
                />
                <View className="flex-1">
                  <Text className="font-semibold text-sm text-purple-900">
                    Servicios
                  </Text>
                  <Text className="text-xs text-purple-700">Historial</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("GroupFinancialPanelScreen" as any, {
                    groupId,
                    groupName: group?.name,
                  })
                }
                className="flex-1 bg-blue-50 rounded-xl p-3 border border-blue-200 flex-row items-center gap-3"
              >
                <MaterialCommunityIcons
                  name="chart-line"
                  size={20}
                  color="#0066CC"
                />
                <View className="flex-1">
                  <Text className="font-semibold text-sm text-blue-900">
                    Finanzas
                  </Text>
                  <Text className="text-xs text-blue-700">Panel</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de miembros */}
          <View className="px-4 py-4">
            <Text className="font-bold text-base mb-2">Miembros del grupo</Text>
            <GroupMembersList members={members} currentUserId={user?.id} />
          </View>
        </ScrollView>
      ) : activeTab === "servicios" ? (
        <View
          style={Platform.OS === "web" ? { height: listHeight } : { flex: 1 }}
        >
          <GroupServicesScreen
            groupId={groupId}
            isGroupLeader={user?.id === group?.user_id}
            onServiceSelect={(service: Service) => {
              setSelectedService(service);
              setServiceModalVisible(true);
            }}
          />
        </View>
      ) : (
        <View
          style={Platform.OS === "web" ? { height: listHeight } : { flex: 1 }}
        >
          <GroupOrdersHistoryScreen />
        </View>
      )}

      {/* Service Selection Modal */}
      <GroupServiceModal
        visible={serviceModalVisible}
        service={selectedService}
        groupId={groupId}
        groupName={group?.name || ""}
        memberCount={members.length}
        isGroupLeader={user?.id === group?.user_id}
        paymentTypeId={group?.payment_type_id || ""}
        onClose={() => {
          setServiceModalVisible(false);
          setSelectedService(null);
        }}
        onServiceCreated={() => {
          // Refrescar miembros o hacer otra acción necesaria
          fetchGroup();
        }}
      />
    </View>
  );
};

export default GroupDetailScreen;
