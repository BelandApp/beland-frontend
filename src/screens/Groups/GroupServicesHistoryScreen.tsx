import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import {
  ServicesApiService,
  GroupService,
} from "@/services/ServicesApiService";
import { useNotify } from "@/hooks";
import { CustomLoader } from "@/components/shared/loader/Loader";

interface GroupServiceWithPayments extends GroupService {
  payment_type?: "EQUAL_SPLIT" | "FULL";
  group_member_payments?: Array<{
    user_id: string;
    user_name: string;
    amount: number;
    status: "pending" | "paid";
  }>;
}

const SERVICE_STATUSES = {
  pending: { label: "Pendiente", color: "#F88D2A", icon: "clock-outline" },
  in_payment: {
    label: "En Pago",
    color: "#0066CC",
    icon: "credit-card-multiple-outline",
  },
  completed: { label: "Completado", color: "#22C55E", icon: "check-circle" },
};

const PAYMENT_STATUSES = {
  pending: { label: "Pendiente", color: "#F88D2A" },
  paid: { label: "Pagado", color: "#22C55E" },
  failed: { label: "Fallido", color: "#DC2626" },
  partial: { label: "Parcial", color: "#9333EA" },
};

type ServiceDetailsModalProps = {
  visible: boolean;
  service: GroupServiceWithPayments | null;
  onClose: () => void;
};

/**
 * Modal de detalles del servicio
 */
