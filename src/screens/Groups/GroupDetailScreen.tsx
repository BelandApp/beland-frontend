import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { GroupService, Group } from "@/services/GroupApiService";
import * as Clipboard from "expo-clipboard";
import { useNotify } from "src/hooks";

type GroupDetailParams = { groupId: string };
export const GroupDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: GroupDetailParams }, "params">>();
  const groupId = (route.params as any)?.groupId;
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const notify = useNotify();

  const fetchGroup = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GroupService.getGroup(groupId);
      setGroup(data);
    } catch (e) {
      notify.error({ message: "No se pudo cargar el grupo" });
    } finally {
      setLoading(false);
    }
  }, [groupId, notify]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

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

  const handleDelete = () => {
    notify.confirm({
      message: "¿Estás seguro de que deseas eliminar este grupo?",
      onConfirm: async () => {
        // Aquí iría la lógica de eliminación
        notify.success({ message: "Grupo eliminado" });
        navigation.goBack();
      },
      onCancel: () => {},
    });
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
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Feather name="arrow-left" size={24} color="#101815" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold">
          Detalle de Grupo
        </Text>
        <TouchableOpacity className="p-2">
          <Feather name="more-vertical" size={24} color="#101815" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Imagen y estado */}
        <View className="items-center pt-6 pb-2">
          <View className="relative">
            <Image
              source={{
                uri:
                  group.image_url ||
                  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&q=80",
              }}
              className="w-32 h-32 rounded-full bg-gray-200"
              style={{ borderWidth: 4, borderColor: "#fff" }}
            />
            <View className="absolute bottom-1 right-1 bg-primary border-2 border-white w-6 h-6 rounded-full items-center justify-center">
              <Feather name="check" size={14} color="#000" />
            </View>
          </View>
          <Text className="text-2xl font-bold mt-4 text-center">
            {group.name}
          </Text>
          <View className="mt-2">
            <Text className="px-3 py-1 rounded-full bg-primary/20 text-green-800 text-xs font-semibold uppercase">
              {group.status === "ACTIVE" ? "Activo" : group.status}
            </Text>
          </View>
        </View>
        {/* Descripción */}
        {group.description ? (
          <View className="px-6 py-4">
            <Text className="text-center text-text-sec-light text-base leading-relaxed">
              {group.description}
            </Text>
          </View>
        ) : null}
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
                {group.privacy || "Privado"}
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
                {group.group_type?.name || "-"}
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
              >
                {group.location_label || group.location || "-"}
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
        {/* Acciones */}
        <View className="px-4 pt-2 pb-6 flex flex-col gap-3">
          <TouchableOpacity
            className="w-full flex-row items-center justify-center gap-2 h-12 bg-white border border-gray-200 text-text-main-light font-semibold rounded-xl mb-2"
            onPress={() =>
              notify.info({ message: "Funcionalidad próximamente..." })
            }
          >
            <Feather name="user-plus" size={20} color="#101815" />
            <Text>Invitar Miembros</Text>
          </TouchableOpacity>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 h-12 bg-white border border-gray-200 text-text-main-light font-semibold rounded-xl"
              onPress={() =>
                notify.info({ message: "Funcionalidad próximamente..." })
              }
            >
              <Feather name="edit" size={20} color="#101815" />
              <Text>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 h-12 bg-red-50 border border-red-100 text-red-600 font-semibold rounded-xl"
              onPress={handleDelete}
            >
              <Feather name="trash-2" size={20} color="#e53935" />
              <Text>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default GroupDetailScreen;
