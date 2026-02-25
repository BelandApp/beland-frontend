import React from "react";
import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import { HeroSection, FeatureCard, StatsCard } from "./components";
import { RecentTransactions } from "@/screens/Wallet/components/RecentTransactions";
import { useDashboardNavigation, useDashboardData } from "./hooks";
import { useWallet, useWalletActions } from "../Wallet/hooks";
import { useBeCoinsStore } from "@/stores";
import { HomeWave } from "src/components/ui/waves/Home.wave";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { convertBeCoinsToUSD } from "src/constants";
import { WalletActions } from "../Wallet";
import { colors } from "src/design-system";

export const HomeScreen = () => {
  const {
    navigateRecyclingMapPress,
    navigateCommunity,
    navigateDelivery,
    navigateFaq,
  } = useDashboardNavigation();
  const { userStats } = useDashboardData();
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
  const { mainWalletActions } = useWalletActions();
  return (
    <View style={styles.container}>
      <ThemedHeader title="Inicio" logo />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <HeroSection wallet={walletData} isLoading={loading} />
          <WalletActions
            actions={mainWalletActions}
            backgroundColor={colors.brand.orange[500]}
          />

          <View style={styles.featuresGrid}>
            <FeatureCard
              type="recycling"
              data={{ bottlesRecycled: userStats?.bottlesRecycled ?? 0 }}
              onPress={navigateRecyclingMapPress}
            />
            <FeatureCard type="delivery" onPress={navigateDelivery} />
            <FeatureCard type="community" onPress={navigateCommunity} />
            <FeatureCard type="faq" onPress={navigateFaq} />
          </View>

          <StatsCard
            greenBecoins={walletData.becoin_green}
            orangeBecoins={walletData.becoin_orange}
            bottlesRecycled={userStats?.bottlesRecycled ?? 0}
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
