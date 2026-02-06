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
  Image,
  ImageBackground,
  ActivityIndicator,
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
import { useCustomNavigation, useNotify } from "src/hooks";
import { CustomLoader } from "@/components/shared/loader/Loader";
import { reverseGeocode } from "@/services/mapboxService";
import * as Linking from "expo-linking";
import { Button, GroupMembersList } from "src/components";
import { useAuth } from "src/context/AuthContext";
import { GroupServicesScreen } from "./GroupServicesScreen";
import { GroupPurchaseScreen } from "./GroupPurchaseScreen";
import { GroupOrdersHistoryScreen } from "./GroupOrdersHistoryScreen";
import { Service } from "@/services/ServicesApiService";
import { GroupServiceModal } from "@/components/modals/GroupServiceModal";
import { ShareGroupModal } from "@/components/shared/ShareGroupModal";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeftIcon, CircleArrowLeftIcon } from "lucide-react-native";
import { colors } from "src/design-system";
import { position } from "html2canvas/dist/types/css/property-descriptors/position";
import { CloudinaryService } from "src/services/cloudinary/cloudinary.service";

type GroupDetailParams = { groupId: string };

export const GroupDetailScreen = () => {
  const { user } = useAuth();
  const { navigate, goBack, reload } = useCustomNavigation();
  const route = useRoute<RouteProp<{ params: GroupDetailParams }, "params">>();
  const groupId = (route.params as any)?.groupId;

  // Dimensions
  const windowHeight = Dimensions.get("window").height;
  const listHeight = Math.max(420, windowHeight - 350); // Ajustado para el nuevo header

  // State
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [address, setAddress] = useState<UserAddress | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [privacyOptions, setPrivacyOptions] = useState<GroupPrivacy[]>([]);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "servicios" | "compra">(
    "info",
  );
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const notify = useNotify();

  // Load Component Data
  useEffect(() => {
    GroupService.getGroupPrivacies()
      .then(setPrivacyOptions)
      .catch(() => setPrivacyOptions([]));
  }, []);

  const fetchGroup = async () => {
    try {
      const data = await GroupService.getGroup(groupId);
      console.log("Fetched group data:", data);
      setGroup(data);
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

  // Address Logic
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
        },
      );
    } else {
      setAddress(null);
      setLocationName("");
    }
  }, [group?.user_address_id, group?.latitude, group?.longitude]);

  // Actions
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
  const handleJoinGroup = async () => {
    if (!user?.id) {
      notify.confirm({
        message: "Debes iniciar sesión para unirte al grupo",
        onConfirm: () => navigate("Login"),
      });
      return;
    }
    await GroupService.joinGroup(groupId, user.id);
    notify.success({ message: "¡Te has unido al grupo exitosamente!" });
    reload({ name: "GroupDetailScreen", params: { groupId } });
  };
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        const asset = result.assets[0];
        const formData = new FormData();
        if (Platform.OS === "web") {
          const response = await fetch(asset.uri);
          const blob = await response.blob();

          formData.append("image_url", blob, `group_${groupId}_cover.jpg`);
        } else {
          formData.append("image_url", {
            uri: asset.uri,
            name: `group_${groupId}_cover.jpg`,
            type: "image/jpeg",
          } as any);
        }
        await GroupService.uploadGroupImage(groupId, formData);

        setGroup((prev) =>
          prev ? { ...prev, image_url: result.assets[0].uri } : null,
        );
        notify.success({ message: "Imagen de portada actualizada" });
      }
    } catch (error) {
      console.error(error);
      notify.error({ message: "Error al subir la imagen" });
    } finally {
      setUploadingImage(false);
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
  const saveEditName = async () => {
    try {
      await GroupService.updateGroup(groupId, {
        name: editName,
        description: group?.description || "",
      });
      notify.success({ message: "Nombre actualizado" });
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
          goBack();
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
          if (!user?.id) throw new Error("Usuario no autenticado");
          await GroupService.leaveGroup(groupId, user.id);
          notify.success({ message: "Has salido del grupo" });
          goBack();
        } catch (error: any) {
          const message =
            error?.response?.data?.message || "No se pudo salir del grupo";
          notify.error({ message });
        }
      },
      onCancel: () => {},
    });
  };

  const submitInvite = async () => {
    try {
      await GroupService.inviteToGroup(groupId, { email: inviteEmail });
      notify.success({ message: "Invitación enviada" });
      setInviteModal(false);
      setInviteEmail("");
    } catch {
      notify.error({ message: "No se pudo invitar" });
    }
  };

  const isMember = members.some((m) => m.user_id === user?.id);
  const isOwner = !!(user && group?.user_id === user.id);

  const groupActions = [
    ...(isOwner
      ? [
          {
            label: "Gestión de miembros",
            onPress: () =>
              navigate("Groups", {
                screen: "GroupMembersScreen",
                params: {
                  groupId,
                  groupName: group?.name ?? "",
                },
              }),
          },
          {
            label: "Cambiar Portada",
            onPress: handlePickImage,
            icon: "image",
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
        : [
            {
              label: "Unirme al grupo",
              onPress: handleJoinGroup,
            },
          ]),
  ];

  if (loading || !group) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light">
        <CustomLoader />
      </View>
    );
  }

  // Helper to get privacy name
  const currentPrivacy = privacyOptions.find((p) => p.id === group.privacy_id);

  return (
    <View className="flex-1 bg-background-light">
      {/* --- CONDITIONAL HEADER --- */}
      {activeTab === "info" ? (
        /* HERO HEADER (Info Tab Only) */
        <View className="h-64 w-full relative">
          <ImageBackground
            source={
              group.image_url
                ? { uri: group.image_url }
                : { uri: "https://via.placeholder.com/600x400?text=Grupo" }
            }
            className="w-full h-full"
            resizeMode="cover"
          >
            {/* Gradient Overlay */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: "60%",
              }}
            />

            {/* Fallback pattern */}
            {!group.image_url && !uploadingImage && (
              <View className="absolute inset-0 items-center justify-center bg-gray-200 opacity-20">
                <Feather name="users" size={60} color="#000" />
              </View>
            )}

            {/* Loading Indicator */}
            {uploadingImage && (
              <View className="absolute inset-0 items-center justify-center bg-black/50">
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}

            {/* Navigation Bar (Transparent) */}
            <View className="absolute top-0 left-0 right-0 flex-row justify-between items-center p-4 pt-10 z-10">
              <Button
                variant="onlyIcon"
                icon={<ArrowLeftIcon size={24} color="orange" />}
                onPress={goBack}
                title="back"
              />

              <View className="flex-row gap-2">
                <Button
                  variant="onlyIcon"
                  icon={<Feather name="share-2" size={20} color="orange" />}
                  onPress={() => setShowShareModal(true)}
                  title="Share Group"
                  style={{
                    paddingHorizontal: 8,
                  }}
                />
                <Button
                  variant="onlyIcon"
                  icon={
                    <Feather name="more-vertical" size={20} color="orange" />
                  }
                  onPress={() => setMenuVisible(true)}
                  title="Share Group"
                  style={{
                    paddingHorizontal: 8,
                  }}
                />
              </View>
            </View>

            <ActionMenu
              visible={menuVisible}
              onClose={() => setMenuVisible(false)}
              actions={groupActions}
            />

            {/* Group Info On Overlay */}
            <View className="absolute bottom-4 left-4 right-4">
              <View className="flex-row items-center mb-1 gap-2">
                <View className="bg-primary/90 px-2 py-0.5 rounded text-xs">
                  <Text className="text-white text-[10px] uppercase font-bold tracking-wider">
                    {typeof group.group_type === "string"
                      ? group.group_type
                      : group.group_type?.name || "Grupo"}
                  </Text>
                </View>
                {group.is_active && (
                  <View className="bg-green-500/90 px-2 py-0.5 rounded text-xs flex-row items-center gap-1">
                    <View className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <Text className="text-white text-[10px] uppercase font-bold">
                      Activo
                    </Text>
                  </View>
                )}
              </View>

              {editingName ? (
                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    className="bg-white/90 p-2 rounded-lg flex-1 text-lg font-bold"
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={saveEditName}
                    className="bg-primary p-2 rounded-lg"
                  >
                    <Feather name="check" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onLongPress={isOwner ? handleEditName : undefined}
                  activeOpacity={isOwner ? 0.8 : 1}
                >
                  <Text className="text-white text-3xl font-bold no-underline">
                    {group.name}
                  </Text>
                </TouchableOpacity>
              )}

              <View className="flex-row items-center mt-1">
                <Feather
                  name={currentPrivacy?.code === "public" ? "globe" : "lock"}
                  size={12}
                  color="#ddd"
                />
                <Text className="text-gray-200 text-xs ml-1 font-medium capitalize">
                  {currentPrivacy?.name || "Privado"} • {members.length}{" "}
                  miembros
                </Text>
              </View>
            </View>

            {/* Edit Cover Button (Owner only) */}
            {isOwner && (
              <Button
                title="Editar imagen"
                onPress={handlePickImage}
                icon={<Feather name="camera" size={20} color="orange" />}
                variant="onlyIcon"
                className="absolute bottom-4 right-4 backdrop-blur-md py-4"
              />
            )}
          </ImageBackground>
        </View>
      ) : (
        /* SIMPLE HEADER (Other Tabs) */
        <View className="bg-white pt-10 pb-2 px-4 flex-row items-center justify-between border-b border-gray-100 shadow-sm z-50">
          <TouchableOpacity
            onPress={goBack}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>

          <Text
            className="text-lg font-bold text-gray-800 flex-1 ml-4"
            numberOfLines={1}
          >
            {group.name}
          </Text>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setShowShareModal(true)}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Feather name="share-2" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Feather name="more-vertical" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <ActionMenu
            visible={menuVisible}
            onClose={() => setMenuVisible(false)}
            actions={groupActions}
          />
        </View>
      )}

      {/* --- TABS --- */}
      <View className="flex-row bg-white border-b border-gray-100 shadow-sm z-10">
        <TouchableOpacity
          onPress={() => setActiveTab("info")}
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === "info" ? "border-primary" : "border-transparent"}`}
        >
          <Text
            className={`font-bold text-sm ${activeTab === "info" ? "text-primary" : "text-gray-500"}`}
          >
            Información
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("servicios")}
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === "servicios" ? "border-primary" : "border-transparent"}`}
        >
          <Text
            className={`font-bold text-sm ${activeTab === "servicios" ? "text-primary" : "text-gray-500"}`}
          >
            Servicios
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("compra")}
          className={`flex-1 py-3 items-center border-b-2 ${activeTab === "compra" ? "border-primary" : "border-transparent"}`}
        >
          <Text
            className={`font-bold text-sm ${activeTab === "compra" ? "text-primary" : "text-gray-500"}`}
          >
            Compras
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- CONTENT --- */}
      {activeTab === "info" ? (
        <ScrollView
          style={
            Platform.OS === "web"
              ? ({ height: listHeight, overflow: "auto" } as any)
              : { flex: 1 }
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Info Card */}
          <View className="p-4 bg-white border-b border-gray-100 mb-2">
            <Text className="text-gray-400 text-xs uppercase font-bold mb-2">
              Descripción
            </Text>
            {editingDescription ? (
              <View>
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  multiline
                  className="bg-gray-50 p-3 rounded-xl text-gray-700 leading-relaxed border border-primary"
                />
                <View className="flex-row gap-2 mt-2 justify-end">
                  <TouchableOpacity
                    onPress={() => setEditingDescription(false)}
                    className="p-2 is"
                  >
                    <Text className="text-gray-500 font-bold">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={saveEditDescription}
                    className="bg-primary px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-bold">Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onLongPress={isOwner ? handleEditDescription : undefined}
              >
                <Text className="text-gray-700 leading-relaxed text-sm">
                  {group.description || "Sin descripción"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Details Grid */}
          <View className="p-4 grid gap-4">
            {/* Location */}
            <TouchableOpacity
              onPress={() => {
                const lat = address?.latitude || group?.latitude;
                const lon = address?.longitude || group?.longitude;
                if (lat && lon)
                  Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
                  );
              }}
              className="flex-row items-center bg-white p-3 rounded-2xl border border-gray-100"
            >
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                <Feather name="map-pin" size={18} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-400 font-bold uppercase">
                  Ubicación
                </Text>
                <Text
                  className="text-sm font-semibold text-gray-800"
                  numberOfLines={1}
                >
                  {address?.addressLine1 ||
                    locationName ||
                    "Ubicación del mapa"}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#cbd5e1" />
            </TouchableOpacity>

            {/* Event Date */}
            {group.event_at && (
              <View className="flex-row items-center bg-white p-3 rounded-2xl border border-gray-100">
                <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
                  <Feather name="calendar" size={18} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-400 font-bold uppercase">
                    Fecha del Evento
                  </Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    {new Date(group.event_at).toLocaleDateString("es-AR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                    {" • "}
                    {new Date(group.event_at).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Members Section */}
          <View className="px-4 py-2">
            <View className="flex-row justify-between items-end mb-3">
              <Text className="text-base font-bold text-gray-800">
                Miembros
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigate("Groups", {
                    screen: "GroupMembersScreen",
                    params: {
                      groupId,
                      groupName: group?.name ?? "",
                    },
                  })
                }
              >
                <Text className="text-primary font-bold text-sm">
                  Ver todos
                </Text>
              </TouchableOpacity>
            </View>
            {/* Preview list or Horizontal Scroll */}
            <GroupMembersList
              members={members.slice(0, 5)}
              currentUserId={user?.id}
            />
            {members.length > 5 && (
              <TouchableOpacity
                onPress={() =>
                  navigate("Groups", {
                    screen: "GroupMembersScreen",
                    params: {
                      groupId,
                      groupName: group?.name ?? "",
                    },
                  })
                }
                className="mt-2 items-center"
              >
                <Text className="text-gray-400 text-xs">
                  +{members.length - 5} miembros más...
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Invitation Box */}
          {group.message_invitation && isMember && (
            <View className="px-4 py-4">
              <LinearGradient
                colors={["#f0fdf4", "#dcfce7"]}
                className="p-4 rounded-2xl border border-primary/20 relative overflow-hidden"
              >
                <Feather
                  name="mail"
                  size={100}
                  color="#00E074"
                  style={{
                    position: "absolute",
                    right: -20,
                    bottom: -20,
                    opacity: 0.1,
                  }}
                />
                <Text className="text-primary font-bold text-xs uppercase mb-1">
                  Mensaje de Invitación
                </Text>
                <Text className="text-gray-800 font-medium italic mb-3">
                  "{group.message_invitation}"
                </Text>
                <TouchableOpacity
                  onPress={handleCopy}
                  className="bg-white self-start px-3 py-1.5 rounded-lg shadow-sm flex-row items-center border border-gray-100"
                >
                  <Feather name="copy" size={14} color="#000" />
                  <Text className="font-bold text-xs ml-2">Copiar texto</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </ScrollView>
      ) : activeTab === "servicios" ? (
        <View style={{ flex: 1 }}>
          <GroupServicesScreen groupId={groupId} isGroupLeader={isOwner} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <GroupPurchaseScreen groupId={groupId} />
        </View>
      )}

      {/* --- FOOTER ACTION BAR (Floating) --- */}
      {/* Only show if not in Tabs that have their own sub-navigation or actions, or keeps it consistent */}
      {activeTab === "info" && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 shadow-lg flex-row gap-3">
          {isMember ? (
            <TouchableOpacity
              onPress={() => setInviteModal(true)}
              className="flex-1 bg-primary h-12 rounded-xl flex-row items-center justify-center shadow-md shadow-primary/30"
            >
              <Feather name="user-plus" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Invitar Amigos
              </Text>
            </TouchableOpacity>
          ) : (
            <Button
              title="Unirme al grupo"
              variant="secondary"
              onPress={handleJoinGroup}
              style={{ flex: 1 }}
            />
          )}

          {isOwner && (
            <TouchableOpacity
              onPress={() => setActiveTab("servicios")}
              className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center border border-gray-200"
            >
              <Feather name="shopping-bag" size={20} color="#374151" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* --- MODALS --- */}
      {/* Invitación */}
      <Modal visible={inviteModal} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center p-4">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-4 self-center">
              <Feather name="mail" size={24} color="#00E074" />
            </View>
            <Text className="text-xl font-bold text-center text-gray-800 mb-2">
              Invitar al Grupo
            </Text>
            <Text className="text-center text-gray-500 text-sm mb-6">
              Ingresa el correo electrónico de la persona que deseas invitar.
            </Text>

            <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6">
              <TextInput
                placeholder="ejemplo@email.com"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
                className="text-base text-gray-800"
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setInviteModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 items-center"
              >
                <Text className="font-bold text-gray-600">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitInvite}
                className="flex-1 py-3 rounded-xl bg-primary items-center shadow-lg shadow-primary/20"
              >
                <Text className="font-bold text-white">Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Service Selection */}
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
        onServiceCreated={() => fetchGroup()}
      />

      {/* Share Group Modal */}
      <ShareGroupModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        groupData={{
          groupName: group?.name || "",
          groupId: group?.id || groupId,
          description: group?.description,
          memberCount: members.length,
          creatorName:
            members.find((m) => m.role === "LEADER")?.user?.full_name ||
            "Creador",
        }}
      />
    </View>
  );
};

export default GroupDetailScreen;
