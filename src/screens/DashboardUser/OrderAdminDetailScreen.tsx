import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import { Order as ApiOrder } from "@services/OrderApiService";
import { OrderService } from "@services/core";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { colors } from "src/styles/colors";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";

type RouteProps = RouteProp<Record<string, object | undefined>, string> & {
  params: { orderId: string };
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16 },
  section: { marginBottom: 16 },
  label: { fontSize: 12, color: colors.textSecondary },
  value: { fontSize: 16, color: colors.textPrimary, fontWeight: "700" },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f5f5f5",
  },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.belandOrange,
  },
  actionBtnText: { color: "white", fontWeight: "700" },
});

export const OrderAdminDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const { orderId } = route.params || { orderId: undefined };
  const { goBack } = useCustomNavigation();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const res = await OrderService.getOrder(orderId);
        if (mounted) setOrder(res as ApiOrder);
      } catch (err) {
        console.error("OrderAdminDetail: could not fetch order", err);
        Alert.alert("Error", "No se pudo obtener la orden");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const changeStatus = async (status: string) => {
    if (!orderId) return;
    setLoading(true);
    try {
      await OrderService.updateOrderStatus(
        orderId,
        status as ApiOrder["status"]
      );
      const refreshed = await OrderService.getOrder(orderId);
      setOrder(refreshed as ApiOrder);
      Alert.alert("OK", `Estado actualizado a ${status}`);
    } catch (err) {
      console.error("OrderAdminDetail: change status failed", err);
      Alert.alert("Error", "No se pudo cambiar el estado");
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    if (!orderId) return;
    Alert.alert("Cancelar orden", "¿Confirmar cancelar esta orden?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await OrderService.cancelOrder(orderId);
            const refreshed = await OrderService.getOrder(orderId);
            setOrder(refreshed as ApiOrder);
            Alert.alert("OK", "Orden cancelada");
          } catch (err) {
            console.error("OrderAdminDetail: cancel failed", err);
            Alert.alert("Error", "No se pudo cancelar la orden");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (loading && !order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.belandOrange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedHeader
        title={`Orden ${orderId ? `#${String(orderId).slice(-8)}` : ""}`}
        canGoBack
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Estado</Text>
          <Text style={styles.value}>
            {typeof order?.status === "object"
              ? (order?.status as any)?.code
              : order?.status ?? "-"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Usuario</Text>
          <Text style={styles.value}>
            {(order as any)?.user?.full_name ?? (order as any)?.user_id ?? "-"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Dirección de envío</Text>
          <Text style={styles.value}>
            {order?.shipping_address?.street ?? "-"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Productos</Text>
          {(order?.items || []).map((it: any) => (
            <View
              key={it.id || `${it.product_id}-${Math.random()}`}
              style={styles.itemRow}
            >
              {it.image ? (
                <Image source={{ uri: it.image }} style={styles.itemImage} />
              ) : (
                <View style={styles.itemImage} />
              )}
              <View>
                <Text style={styles.value}>
                  {it.name ?? it.product?.name ?? "-"}
                </Text>
                <Text style={styles.label}>{`x${it.quantity} • $${Number(
                  it.total_price ?? it.subtotal ?? it.unit_price ?? 0
                ).toFixed(2)}`}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Resumen</Text>
          <Text style={styles.value}>{`Subtotal: $${Number(
            order?.subtotal ?? 0
          ).toFixed(2)}`}</Text>
          <Text style={styles.value}>{`Total: $${Number(
            order?.total_amount ?? 0
          ).toFixed(2)}`}</Text>
        </View>

        <View style={styles.actions}>
          {(() => {
            const status =
              typeof order?.status === "object"
                ? (order?.status as any)?.code
                : order?.status;
            if (!status) return null;

            const getNext = (s: string) => {
              if (s === "pending" || s === "confirmed")
                return { next: "processing", label: "Preparar" } as const;
              if (s === "processing")
                return { next: "shipped", label: "Enviar" } as const;
              if (s === "shipped")
                return { next: "delivered", label: "Entregar" } as const;
              return null;
            };

            const action = getNext(status);

            return (
              <>
                {action ? (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => changeStatus(action.next)}
                    disabled={!order}
                  >
                    <Text style={styles.actionBtnText}>{action.label}</Text>
                  </TouchableOpacity>
                ) : null}

                {/* Cancel allowed until delivered/cancelled */}
                {status !== "delivered" && status !== "cancelled" ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]}
                    onPress={cancel}
                    disabled={!order}
                  >
                    <Text style={styles.actionBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            );
          })()}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderAdminDetailScreen;
