import React from "react";
import { View, ScrollView, Platform, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  HeroSection,
  QuickActions,
  FeatureCard,
  StatsCard,
  ActivitySection,
} from "./components";
import { RecentTransactions } from "@/screens/Wallet/components/RecentTransactions";
import {
  useDashboardNavigation,
  useDashboardData,
  useResponsiveLayout,
} from "./hooks";
import { useWalletTransactions } from "../Wallet/hooks";
import { useBeCoinsStore } from "../../stores/useBeCoinsStore";
import { LoginWave } from "src/components/ui/waves/Login.wave";
import { HomeWave } from "src/components/ui/waves/Home.wave";
import { colors } from "src/styles";
import { ThemedHeader } from "src/components/shared/headers/Header";

export const HomeScreen = () => {
  const navigation = useNavigation();
  const {
    handleMenuPress,
    handleViewHistory,
    handleCoinsPress,
    handleRecyclingMapPress,
  } = useDashboardNavigation();
  const { userStats, activities } = useDashboardData();
  const { transactions } = useWalletTransactions();
  const { getBeCoinsInUSD } = useBeCoinsStore();
  const { isMobile } = useResponsiveLayout();

  // Usar la constante centralizada para el cálculo de USD
  const balance = userStats?.coinsAmount ?? 0;
  const lockedBalance = useBeCoinsStore((state) => state.locked_balance) ?? 0;
  const estimatedValue = getBeCoinsInUSD(balance);

  // Solo pasar locked_balance si es mayor a 0
  const shouldShowLockedBalance = lockedBalance > 0;
  const lockedBalanceToPass = shouldShowLockedBalance
    ? lockedBalance
    : undefined;

  // Handlers para acciones rápidas
  const handleRecharge = () => {
    navigation.navigate("RechargeScreen" as never);
  };

  const handleSend = () => {
    navigation.navigate("SendScreen" as never);
  };

  const handleExchange = () => {
    navigation.navigate("CanjearScreen" as never);
  };

  const handleReceive = () => {
    navigation.navigate("ReceiveScreen" as never);
  };

  const handleCollect = () => {
    navigation.navigate("CobrarScreen" as never);
  };

  const handleCommunity = () => {
    navigation.navigate("Community" as never);
  };

  const handleDelivery = () => {
    navigation.navigate("Catalog" as never);
  };
  if (Platform.OS === "web") {
    const dynamicStyles = StyleSheet.create({
      featuresGrid: {
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 16 : 24,
        marginVertical: isMobile ? 16 : 24,
        flexWrap: "wrap",
      },
      content: {
        ...webStyles.content,
        padding: isMobile ? 16 : 32,
        paddingBottom: isMobile ? 80 : 120,
      },
    });

    return (
      <View style={webStyles.container}>
        <ThemedHeader title="Inicio" logo />
        <ScrollView style={webStyles.scrollView}>
          <View style={dynamicStyles.content}>
            <HeroSection
              balance={balance}
              locked_balance={lockedBalanceToPass}
              estimatedValue={estimatedValue.toFixed(2)}
            />
            <QuickActions
              onRecharge={handleRecharge}
              onSend={handleSend}
              onReceive={handleReceive}
              onCollect={handleCollect}
              onExchange={handleExchange}
            />

            <View style={dynamicStyles.featuresGrid}>
              <FeatureCard
                type="recycling"
                data={{ bottlesRecycled: userStats?.bottlesRecycled ?? 0 }}
                onPress={handleRecyclingMapPress}
              />

              <FeatureCard type="delivery" onPress={handleDelivery} />
              <FeatureCard type="community" onPress={handleCommunity} />
            </View>

            <StatsCard
              becoins={balance}
              bottlesRecycled={userStats?.bottlesRecycled ?? 0}
              estimatedValue={estimatedValue.toFixed(2)}
            />

            <RecentTransactions transactions={transactions ?? []} />
          </View>
          <HomeWave />
        </ScrollView>
      </View>
    );
  }

  // Mobile version - mismo diseño pero con layout adaptado
  return (
    <View style={styles.safeArea}>
      <ThemedHeader logo />
      <ScrollView style={styles.scrollView}>
        <HeroSection
          balance={balance}
          estimatedValue={estimatedValue.toFixed(2)}
        />
        <QuickActions
          onRecharge={handleRecharge}
          onSend={handleSend}
          onReceive={handleReceive}
          onCollect={handleCollect}
        />

        <StatsCard
          becoins={balance}
          bottlesRecycled={userStats?.bottlesRecycled ?? 0}
          estimatedValue={estimatedValue.toFixed(2)}
        />

        <FeatureCard
          type="recycling"
          data={{ bottlesRecycled: userStats?.bottlesRecycled ?? 0 }}
          onPress={handleRecyclingMapPress}
        />
        <FeatureCard type="community" onPress={handleCommunity} />

        <RecentTransactions transactions={transactions ?? []} />

        <ActivitySection
          activities={activities}
          onViewHistory={handleViewHistory}
        />

        <HomeWave />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffff",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#ffff",
  },
});

const webStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
    padding: 32,
    paddingBottom: 120,
  },
});
