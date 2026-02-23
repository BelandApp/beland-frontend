import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { OrdedNormalized } from "@services/OrderApiService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useOrdersAdmin } from "./useOrderAdmin";
import { OrderStatus, STATUS_FLOW, STATUS_META } from "./orderStatus.config";
import { useCustomNavigation } from "src/hooks";
import {
  Button,
  ThemedHeader,
  useThemedTabs,
  VerificationCodeModal,
} from "src/components";
import { EyeIcon, MapPin, Package, User, X } from "lucide-react-native";
import { colors } from "src/design-system";
import RecolectModal from "src/components/shared/modals/RecollectModal";

import ThemedTabs from "src/components/shared/Tabs/ThemedTabs";
import { useResponsiveLayout } from "@/hooks";
const ACTIVE_STATUSES = ["PENDING", "PREPARING", "ON_ROUTE"];
const COMPLETED_STATUSES = ["DELIVERED", "COLLECTED", "RECYCLED"];
const CANCELLED_STATUSES = ["CANCELLED"];
export const OrdersManagementScreen = () => {
  const { navigate } = useCustomNavigation();

  const {
    orders,
    loading,
    refreshing,
    isFetchingMore,
    total,
    setFilters,
    loadOrders,
    changeStatus,
    cancelOrder,
    deliverOrder,
    modalRecollet,
    setModalRecollect,
    modalDelivery,
    setModalDelivery,
    recollectOrder,
    page,
  } = useOrdersAdmin();
  const { isMobile } = useResponsiveLayout();
  const { activeTab, tabs, onTabChange } = useThemedTabs([
    "Activas",
    "Finalizadas",
    "Canceladas",
  ]);
  const filteredOrders = useMemo(() => {
    if (activeTab === "Activas") {
      return orders.filter((o) => ACTIVE_STATUSES.includes(o.status.code));
    }

    if (activeTab === "Finalizadas") {
      return orders.filter((o) => COMPLETED_STATUSES.includes(o.status.code));
    }

    if (activeTab === "Canceladas") {
      return orders.filter((o) => CANCELLED_STATUSES.includes(o.status.code));
    }

    return orders;
  }, [orders, activeTab]);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const handleNextStatus = async (order: any) => {
    const current = order.normalizedStatus;
    const next = STATUS_FLOW[current as keyof typeof STATUS_FLOW];
    if (!next) return;

    await changeStatus(order.id, next.next as OrderStatus);
  };
  const hasScrolledRef = useRef(false);
  const renderOrder = ({ item }: { item: OrdedNormalized }) => {
    const statusMeta = STATUS_META[item.normalizedStatus as OrderStatus];
    return (
      <TouchableOpacity
        onPress={() => navigate("OrderAdminDetail", { orderId: item.id })}
        className="p-4 m-1 rounded bg-white shadow-slate-100 border border-[#e9ecef]"
      >
        <View className="flex-row justify-between">
          <View>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Orden #{item.order_number}
            </Text>
            <Text className="text-xs">
              {item.created_at
                ? new Date(item.created_at).toLocaleDateString("es-ES", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Fecha desconocida"}
            </Text>
          </View>
          <View>
            <View
              style={{
                backgroundColor: statusMeta.color,
              }}
              className="rounded shadow-slate-50 py-1 px-2 flex-row items-center"
            >
              <MaterialCommunityIcons
                name={statusMeta.icon as any}
                size={16}
                color="white"
                style={{ marginRight: 4 }}
              />
              <Text className="text-center text-white">{statusMeta.label}</Text>
            </View>
            <Text className="text-beland-orange-500 font-semibold text-lg self-end pr-1">
              Usd ${item.total_amount}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-1 items-center">
          <User size={16} />
          <Text>{item.user?.full_name ?? "Sin usuario"}</Text>
        </View>
        <View className="flex-row gap-1 items-center my-1">
          <MapPin size={16} />
          <Text>
            {item.address &&
              `${item.address.addressLine1}, ${item.address.city} CP: ${item.address.postalCode}`}
          </Text>
        </View>
        <View className="flex-row gap-1 items-center">
          <Package size={16} />
          <Text>{item.total_items ?? "Sin datos"}</Text>
        </View>

        <View className="flex-row justify-between mt-3 border-t border-t-slate-200 pt-2">
          <View className="flex-row gap-2">
            {item.normalizedStatus !== "collected" &&
              STATUS_FLOW[item.normalizedStatus as OrderStatus] && (
                <Button
                  title={
                    STATUS_FLOW[item.normalizedStatus].label as OrderStatus
                  }
                  onPress={() => {
                    setSelectedOrderId(item.id);
                    handleNextStatus(item);
                  }}
                  variant={isMobile ? "onlyIcon" : "box"}
                  style={{ backgroundColor: colors.brand.orange[500] }}
                  textStyle={{ color: "white" }}
                  icon={
                    <MaterialCommunityIcons
                      name={STATUS_FLOW[item.normalizedStatus].icon as any}
                      size={16}
                      color="white"
                    />
                  }
                />
              )}
            {item.normalizedStatus !== "cancelled" &&
              item.normalizedStatus === "pending" && (
                <Button
                  title="Cancelar"
                  onPress={() => cancelOrder(item.id)}
                  variant={isMobile ? "onlyIcon" : "box"}
                  style={{
                    backgroundColor: colors.semantic.error[500],
                    borderColor: colors.semantic.error[600],
                  }}
                  textStyle={{ color: "white" }}
                  icon={<X color="white" size="18" />}
                />
              )}
          </View>
          <Button
            title="Ver Detalle"
            onPress={() => navigate("OrderAdminDetail", { orderId: item.id })}
            variant={isMobile ? "onlyIcon" : "box"}
            style={{
              borderColor: colors.border.secondary,
            }}
            icon={<EyeIcon size={18} />}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <ThemedHeader title="Ordenes" canGoBack />
      <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 6 }}>
        <ThemedTabs tabs={tabs} onTabChange={onTabChange} />
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrder}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadOrders(true, 1)}
              />
            }
            onEndReachedThreshold={0.2}
            ListFooterComponent={
              isFetchingMore ? (
                <ActivityIndicator style={{ marginVertical: 16 }} />
              ) : (
                <>
                  <Button
                    title="Cargar mas"
                    className="mx-auto"
                    onPress={() => loadOrders(false, page + 1)}
                  />
                  <Text className="mx-auto font-semibold">
                    {filteredOrders.length}/ {total}
                  </Text>
                </>
              )
            }
            ListEmptyComponent={!loading ? <Text>No hay ordenes</Text> : null}
          />
        )}
      </View>
      {selectedOrderId && (
        <VerificationCodeModal
          visible={modalDelivery}
          onClose={() => setModalDelivery(false)}
          onConfirm={deliverOrder}
          orderNumber={selectedOrderId}
        />
      )}
      {selectedOrderId && (
        <RecolectModal
          isOpen={modalRecollet}
          onClose={() => setModalRecollect(false)}
          onConfirm={(weight) => recollectOrder(selectedOrderId, weight)}
        />
      )}
    </>
  );
};
