import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { ProfileEnum, useAuth } from "src/context";
import { useBeCoinsStore } from "src/stores";
import { useUserBalance } from "src/hooks/useUserBalance";
import { useBeCoinsPrice } from "src/hooks/useBeCoinsPrice";
import DashboardWrapper from "../DashboardWrapper";
import { Tabs } from "../ui/Tabs";
import { OrdersStatsCard } from "../stats/OrdersStatsCard";
import { SpendingStatsCard } from "../stats/SpendingStatsCard";
import { ResourcesCard } from "../stats/ResourcesCard";
import { LevelProgressCard } from "../stats/LevelProgressCard";
import { RecentOrdersList } from "../stats/RecentOrdersList";
import { QuickSettingsCard } from "../settings/QuickSettingsCard";
import { BalanceCard } from "../stats/BalanceCard";
import { ChangePasswordModal } from "../settings/ChangePasswordModal";
import { AddressManagementModal } from "../settings/AddressManagementModal";
import { AccountManagementCard } from "../settings/AccountManagementCard";
import { EnhancedProfileCard } from "../profile/EnhancedProfileCard";
import { OrderService } from "src/services/OrderApiService";
import ThemedTabs from "src/components/shared/Tabs/ThemedTabs";
import { Button, QRIcon } from "src/components";
import { useCustomNavigation } from "src/hooks";

