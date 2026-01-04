import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Order, OrderService } from "@/services/OrderApiService";
import { useNotify } from "@/hooks";
import { CustomLoader } from "@/components/shared/loader/Loader";

interface GroupOrder extends Order {
  group_id?: string;
  payment_type?: "EQUAL_SPLIT" | "FULL";
  group_member_payments?: Array<{
    user_id: string;
    user_name: string;
    amount: number;
    status: "pending" | "paid";
  }>;
}

const ORDER_STATUSES = {
  pending: { label: "Pendiente", color: "#F88D2A", icon: "clock-outline" },
  confirmed: {
    label: "Confirmada",
    color: "#0066CC",
    icon: "check-circle-outline",
  },
  processing: {
    label: "Procesando",
    color: "#6BA43A",
    icon: "sync-circle",
  },
  shipped: { label: "Enviada", color: "#9333EA", icon: "truck-outline" },
  delivered: { label: "Entregada", color: "#22C55E", icon: "check-all" },
  cancelled: { label: "Cancelada", color: "#DC2626", icon: "close-circle" },
};

const PAYMENT_STATUSES = {
  pending: { label: "Pendiente", color: "#F88D2A" },
  paid: { label: "Pagado", color: "#22C55E" },
  failed: { label: "Fallido", color: "#DC2626" },
  refunded: { label: "Reembolsado", color: "#6366F1" },
};

/**
 * Formatea una cantidad con su moneda
 */
const formatCurrency = (
  amount: number,
  currency: string = "BECOIN"
): string => {
  const currency_upper = (currency || "BECOIN").toUpperCase();

  if (currency_upper.includes("BECOIN") || currency_upper === "BC") {
    return `${amount.toFixed(2)} becoins`;
  }
  if (currency_upper === "USD") {
    return `$ ${amount.toFixed(2)}`;
  }
  // Default a Becoins
  return `${amount.toFixed(2)} becoins`;
};

/**
 * Modal de detalles de la orden
 */
