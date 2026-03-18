import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Package, ChevronRight, Clock } from "lucide-react-native";
import { OrderService, Order } from "src/services/OrderApiService";
import { DateToTextClose } from "src/utils/dateTransform";
import { useCustomNavigation } from "src/hooks";
import { convertUSDToBeCoins } from "src/constants";

interface RecentOrdersListProps {
  limit?: number;
  onViewAll?: () => void;
}

export const RecentOrdersList: React.FC<RecentOrdersListProps> = ({
  limit = 5,
  onViewAll,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigate } = useCustomNavigation();
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await OrderService.getUserOrders();
      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(ordersData.slice(0, limit));
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusCode: string): string => {
    switch (statusCode) {
      case "DELIVERED":
      case "COLLECTED":
      case "RECYCLED":
        return "#4CAF50";
      case "PENDING":
      case "PREPARING":
        return "#FF9800";
      case "IN_DELIVERY":
        return "#2196F3";
      case "CANCELLED":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusText = (order: Order): string => {
    return order.status?.name || "En proceso";
  };

  const getStatusCode = (order: Order): string => {
    return order.status?.code || "PENDING";
  };

  if (loading) {
    return null;
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Package size={20} color="#FF6B35" />
          <Text style={styles.title}>Órdenes Recientes</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No tienes órdenes aún</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Package size={20} color="#FF6B35" />
          <Text style={styles.title}>Órdenes Recientes</Text>
        </View>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>Ver todas</Text>
            <ChevronRight size={16} color="#FF6B35" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.ordersList}>
        {orders.map((order: Order) => {
          const orderDate = order.created_at;
          const statusText = getStatusText(order);
          const statusCode = getStatusCode(order);
          const statusColor = getStatusColor(statusCode);

          return (
            <TouchableOpacity
              key={order.id}
              style={styles.orderItem}
              onPress={() =>
                navigate("Orders", {
                  screen: "OrderDetail",
                  params: { orderId: order.id },
                })
              }
            >
              <View style={styles.orderLeft}>
                <View
                  style={[
                    styles.orderIcon,
                    { backgroundColor: statusColor + "20" },
                  ]}
                >
                  <Package size={18} color={statusColor} />
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>
                    #{order.id.slice(0, 8)}
                  </Text>
                  <View style={styles.orderMeta}>
                    <Clock size={12} color="#999" />
                    <Text style={styles.orderDate}>
                      {DateToTextClose(orderDate)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.orderRight}>
                <Text style={styles.orderPrice}>${order.total_amount}</Text>
                <Text style={styles.orderPriceBC}>
                  {convertUSDToBeCoins(order.total_amount)} BC
                </Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: statusColor }]}
                >
                  <Text style={styles.statusText}>{statusText}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  ordersList: {
    gap: 12,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  orderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#999",
  },
  orderRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  orderPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  orderPriceBC: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B35",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
  },
});
