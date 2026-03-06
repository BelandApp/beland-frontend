import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import {
  ServicesApiService,
  Service,
  GroupService,
} from "@/services/ServicesApiService";
import { useNotify } from "@/hooks";
import { LinearGradient } from "expo-linear-gradient";
import { GroupService as GroupServiceAPI } from "src/services/groups/GroupApiService";

interface GroupServicesScreenProps {
  groupId: string;
  isGroupLeader?: boolean;
}

const { width } = Dimensions.get("window");
// Match GroupPurchaseScreen layout logic
// Padding Horizontal: 16 (container) -> handled in contentContainerStyle or wrapper?
// In GroupPurchaseScreen: ITEM_WIDTH = (width - 48) / 2.
// 48 comes from: 16 (left padding) + 16 (right padding) + 16 (gap).
const ITEM_WIDTH = (width - 48) / 2;

type TabOption = "catalog" | "acquired";

export const GroupServicesScreen: React.FC<GroupServicesScreenProps> = ({
  groupId,
  isGroupLeader = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabOption>("catalog");
  const [services, setServices] = useState<Service[]>([]);
  const [acquiredServices, setAcquiredServices] = useState<GroupService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hiring Modal State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [hiringModalVisible, setHiringModalVisible] = useState(false);
  const [processingHiring, setProcessingHiring] = useState(false);

  // Delete Modal State
  const [serviceToDelete, setServiceToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const notifyContext = useNotify();

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [availableData, acquiredData] = await Promise.all([
        ServicesApiService.getServices(),
        ServicesApiService.getGroupServices(groupId),
      ]);

      const activeServices = availableData.filter((s) => s.is_active);
      setServices(activeServices);
      setAcquiredServices(acquiredData);
    } catch (error) {
      console.error("Error loading services:", error);
      notifyContext.error({
        message: "Error al cargar servicios",
      });
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // --- Actions ---

  const handleHirePress = (service: Service) => {
    // Check if already acquired
    const isAcquired = acquiredServices.some(
      (gs) => gs.service_id === service.id && !gs.is_completed,
    );
    if (isAcquired) {
      notifyContext.info({ message: "Este servicio ya está activo." });
      return;
    }
    setSelectedService(service);
    setHiringModalVisible(true);
  };

  const handleDeletePress = (groupServiceId: string, serviceName: string) => {
    setServiceToDelete({ id: groupServiceId, name: serviceName });
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      setProcessingHiring(true);
      await ServicesApiService.cancelGroupService(serviceToDelete.id);
      notifyContext.success({
        message: "Servicio cancelado exitosamente.",
      });
      setDeleteModalVisible(false);
      setServiceToDelete(null);
      await loadData();
    } catch (error: any) {
      console.error("Error deleting service:", error);
      notifyContext.error({
        message: error.message || "Error al cancelar el servicio.",
      });
    } finally {
      setProcessingHiring(false);
    }
  };

  const confirmHiring = async () => {
    if (!selectedService) return;

    try {
      setProcessingHiring(true);

      // Auto-select "FULL" payment type
      const paymentTypes = await GroupServiceAPI.getPaymentTypes();
      const fullPayment = paymentTypes.find((pt) => pt.code === "FULL");

      if (!fullPayment) {
        throw new Error(
          "No se pudo configurar el método de pago automático (FULL).",
        );
      }

      await ServicesApiService.createGroupService(
        groupId,
        selectedService.id,
        fullPayment.id,
      );

      notifyContext.success({
        message: "¡Servicio contratado exitosamente!",
      });
      setHiringModalVisible(false);
      loadData();
    } catch (error: any) {
      console.error("Hiring error:", error);
      notifyContext.error({
        message: error.message || "Error al contratar el servicio.",
      });
    } finally {
      setProcessingHiring(false);
    }
  };

  // --- Renderers ---

  const renderServiceCard = ({ item }: { item: Service }) => {
    const priceDisplay = item.price
      ? `$ ${Number(item.price).toFixed(2)} USD`
      : "Consultar";

    return (
      <View
        className="mb-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-col"
        style={{ width: ITEM_WIDTH }}
      >
        <View className="h-32 bg-gray-100 relative">
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={["#f3f4f6", "#e5e7eb"]}
              className="w-full h-full items-center justify-center"
            >
              <MaterialCommunityIcons
                name="room-service-outline"
                size={32}
                color="#9ca3af"
              />
            </LinearGradient>
          )}
        </View>

        <View className="p-3 flex-1 flex-col justify-between">
          <View>
            <Text
              className="text-gray-900 font-bold text-sm mb-1 leading-4"
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text
              className="text-xs leading-3 mb-3 text-gray-400"
              numberOfLines={3}
            >
              {item.description}
            </Text>
          </View>

          <View>
            <Text className="text-gray-900 font-extrabold text-base mb-2">
              {priceDisplay}
            </Text>

            {isGroupLeader ? (
              <TouchableOpacity
                onPress={() => handleHirePress(item)}
                className="bg-orange-500 py-2.5 rounded-xl items-center active:bg-orange-600 shadow-sm shadow-orange-200"
              >
                <Text className="text-white text-xs font-bold uppercase tracking-wider">
                  Contratar
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-gray-100 py-2 rounded-lg items-center">
                <Text className="text-gray-400 text-xs font-bold uppercase">
                  Disponible
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderAcquiredCard = ({ item }: { item: GroupService }) => {
    const isCompleted = item.is_completed;
    return (
      <View className="mb-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-row items-center">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${isCompleted ? "bg-green-100" : "bg-blue-100"}`}
        >
          <MaterialCommunityIcons
            name={isCompleted ? "check-circle" : "clock-outline"}
            size={24}
            color={isCompleted ? "#16a34a" : "#2563eb"}
          />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-bold text-base">
            {item.service?.name || "Servicio"}
          </Text>
          <Text className="text-gray-500 text-xs mt-0.5">
            {isCompleted
              ? `Completado el ${new Date(item.completed_at!).toLocaleDateString()}`
              : "En curso • Activo"}
          </Text>
          {item.service?.price && (
            <Text className="text-gray-900 font-bold text-xs mt-1">
              $ {item.service.price} USD
            </Text>
          )}
        </View>
        {isGroupLeader && !isCompleted && (
          <View className="flex-row items-center">
            <TouchableOpacity
              className="bg-red-50 p-2 rounded-lg border border-red-100 ml-2 items-center justify-center"
              onPress={() =>
                handleDeletePress(item.id, item.service?.name || "Servicio")
              }
            >
              <Feather name="x" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // --- Hiring Modal (Confirm Only) ---
  const renderHiringModal = () => (
    <Modal
      visible={hiringModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setHiringModalVisible(false)}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl">
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-3">
              <MaterialCommunityIcons
                name="star-check-outline"
                size={32}
                color="#f97316"
              />
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center">
              Confirmar Contratación
            </Text>
          </View>

          <Text className="text-gray-500 text-center mb-6 px-4">
            ¿Deseas contratar el servicio{" "}
            <Text className="font-bold text-gray-800">
              "{selectedService?.name}"
            </Text>
            ?{"\n\n"}
            Se descontará{" "}
            <Text className="font-bold text-orange-600">
              ${selectedService?.price} USD
            </Text>{" "}
            de tu saldo como líder.
          </Text>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 py-3.5 bg-gray-100 rounded-xl items-center border border-gray-200"
              onPress={() => setHiringModalVisible(false)}
              disabled={processingHiring}
            >
              <Text className="font-bold text-gray-600">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3.5 bg-orange-500 rounded-xl items-center flex-row justify-center space-x-2 shadow-lg shadow-orange-200"
              onPress={confirmHiring}
              disabled={processingHiring}
            >
              {processingHiring && (
                <ActivityIndicator color="white" size="small" />
              )}
              <Text className="font-bold text-white">Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // --- Delete Modal ---
  const renderDeleteModal = () => (
    <Modal
      visible={deleteModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setDeleteModalVisible(false)}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl">
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
              <Feather name="trash-2" size={32} color="#ef4444" />
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center">
              Cancelar Servicio
            </Text>
          </View>

          <Text className="text-gray-500 text-center mb-6 px-4">
            ¿Estás seguro de que deseas cancelar el servicio{" "}
            <Text className="font-bold text-gray-800">
              "{serviceToDelete?.name}"
            </Text>
            ?{"\n\n"}
            Esta acción no se puede deshacer.
          </Text>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 py-3.5 bg-gray-100 rounded-xl items-center border border-gray-200"
              onPress={() => setDeleteModalVisible(false)}
              disabled={processingHiring}
            >
              <Text className="font-bold text-gray-600">No, volver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3.5 bg-red-500 rounded-xl items-center flex-row justify-center space-x-2 shadow-lg shadow-red-200"
              onPress={confirmDelete}
              disabled={processingHiring}
            >
              {processingHiring && (
                <ActivityIndicator color="white" size="small" />
              )}
              <Text className="font-bold text-white">Sí, cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header Tabs */}
      <View className="flex-row border-b border-gray-100 pt-2 px-4 bg-white z-10">
        <TouchableOpacity
          onPress={() => setActiveTab("catalog")}
          className={`mr-6 pb-3 ${activeTab === "catalog" ? "border-b-2 border-orange-500" : ""}`}
        >
          <Text
            className={`font-bold text-base ${activeTab === "catalog" ? "text-orange-500" : "text-gray-400"}`}
          >
            Catálogo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("acquired")}
          className={`mr-6 pb-3 ${activeTab === "acquired" ? "border-b-2 border-orange-500" : ""}`}
        >
          <Text
            className={`font-bold text-base ${activeTab === "acquired" ? "text-orange-500" : "text-gray-400"}`}
          >
            Mis Servicios
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 bg-gray-50/50">
        {activeTab === "catalog" ? (
          <FlatList
            key="catalog-list"
            data={services}
            renderItem={renderServiceCard}
            numColumns={2}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            columnWrapperStyle={{
              justifyContent: "space-between",
              paddingHorizontal: 16,
            }}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#f97316"
              />
            }
            ListHeaderComponent={
              <View className="mb-4 px-4 w-full">
                <Text className="text-lg font-bold text-gray-900">
                  Servicios Disponibles
                </Text>
                <Text className="text-gray-500 text-xs">
                  Mejora la experiencia de tu grupo.
                </Text>
              </View>
            }
            ListHeaderComponentStyle={{ paddingHorizontal: 0 }} // Controlled manually
            ListEmptyComponent={
              <View className="py-20 items-center justify-center">
                <MaterialCommunityIcons
                  name="store-off-outline"
                  size={48}
                  color="#d1d5db"
                />
                <Text className="text-gray-400 mt-2 font-medium">
                  No hay servicios disponibles.
                </Text>
              </View>
            }
          />
        ) : (
          <FlatList
            key="acquired-list"
            data={acquiredServices}
            renderItem={renderAcquiredCard}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#f97316"
              />
            }
            ListHeaderComponent={
              <View className="mb-4">
                <Text className="text-lg font-bold text-gray-900">
                  Servicios Contratados
                </Text>
                <Text className="text-gray-500 text-xs">
                  Historial de servicios activos y pasados.
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View className="py-20 items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200 mt-4 mx-1">
                <MaterialCommunityIcons
                  name="playlist-remove"
                  size={40}
                  color="#d1d5db"
                />
                <Text className="text-gray-400 mt-2 font-medium">
                  Aún no han contratado servicios.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {renderHiringModal()}
      {renderDeleteModal()}
    </View>
  );
};

export default GroupServicesScreen;
