import React from "react";
import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import {
  HeroSection,
  QuickActions,
  FeatureCard,
  StatsCard,
} from "./components";
import { RecentTransactions } from "@/screens/Wallet/components/RecentTransactions";
import { useDashboardNavigation, useDashboardData } from "./hooks";
import { useWallet } from "../Wallet/hooks";
import { useBeCoinsStore } from "@/stores";
import { HomeWave } from "src/components/ui/waves/Home.wave";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { convertBeCoinsToUSD } from "src/constants";

export const HomeScreen = () => {
  const { navigateRecyclingMapPress, navigateCommunity, navigateDelivery } =
    useDashboardNavigation();
  const { userStats, activities } = useDashboardData();
  const { getBeCoinsInUSD } = useBeCoinsStore();
  const { loadingWallet: loading, transactions, walletData } = useWallet();
  // Usar la constante centralizada para el cálculo de USD
  const lockedBalance = useBeCoinsStore((state) => state.locked_balance) ?? 0;
  const estimatedValue = getBeCoinsInUSD(walletData.balance);

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
            balance={walletData.balance}
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
            becoins={walletData.becoin_green}
            bottlesRecycled={userStats?.bottlesRecycled ?? 0}
            estimatedValue={String(
              convertBeCoinsToUSD(walletData.becoin_green),
            )}
          />

          <RecentTransactions transactions={transactions ?? []} />
        </View>
        <HomeWave />
      </ScrollView>
    </View>
  );
};

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
    flexDirection: Dimensions.get("window").width > 600 ? "row" : "column",
    gap: 24,
    marginVertical: 24,
    flexWrap: "wrap",
  },
});
