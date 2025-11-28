import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrendingUp, DollarSign, ShoppingBag } from "lucide-react-native";
import { OrderService } from "src/services/OrderApiService";
import { Order } from "src/types/Order";

interface SpendingStats {
  totalSpent: number;
  totalSpentBC: number;
  averageOrder: number;
  averageOrderBC: number;
  thisMonth: number;
  thisMonthBC: number;
}

export const SpendingStatsCard: React.FC = () => {
  const [stats, setStats] = useState<SpendingStats>({
    totalSpent: 0,
    totalSpentBC: 0,
    averageOrder: 0,
    averageOrderBC: 0,
    thisMonth: 0,
    thisMonthBC: 0,
  });

  useEffect(() => {
    loadSpendingStats();
  }, []);

  const loadSpendingStats = async () => {
    try {
      const response = await OrderService.getUserOrders({ limit: 1000 });
      const orders = Array.isArray(response.data) ? response.data : [];

      const completedOrders = orders.filter(
        (o: any) =>
          o.status?.code === "DELIVERED" ||
          o.status?.code === "COLLECTED" ||
          o.status?.code === "RECYCLED"
      );

      const totalSpent = completedOrders.reduce(
        (sum, order: any) => sum + parseFloat(order.total_amount || 0),
        0
      );

      const totalSpentBC = completedOrders.reduce(
        (sum, order: any) => sum + parseFloat(order.total_becoin || 0),
        0
      );

      const averageOrder =
        completedOrders.length > 0 ? totalSpent / completedOrders.length : 0;

      const averageOrderBC =
        completedOrders.length > 0 ? totalSpentBC / completedOrders.length : 0;

      // Gastos del mes actual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthOrders = completedOrders.filter((o: any) => {
        const orderDate = new Date(o.created_at);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      });

      const thisMonthSpent = thisMonthOrders.reduce(
        (sum, order: any) => sum + parseFloat(order.total_amount || 0),
        0
      );

      const thisMonthSpentBC = thisMonthOrders.reduce(
        (sum, order: any) => sum + parseFloat(order.total_becoin || 0),
        0
      );

      setStats({
        totalSpent,
        totalSpentBC,
        averageOrder,
        averageOrderBC,
        thisMonth: thisMonthSpent,
        thisMonthBC: thisMonthSpentBC,
      });
    } catch (error) {
      console.error("Error loading spending stats:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TrendingUp size={20} color="#FF6B35" />
        <Text style={styles.title}>Estadísticas de Gasto</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: "#E8F5E9" }]}>
            <DollarSign size={24} color="#4CAF50" />
          </View>
          <Text style={styles.statValue}>${stats.totalSpent.toFixed(2)}</Text>
          <Text style={styles.statSubvalue}>
            {stats.totalSpentBC.toFixed(0)} BC
          </Text>
          <Text style={styles.statLabel}>Total Gastado</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: "#E3F2FD" }]}>
            <ShoppingBag size={24} color="#2196F3" />
          </View>
          <Text style={styles.statValue}>${stats.averageOrder.toFixed(2)}</Text>
          <Text style={styles.statSubvalue}>
            {stats.averageOrderBC.toFixed(0)} BC
          </Text>
          <Text style={styles.statLabel}>Promedio por Orden</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: "#FFF3E0" }]}>
            <TrendingUp size={24} color="#FF9800" />
          </View>
          <Text style={styles.statValue}>${stats.thisMonth.toFixed(2)}</Text>
          <Text style={styles.statSubvalue}>
            {stats.thisMonthBC.toFixed(0)} BC
          </Text>
          <Text style={styles.statLabel}>Este Mes</Text>
        </View>
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
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statSubvalue: {
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