export const UserPanel: React.FC = () => {
  const { user, status, hasProfile } = useAuth();
  const { navigate } = useCustomNavigation();
  const globalBeCoinsBalance = useBeCoinsStore((s) => s.balance);
  const { balance: walletBalance, loading: balanceLoading } = useUserBalance();
  const { beCoinsToUsd } = useBeCoinsPrice();

  const [activeTab, setActiveTab] = useState("overview");
  const [orderStats, setOrderStats] = useState({
    total: 0,
    totalSpent: 0,
    lockedBC: 0,
    lockedUSD: 0,
  });
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  useEffect(() => {
    loadOrderStats();
  }, []);

  const loadOrderStats = async () => {
    try {
      const response = await OrderService.getUserOrders();
      const orders = Array.isArray(response.data) ? response.data : [];

      const completed = orders.filter(
        (o: any) =>
          o.status?.code === "DELIVERED" ||
          o.status?.code === "COLLECTED" ||
          o.status?.code === "RECYCLED",
      );

      const totalSpent = completed.reduce(
        (sum, o: any) => sum + parseFloat(o.total_amount || 0),
        0,
      );

      // Calcular balance bloqueado en órdenes pendientes
      const pendingOrders = orders.filter(
        (o: any) =>
          o.status?.code === "PENDING" ||
          o.status?.code === "PREPARING" ||
          o.status?.code === "IN_DELIVERY",
      );

      const lockedBC = pendingOrders.reduce(
        (sum, o: any) => sum + parseFloat(o.total_becoin || 0),
        0,
      );

      const lockedUSD = pendingOrders.reduce(
        (sum, o: any) => sum + parseFloat(o.total_amount || 0),
        0,
      );

      setOrderStats({
        total: orders.length,
        totalSpent,
        lockedBC,
        lockedUSD,
      });
    } catch (error) {
      console.error("Error loading order stats:", error);
    }
  };

  if (!user) {
    return (
      <DashboardWrapper title="Dashboard" isLoading={status === "loading"}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            No se pudieron cargar los datos del usuario. Por favor, reinicie la
            aplicación.
          </Text>
        </View>
      </DashboardWrapper>
    );
  }

  const parsedUserBalance =
    Number((user as any)?.current_balance ?? (user as any)?.coins ?? 0) || 0;
  const storeBalanceNum = Number(globalBeCoinsBalance ?? 0) || 0;
  const beCoinsToShow =
    storeBalanceNum > 0 ? storeBalanceNum : parsedUserBalance;
  const baseTabs = [
    { id: "overview", label: "Resumen" },
    { id: "orders", label: "Mis Órdenes" },
    { id: "stats", label: "Estadísticas" },
    { id: "profile", label: "Perfil" },
    { id: "achievements", label: "Logros" },
  ];
  let dynamicTabs = [...baseTabs];
  //  MERCHANT
  if (hasProfile("MERCHANT" as ProfileEnum)) {
    dynamicTabs.push({ id: "merchant-finance", label: "Finanzas" });
  }

  //  DRIVER
  if (hasProfile("DRIVER" as ProfileEnum)) {
    dynamicTabs.push({
      id: "driver-orders",
      label: "Órdenes (Reparto)",
    });
  }
  const tabs = dynamicTabs;
  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <BalanceCard
        beCoinsBalance={walletBalance || globalBeCoinsBalance || 0}
        usdBalance={beCoinsToUsd(walletBalance || globalBeCoinsBalance || 0)}
        locked={orderStats.lockedBC}
        lockedUSD={orderStats.lockedUSD}
      />
      <LevelProgressCard
        level={(user as any).level || 1}
        currentXP={(user as any).xp || 0}
        nextLevelXP={((user as any).level || 1) * 1000}
        totalOrders={orderStats.total}
        totalSpent={orderStats.totalSpent}
      />
      <OrdersStatsCard />
      <SpendingStatsCard />
      <ResourcesCard />
      <QuickSettingsCard />
    </View>
  );

  const renderOrdersTab = () => (
    <View style={styles.tabContent}>
      <OrdersStatsCard />
      <RecentOrdersList limit={20} />
    </View>
  );

  const renderStatsTab = () => (
    <View style={styles.tabContent}>
      <SpendingStatsCard />
      <OrdersStatsCard />
      <LevelProgressCard
        level={(user as any).level || 1}
        currentXP={(user as any).xp || 0}
        nextLevelXP={((user as any).level || 1) * 1000}
        totalOrders={orderStats.total}
        totalSpent={orderStats.totalSpent}
      />
    </View>
  );

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <EnhancedProfileCard />
      <AccountManagementCard
        onPasswordChange={() => setPasswordModalVisible(true)}
        onAddressManagement={() => setAddressModalVisible(true)}
      />
    </View>
  );

  const renderAchievementsTab = () => (
    <View style={styles.tabContent}>
      <LevelProgressCard
        level={(user as any).level || 1}
        currentXP={(user as any).xp || 0}
        nextLevelXP={((user as any).level || 1) * 1000}
        totalOrders={orderStats.total}
        totalSpent={orderStats.totalSpent}
      />
      <ResourcesCard />
    </View>
  );

  const renderFinanceMerchant = () => (
    <View
      style={[styles.headerCard, { flexDirection: "column", minHeight: 150 }]}
    >
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={[styles.headerName]}>Finanzas</Text>
        <Button
          title="Cobrar"
          onPress={() => navigate("CobrarScreen")}
          icon={<QRIcon color="white" />}
        />
      </View>
      <Text>Aquí veras tus movimientos proximamente</Text>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverviewTab();
      case "orders":
        return renderOrdersTab();
      case "stats":
        return renderStatsTab();
      case "profile":
        return renderProfileTab();
      case "achievements":
        return renderAchievementsTab();
      case "merchant-finance":
        return renderFinanceMerchant();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <DashboardWrapper title="Mi Dashboard" isLoading={status === "loading"}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEnabled={true}
      >
        <View style={styles.container}>
          {/* Header Card with Balance */}
          <View style={styles.headerCard}>
            <View style={styles.headerLeft}>
              {user.profile_picture_url ? (
                <Image
                  source={{ uri: user.profile_picture_url }}
                  style={styles.headerAvatar}
                />
              ) : (
                <View style={styles.headerAvatarPlaceholder}>
                  <Text style={styles.headerAvatarText}>
                    {(user.full_name || user.email)[0].toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerGreeting}>Hola,</Text>
                <Text style={styles.headerName} numberOfLines={1}>
                  {user.full_name || user.email.split("@")[0]}
                </Text>
              </View>
            </View>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceAmount} numberOfLines={1}>
                {walletBalance || globalBeCoinsBalance || 0} BC
              </Text>
              <Text style={styles.balanceUSD} numberOfLines={1}>
                $
                {beCoinsToUsd(
                  walletBalance || globalBeCoinsBalance || 0,
                ).toFixed(2)}{" "}
                USD
              </Text>
            </View>
          </View>
          {/* Tabs Navigation - NO MÁS SCROLL AQUÍ */}
          <View style={styles.tabsWrapper}>
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
              {renderTabContent()}
            </Tabs>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <ChangePasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />
      <AddressManagementModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
      />
    </DashboardWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  container: {
    backgroundColor: "#F5F5F5",
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
  },
  headerCard: {
    backgroundColor: "#ffffff",
    padding: 12,
    marginTop: 10,
    marginHorizontal: 30,
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  headerTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    flexShrink: 0,
  },
  headerAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF6B35",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerGreeting: {
    fontSize: 12,
    color: "#999",
  },
  headerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  balanceContainer: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  balanceLabel: {
    fontSize: 10,
    color: "#999",
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  balanceUSD: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    marginTop: 1,
  },
  tabContent: {
    paddingHorizontal: 30,
    paddingTop: 16,
    paddingBottom: 20,
  },
  tabsWrapper: {
    minHeight: 500,
    backgroundColor: "#F5F5F5",
  },
});