type OrderDetailsModalProps = {
  visible: boolean;
  order: GroupOrder | null;
  onClose: () => void;
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  visible,
  order,
  onClose,
}) => {
  if (!order) return null;

  const statusInfo =
    ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] ||
    ORDER_STATUSES.pending;
  const paymentInfo =
    PAYMENT_STATUSES[order.payment_status as keyof typeof PAYMENT_STATUSES] ||
    PAYMENT_STATUSES.pending;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <View className="bg-gradient-to-r from-green-500 to-orange-400 p-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white font-bold text-base">
                Orden #{order.order_number}
              </Text>
              <Text className="text-white/80 text-xs mt-1">
                {new Date(order.created_at || "").toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Contenido */}
          <ScrollView className="p-4 max-h-96">
            {/* Estado de Orden */}
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
                  ESTADO DE ORDEN
                </Text>
                <Text
                  className="text-base font-bold"
                  style={{ color: statusInfo.color }}
                >
                  {statusInfo.label}
                </Text>
              </View>
            </View>

            {/* Estado de Pago */}
            <View className="mb-4 p-3 bg-gray-50 rounded-lg flex-row items-center gap-3">
              <View
                className="rounded-lg p-2"
                style={{ backgroundColor: `${paymentInfo.color}20` }}
              >
                <MaterialCommunityIcons
                  name="credit-card"
                  size={20}
                  color={paymentInfo.color}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-600 font-medium">PAGO</Text>
                <Text
                  className="text-base font-bold"
                  style={{ color: paymentInfo.color }}
                >
                  {paymentInfo.label}
                </Text>
              </View>
            </View>

            {/* Items */}
            <View className="mb-4">
              <Text className="text-base font-bold text-gray-900 mb-2">
                Artículos ({order.items?.length || 0})
              </Text>
              {order.items?.map((item) => (
                <View
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-3 mb-2 flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 text-sm">
                      {item.product?.name || "Producto"}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {item.quantity}x @{" "}
                      {formatCurrency(item.unit_price, order.currency)}
                    </Text>
                  </View>
                  <Text className="font-bold text-gray-900">
                    {formatCurrency(item.total_price, order.currency)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Totales */}
            <View className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-700">Subtotal:</Text>
                <Text className="font-semibold">
                  {formatCurrency(order.subtotal, order.currency)}
                </Text>
              </View>
              {order.tax_amount > 0 && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-700">Impuesto:</Text>
                  <Text className="font-semibold">
                    {formatCurrency(order.tax_amount, order.currency)}
                  </Text>
                </View>
              )}
              {order.shipping_amount > 0 && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-700">Envío:</Text>
                  <Text className="font-semibold">
                    {formatCurrency(order.shipping_amount, order.currency)}
                  </Text>
                </View>
              )}
              {order.discount_amount > 0 && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-green-700 font-semibold">
                    Descuento:
                  </Text>
                  <Text className="font-semibold text-green-700">
                    -{formatCurrency(order.discount_amount, order.currency)}
                  </Text>
                </View>
              )}
              <View className="border-t border-green-200 pt-2 flex-row justify-between">
                <Text className="font-bold text-green-900">TOTAL:</Text>
                <Text className="text-lg font-bold text-green-600">
                  {formatCurrency(order.total_amount, order.currency)}
                </Text>
              </View>
            </View>

            {/* Pagos de miembros (si es orden de grupo) */}
            {order.group_member_payments &&
              order.group_member_payments.length > 0 && (
                <View className="mb-4">
                  <Text className="text-base font-bold text-gray-900 mb-2">
                    Pagos de Miembros
                  </Text>
                  {order.group_member_payments.map((payment, idx) => (
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
                        {formatCurrency(payment.amount, order.currency)}
                      </Text>
                    </View>
                  ))}
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

export const GroupOrdersHistoryScreen = () => {
  const navigation = useNavigation();
  const route =
    useRoute<
      RouteProp<{ params: { groupId: string; groupName?: string } }, "params">
    >();
  const groupId = (route.params as any)?.groupId;
  const groupName = (route.params as any)?.groupName || "Grupo";

  const [orders, setOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedOrder, setSelectedOrder] = useState<GroupOrder | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const notify = useNotify();

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await OrderService.getGroupOrders(groupId);
      setOrders(response.data as GroupOrder[]);
    } catch (error) {
      console.error("Error loading orders:", error);
      notify.error({
        message: "Error al cargar las órdenes",
      });
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await OrderService.getGroupOrders(groupId);
      setOrders(response.data as GroupOrder[]);
    } catch (error) {
      console.error("Error refreshing orders:", error);
      notify.error({
        message: "Error al actualizar órdenes",
      });
    } finally {
      setRefreshing(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Filtrar y ordenar órdenes
  const filteredOrders = orders
    .filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (paymentFilter !== "all" && order.payment_status !== paymentFilter)
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "recent")
        return (
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
        );
      if (sortBy === "oldest")
        return (
          new Date(a.created_at || "").getTime() -
          new Date(b.created_at || "").getTime()
        );
      if (sortBy === "amount") return b.total_amount - a.total_amount;
      return 0;
    });

  const windowHeight = Dimensions.get("window").height;
  const listHeight = Math.max(420, windowHeight - 280);

  const renderOrderCard = ({ item }: { item: GroupOrder }) => {
    const statusInfo =
      ORDER_STATUSES[item.status as keyof typeof ORDER_STATUSES] ||
      ORDER_STATUSES.pending;
    const paymentInfo =
      PAYMENT_STATUSES[item.payment_status as keyof typeof PAYMENT_STATUSES] ||
      PAYMENT_STATUSES.pending;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedOrder(item);
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
              Orden #{item.order_number}
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
              {formatCurrency(item.total_amount, item.currency)}
            </Text>
            <View
              className="mt-1 rounded-full px-2 py-1"
              style={{ backgroundColor: `${paymentInfo.color}20` }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: paymentInfo.color }}
              >
                {paymentInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Artículos */}
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <Text className="text-xs font-medium text-gray-600 mb-2">
            ARTÍCULOS
          </Text>
          {item.items?.slice(0, 2).map((product) => (
            <Text key={product.id} className="text-sm text-gray-700">
              • {product.product?.name || "Producto"} (x{product.quantity})
            </Text>
          ))}
          {(item.items?.length || 0) > 2 && (
            <Text className="text-xs text-gray-500 mt-1">
              +{(item.items?.length || 0) - 2} más
            </Text>
          )}
        </View>

        {/* Estado */}
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
        {/* Stats */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-green-50 rounded-lg p-2 border border-green-200">
            <Text className="text-xs text-green-600 font-medium">TOTAL</Text>
            <Text className="text-lg font-bold text-green-900">
              {orders.length > 0
                ? formatCurrency(
                    orders.reduce((sum, o) => sum + o.total_amount, 0),
                    orders[0]?.currency || "BECOIN"
                  )
                : formatCurrency(0)}
            </Text>
          </View>
          <View className="flex-1 bg-blue-50 rounded-lg p-2 border border-blue-200">
            <Text className="text-xs text-blue-600 font-medium">ÓRDENES</Text>
            <Text className="text-lg font-bold text-blue-900">
              {orders.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Filtros */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        {/* Estado de Orden */}
        <View className="mb-3">
          <Text className="text-xs font-bold text-gray-600 mb-2 uppercase">
            Estado
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6 }}
          >
            <TouchableOpacity
              onPress={() => setStatusFilter("all")}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: statusFilter === "all" ? "#6BA43A" : "#f3f4f6",
                borderWidth: 1,
                borderColor: statusFilter === "all" ? "#6BA43A" : "#e5e7eb",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: statusFilter === "all" ? "600" : "500",
                  color: statusFilter === "all" ? "#fff" : "#666",
                }}
              >
                Todos
              </Text>
            </TouchableOpacity>

            {Object.entries(ORDER_STATUSES).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setStatusFilter(key)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor:
                    statusFilter === key ? value.color : "#f3f4f6",
                  borderWidth: 1,
                  borderColor: statusFilter === key ? value.color : "#e5e7eb",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: statusFilter === key ? "600" : "500",
                    color: statusFilter === key ? "#fff" : "#666",
                  }}
                >
                  {value.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Pago y Ordenamiento en una fila */}
        <View className="flex-row gap-3">
          {/* Estado de Pago */}
          <View className="flex-1">
            <Text className="text-xs font-bold text-gray-600 mb-2 uppercase">
              Pago
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 4 }}
            >
              <TouchableOpacity
                onPress={() => setPaymentFilter("all")}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 14,
                  backgroundColor:
                    paymentFilter === "all" ? "#6BA43A" : "#f3f4f6",
                  borderWidth: 1,
                  borderColor: paymentFilter === "all" ? "#6BA43A" : "#e5e7eb",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: paymentFilter === "all" ? "600" : "500",
                    color: paymentFilter === "all" ? "#fff" : "#666",
                  }}
                >
                  Todos
                </Text>
              </TouchableOpacity>

              {Object.entries(PAYMENT_STATUSES).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setPaymentFilter(key)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 14,
                    backgroundColor:
                      paymentFilter === key ? value.color : "#f3f4f6",
                    borderWidth: 1,
                    borderColor:
                      paymentFilter === key ? value.color : "#e5e7eb",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: paymentFilter === key ? "600" : "500",
                      color: paymentFilter === key ? "#fff" : "#666",
                    }}
                  >
                    {value.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Ordenamiento */}
          <View className="flex-1">
            <Text className="text-xs font-bold text-gray-600 mb-2 uppercase">
              Orden
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 4 }}
            >
              {[
                { label: "Reciente", value: "recent" },
                { label: "Antiguo", value: "oldest" },
                { label: "Monto", value: "amount" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setSortBy(option.value)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 14,
                    backgroundColor:
                      sortBy === option.value ? "#6BA43A" : "#f3f4f6",
                    borderWidth: 1,
                    borderColor:
                      sortBy === option.value ? "#6BA43A" : "#e5e7eb",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: sortBy === option.value ? "600" : "500",
                      color: sortBy === option.value ? "#fff" : "#666",
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Lista de órdenes */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <CustomLoader />
        </View>
      ) : filteredOrders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <MaterialCommunityIcons name="inbox-outline" size={80} color="#CCC" />
          <Text className="text-xl font-bold text-gray-900 mt-4">
            Sin órdenes
          </Text>
          <Text className="text-gray-600 text-sm mt-2">
            No hay órdenes que coincidan con los filtros
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderCard}
          contentContainerStyle={{ paddingVertical: 12 }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6BA43A"]}
              tintColor="#6BA43A"
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
      <OrderDetailsModal
        visible={detailsVisible}
        order={selectedOrder}
        onClose={() => {
          setDetailsVisible(false);
          setSelectedOrder(null);
        }}
      />
    </View>
  );
};

export default GroupOrdersHistoryScreen;
