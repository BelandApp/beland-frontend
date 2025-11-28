import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Package, CheckCircle, XCircle, Clock } from "lucide-react-native";
import { OrderService } from "src/services/OrderApiService";
import { Order } from "src/types/Order";

interface OrdersStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
}

export const OrdersStatsCard: React.FC = () => {
  const [stats, setStats] = useState<OrdersStats>({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrdersStats();
  }, []);

  const loadOrdersStats = async () => {
    try {
      setLoading(true);
      const response = await OrderService.getUserOrders({ limit: 1000 });
      const orders = Array.isArray(response.data) ? response.data : [];

      const statsData = {
        total: orders.length,
        completed: orders.filter(
          (o: any) =>
            o.status?.code === "DELIVERED" ||
            o.status?.code === "COLLECTED" ||
            o.status?.code === "RECYCLED"
        ).length,
        pending: orders.filter(
          (o: any) =>
            o.status?.code === "PENDING" ||
            o.status?.code === "PREPARING" ||
            o.status?.code === "IN_DELIVERY"
        ).length,
        cancelled: orders.filter((o: any) => o.status?.code === "CANCELLED")
          .length,
      };

      setStats(statsData);
    } catch (error) {
      console.error("Error loading orders stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Package size={20} color="#FF6B35" />
        <Text style={styles.title}>Mis Órdenes</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#E3F2FD" }]}>
            <Package size={18} color="#2196F3" />
          </View>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#E8F5E9" }]}>
            <CheckCircle size={18} color="#4CAF50" />
          </View>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#FFF3E0" }]}>
            <Clock size={18} color="#FF9800" />
          </View>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: "#FFEBEE" }]}>
            <XCircle size={18} color="#F44336" />
          </View>
          <Text style={styles.statValue}>{stats.cancelled}</Text>
          <Text style={styles.statLabel}>Canceladas</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
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
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    paddingVertical: 10,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
});
