import React from "react";
import { View, ScrollView, Platform, StyleSheet, Dimensions } from "react-native";
import {
  HeroSection,
  QuickActions,
  FeatureCard,
  StatsCard,
} from "./components";
import { RecentTransactions } from "@/screens/Wallet/components/RecentTransactions";
import {
  useDashboardNavigation,
  useDashboardData,
  useResponsiveLayout,
} from "./hooks";
import { useWalletData, useWalletTransactions } from "../Wallet/hooks";
import { useBeCoinsStore } from "@/stores";
import { HomeWave } from "src/components/ui/waves/Home.wave";
import { ThemedHeader } from "src/components/shared/headers/Header";

export const HomeScreen = () => {
  const {
    navigateViewHistory,
    navigateRecyclingMapPress,
    navigateCommunity,
    navigateDelivery,
  } = useDashboardNavigation();
  const { userStats, activities } = useDashboardData();
  const { transactions } = useWalletTransactions();
  const { getBeCoinsInUSD } = useBeCoinsStore();
  const { loading}=useWalletData()

  // Usar la constante centralizada para el cálculo de USD
  const balance = userStats?.coinsAmount ?? 0;
  const lockedBalance = useBeCoinsStore((state) => state.locked_balance) ?? 0;
  const estimatedValue = getBeCoinsInUSD(balance);

  // Solo pasar locked_balance si es mayor a 0
  const shouldShowLockedBalance = lockedBalance > 0;
  const lockedBalanceToPass = shouldShowLockedBalance
    ? lockedBalance
    : undefined;



    return (
      <View style={styles.container}>
        <ThemedHeader title="Inicio" logo />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <HeroSection
              balance={balance}
              locked_balance={lockedBalanceToPass}
              estimatedValue={estimatedValue.toFixed(2)}
              isLoading={loading}
            />
            <QuickActions />

            <View style={styles.featuresGrid}>
              <FeatureCard
                type="recycling"
                data={{ bottlesRecycled: userStats?.bottlesRecycled ?? 0 }}
                onPress={navigateRecyclingMapPress}
              />
              <FeatureCard type="delivery" onPress={navigateDelivery} />
              <FeatureCard type="community" onPress={navigateCommunity} />
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

  


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
    padding: 16,
    paddingBottom: 120,
  },
  featuresGrid: {
    flexDirection:Dimensions.get("window").width > 600 ? "row" : "column",
    gap:  24,
    marginVertical: 24,
    flexWrap: "wrap",
  },
});
