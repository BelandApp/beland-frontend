import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Service } from "@/services/ServicesApiService";
import { ServicesApiService } from "@/services/ServicesApiService";
import { useNotify } from "@/hooks";

interface GroupServiceModalProps {
  visible: boolean;
  service: Service | null;
  groupId: string;
  groupName: string;
  memberCount: number;
  isGroupLeader: boolean;
  paymentTypeId: string;
  onClose: () => void;
  onServiceCreated?: () => void;
}

export const GroupServiceModal: React.FC<GroupServiceModalProps> = ({
  visible,
  service,
  groupId,
  groupName,
  memberCount,
  isGroupLeader,
  paymentTypeId,
  onClose,
  onServiceCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const notifyContext = useNotify();

  // Calcular costo por miembro
  const costPerMember = service ? Math.ceil(service.cost / memberCount) : 0;
  const totalCost = service?.cost || 0;

  // Crear servicio para grupo
  const handleCreateService = useCallback(async () => {
    if (!service || !isGroupLeader || !paymentTypeId) return;

    try {
      setLoading(true);
      await ServicesApiService.createGroupService(
        groupId,
        service.id,
        paymentTypeId
      );

      notifyContext.success({
        message: `${service.name} contratado exitosamente`,
      });

      onServiceCreated?.();
      onClose();
    } catch (error) {
      console.error("Error creating group service:", error);
      notifyContext.error({
        message: "Error al contratar el servicio",
      });
    } finally {
      setLoading(false);
    }
  }, [
    service,
    groupId,
    paymentTypeId,
    isGroupLeader,
    notifyContext,
    onServiceCreated,
    onClose,
  ]);

  if (!service) return null;

  const priceLabel = service.price_becoin ? "Becoins" : "BsF";
  const price = service.price_becoin || service.price;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/30">
        <View className="flex-1 bg-white rounded-t-3xl mt-auto overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900">
              Contratar Servicio
            </Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Service Image */}
            <View className="h-48 bg-gray-100 overflow-hidden">
              {service.image_url ? (
                <Image
                  source={{ uri: service.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-gradient-to-br from-green-100 to-orange-100 flex items-center justify-center">
                  <MaterialCommunityIcons
                    name="shopping-outline"
                    size={80}
                    color="#F88D2A"
                  />
                </View>
              )}
            </View>

            {/* Service Details */}
            <View className="px-4 py-4 gap-3">
              {/* Name and Description */}
              <View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  {service.name}
                </Text>
                <Text className="text-gray-600 text-base leading-5">
                  {service.description}
                </Text>
              </View>

              {/* Price Section */}
              <View className="bg-gradient-to-r from-green-50 to-orange-50 rounded-xl p-4 flex-row items-center justify-between border border-green-200">
                <View>
                  <Text className="text-xs text-gray-600 font-semibold mb-1">
                    PRECIO DEL SERVICIO
                  </Text>
                  <Text className="text-3xl font-bold text-gray-900">
                    {typeof price === "number" ? price.toFixed(2) : price}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {priceLabel}
                  </Text>
                </View>

                <View className="items-end">
                  <MaterialCommunityIcons
                    name="currency-usd"
                    size={40}
                    color="#6BA43A"
                  />
                </View>
              </View>

              {/* Group Info */}
              <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <View className="flex-row items-center gap-2 mb-3">
                  <MaterialCommunityIcons
                    name="account-multiple"
                    size={20}
                    color="#0066CC"
                  />
                  <Text className="text-base font-semibold text-blue-900">
                    Grupo: {groupName}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <MaterialCommunityIcons
                    name="group"
                    size={16}
                    color="#0066CC"
                  />
                  <Text className="text-sm text-blue-800">
                    {memberCount} miembro{memberCount !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>

              {/* Payment type is already determined by the group */}

              {/* Action Buttons */}
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={onClose}
                  disabled={loading}
                  className="flex-1 bg-gray-100 rounded-lg py-3 items-center justify-center"
                >
                  <Text className="text-gray-700 font-semibold">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateService}
                  disabled={loading || !isGroupLeader}
                  className={`flex-1 rounded-lg py-3 items-center justify-center flex-row gap-2 ${
                    isGroupLeader
                      ? "bg-green-500 active:bg-green-600"
                      : "bg-gray-300"
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color="white"
                      />
                      <Text className="text-white font-bold text-base">
                        Contratar
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {!isGroupLeader && (
                <View className="bg-yellow-50 rounded-lg p-3 flex-row items-center gap-2 border border-yellow-200">
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={20}
                    color="#D97706"
                  />
                  <Text className="text-sm text-yellow-800 flex-1">
                    Solo el líder del grupo puede contratar servicios
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default GroupServiceModal;