const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  visible,
  service,
  onClose,
}) => {
  if (!service) return null;

  const isCompleted = service.is_completed;
  const statusInfo =
    SERVICE_STATUSES[
      (isCompleted
        ? "completed"
        : "in_payment") as keyof typeof SERVICE_STATUSES
    ] || SERVICE_STATUSES.pending;

  const memberPaymentStatus =
    PAYMENT_STATUSES[
      (service.group_member_payments?.[0]?.status ||
        "pending") as keyof typeof PAYMENT_STATUSES
    ] || PAYMENT_STATUSES.pending;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <View className="bg-gradient-to-r from-orange-400 to-yellow-400 p-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white font-bold text-base">
                {service.service?.name || "Servicio"}
              </Text>
              <Text className="text-white/80 text-xs mt-1">
                {new Date(service.created_at || "").toLocaleDateString(
                  "es-AR",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Contenido */}
          <ScrollView className="p-4 max-h-96">
            {/* Descripción del servicio */}
            {service.service?.description && (
              <View className="mb-4">
                <Text className="text-xs text-gray-600 font-bold uppercase mb-2">
                  Descripción
                </Text>
                <Text className="text-sm text-gray-700 leading-5">
                  {service.service.description}
                </Text>
              </View>
            )}

            {/* Estado del Servicio */}
            <View className="mb-4 p-3 bg-gray-50 rounded-lg flex-row items-center gap-3">
              <View
                className="rounded-lg p-2"
                style={{ backgroundColor: `${statusInfo.color}20` }}
              >
                <MaterialCommunityIcons
                  name={statusInfo.icon as any}
                  size={20}
                  color={statusInfo.color}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-600 font-medium">
                  ESTADO
                </Text>
                <Text
                  className="text-base font-bold"
                  style={{ color: statusInfo.color }}
                >
                  {statusInfo.label}
                </Text>
              </View>
            </View>

            {/* Información de Costo */}
            <View className="bg-orange-50 rounded-lg p-3 mb-4 border border-orange-200">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-700 font-medium">Costo Total:</Text>
                <Text className="font-bold">
                  BsF {service.service?.price.toFixed(2)}
                </Text>
              </View>
              {service.payment_type && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-700 font-medium">
                    Tipo de Pago:
                  </Text>
                  <Text className="font-bold text-blue-700">
                    {service.payment_type === "EQUAL_SPLIT"
                      ? "División Igual"
                      : "Pago Completo"}
                  </Text>
                </View>
              )}
            </View>

            {/* Pagos de Miembros */}
            {service.group_member_payments &&
              service.group_member_payments.length > 0 && (
                <View className="mb-4">
                  <Text className="text-base font-bold text-gray-900 mb-2">
                    Pagos de Miembros
                  </Text>
                  {service.group_member_payments.map((payment, idx) => (
                    <View
                      key={idx}
                      className="bg-blue-50 rounded-lg p-3 mb-2 flex-row items-center justify-between"
                    >
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900 text-sm">
                          {payment.user_name}
                        </Text>
                        <Text
                          className="text-xs font-medium mt-1"
                          style={{
                            color:
                              payment.status === "paid" ? "#22C55E" : "#F88D2A",
                          }}
                        >
                          {payment.status === "paid"
                            ? "✓ Pagado"
                            : "⏱ Pendiente"}
                        </Text>
                      </View>
                      <Text className="font-bold text-gray-900">
                        BsF {payment.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

            {/* Fecha de Completación */}
            {isCompleted && service.completed_at && (
              <View className="bg-green-50 rounded-lg p-3 border border-green-200">
                <Text className="text-xs text-green-600 font-bold uppercase mb-1">
                  Completado en
                </Text>
                <Text className="text-sm font-semibold text-green-900">
                  {new Date(service.completed_at).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Botón cerrar */}
          <View className="border-t border-gray-200 p-4">
            <TouchableOpacity
              className="bg-gray-100 rounded-lg py-3"
              onPress={onClose}
            >
              <Text className="text-center font-semibold text-gray-700">
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const GroupServicesHistoryScreenComponent = () => {
  const navigation = useNavigation();
  const route =
    useRoute<
      RouteProp<{ params: { groupId: string; groupName?: string } }, "params">
    >();
  const groupId = (route.params as any)?.groupId;
  const groupName = (route.params as any)?.groupName || "Grupo";

  const [services, setServices] = useState<GroupServiceWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedService, setSelectedService] =
    useState<GroupServiceWithPayments | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const notifyContext = useNotify();

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Reemplazar con endpoint real cuando esté disponible
      // const response = await ServicesService.getGroupServices(groupId);
      // setServices(response);
      setServices([]);
    } catch (error) {
      console.error("Error loading services:", error);
      notifyContext.error({
        message: "Error al cargar los servicios",
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, notifyContext]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: Reemplazar con endpoint real cuando esté disponible
      setServices([]);
    } catch (error) {
      console.error("Error refreshing services:", error);
      notifyContext.error({
        message: "Error al actualizar servicios",
      });
    } finally {
      setRefreshing(false);
    }
  }, [groupId, notifyContext]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Filtrar servicios
  const filteredServices = services.filter((service) => {
    if (statusFilter !== "all") {
      const serviceStatus = service.is_completed ? "completed" : "in_payment";
      if (serviceStatus !== statusFilter) return false;
    }
    return true;
  });

  const windowHeight = Dimensions.get("window").height;
  const listHeight = Math.max(420, windowHeight - 280);

  const renderServiceCard = ({ item }: { item: GroupServiceWithPayments }) => {
    const isCompleted = item.is_completed;
    const statusInfo =
      SERVICE_STATUSES[
        (isCompleted
          ? "completed"
          : "in_payment") as keyof typeof SERVICE_STATUSES
      ] || SERVICE_STATUSES.pending;

    const totalAmount = item.service?.price || 0;
    const paidAmount =
      item.group_member_payments?.reduce(
        (sum, p) => (p.status === "paid" ? sum + p.amount : sum),
        0
      ) || 0;
    const pendingAmount = totalAmount - paidAmount;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedService(item);
          setDetailsVisible(true);
        }}
        className="bg-white rounded-2xl mb-3 mx-4 p-4 border border-gray-200"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="font-bold text-base text-gray-900">
              {item.service?.name || "Servicio"}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              {new Date(item.created_at || "").toLocaleDateString("es-AR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-lg font-bold text-gray-900">
              BsF {totalAmount.toFixed(2)}
            </Text>
            <View
              className="mt-1 rounded-full px-2 py-1"
              style={{ backgroundColor: `${statusInfo.color}20` }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: statusInfo.color }}
              >
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Descripción */}
        {item.service?.description && (
          <View className="bg-gray-50 rounded-lg p-3 mb-3">
            <Text className="text-xs font-medium text-gray-600 mb-1">
              DESCRIPCIÓN
            </Text>
            <Text className="text-sm text-gray-700 line-clamp-2">
              {item.service.description}
            </Text>
          </View>
        )}

        {/* Pagos */}
        <View className="flex-row gap-2 mb-3">
          <View className="flex-1 bg-green-50 rounded-lg p-2 border border-green-200">
            <Text className="text-xs text-green-600 font-bold">PAGADO</Text>
            <Text className="text-sm font-bold text-green-900">
              BsF {paidAmount.toFixed(2)}
            </Text>
          </View>
          {pendingAmount > 0 && (
            <View className="flex-1 bg-orange-50 rounded-lg p-2 border border-orange-200">
              <Text className="text-xs text-orange-600 font-bold">
                PENDIENTE
              </Text>
              <Text className="text-sm font-bold text-orange-900">
                BsF {pendingAmount.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Estado y tipo de pago */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View
              className="rounded-lg p-2"
              style={{ backgroundColor: `${statusInfo.color}20` }}
            >
              <MaterialCommunityIcons
                name={statusInfo.icon as any}
                size={16}
                color={statusInfo.color}
              />
            </View>
            <Text
              className="font-semibold text-sm"
              style={{ color: statusInfo.color }}
            >
              {statusInfo.label}
            </Text>
          </View>

          {item.payment_type && (
            <View className="bg-blue-100 rounded-full px-2 py-1">
              <Text className="text-xs font-bold text-blue-700">
                {item.payment_type === "EQUAL_SPLIT" ? "Dividida" : "Full"}
              </Text>
            </View>
          )}

          <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-3">
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={{
              padding: 8,
              backgroundColor: "#f3f4f6",
              borderRadius: 8,
            }}
          >
            <Feather name="arrow-left" size={24} color="#F88D2A" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              Historial de Servicios
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Grupo: {groupName}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-orange-50 rounded-lg p-2 border border-orange-200">
            <Text className="text-xs text-orange-600 font-medium">
              CONTRATADOS
            </Text>
            <Text className="text-lg font-bold text-orange-900">
              {services.length}
            </Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-lg p-2 border border-green-200">
            <Text className="text-xs text-green-600 font-medium">
              COMPLETADOS
            </Text>
            <Text className="text-lg font-bold text-green-900">
              {services.filter((s) => s.is_completed).length}
            </Text>
          </View>
        </View>
      </View>

      {/* Filtros */}
      <View className="bg-white border-b border-gray-200">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
        >
          <TouchableOpacity
            onPress={() => setStatusFilter("all")}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              marginRight: 8,
              backgroundColor: statusFilter === "all" ? "#F88D2A" : "#f3f4f6",
              borderWidth: 1,
              borderColor: statusFilter === "all" ? "#F88D2A" : "#e5e7eb",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: statusFilter === "all" ? "#fff" : "#666",
              }}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {Object.entries(SERVICE_STATUSES).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setStatusFilter(key)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                marginRight: 8,
                backgroundColor:
                  statusFilter === key ? `${value.color}15` : "#f3f4f6",
                borderWidth: 1,
                borderColor: statusFilter === key ? value.color : "#e5e7eb",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: statusFilter === key ? "600" : "500",
                  color: statusFilter === key ? value.color : "#666",
                }}
              >
                {value.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de servicios */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <CustomLoader />
        </View>
      ) : filteredServices.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <MaterialCommunityIcons name="dumbbell" size={80} color="#CCC" />
          <Text className="text-xl font-bold text-gray-900 mt-4">
            Sin servicios
          </Text>
          <Text className="text-gray-600 text-sm mt-2">
            No hay servicios contratados aún
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceCard}
          contentContainerStyle={{ paddingVertical: 12 }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#F88D2A"]}
              tintColor="#F88D2A"
            />
          }
          style={
            Platform.OS === "web"
              ? ({ height: listHeight, overflow: "auto" } as any)
              : { flex: 1 }
          }
        />
      )}

      {/* Modal de detalles */}
      <ServiceDetailsModal
        visible={detailsVisible}
        service={selectedService}
        onClose={() => {
          setDetailsVisible(false);
          setSelectedService(null);
        }}
      />
    </View>
  );
};

export { GroupServicesHistoryScreenComponent as GroupServicesHistoryScreen };
export default GroupServicesHistoryScreenComponent;
