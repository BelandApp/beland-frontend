import React from "react";
import { View, ScrollView, Platform, StyleSheet } from "react-native";
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
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";

export const HomeScreen = () => {
  const { navigate } = useCustomNavigation();
  const {
    navigateViewHistory,
    navigateRecyclingMapPress,
    navigateCommunity,
    navigateDelivery,
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
        paddingBottom: isMobile ? 80 : 120,
      },
    });

    return (
      <View style={webStyles.container}>
        <ThemedHeader title="Inicio" logo />
        <ScrollView
          style={webStyles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={dynamicStyles.content}>
            <HeroSection
              balance={balance}
              locked_balance={lockedBalanceToPass}
              estimatedValue={estimatedValue.toFixed(2)}
            />
            <QuickActions />

            <View style={dynamicStyles.featuresGrid}>
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

  // Mobile version - mismo diseño pero con layout adaptado
  return (
    <View style={styles.safeArea}>
      <ThemedHeader logo />
      <ScrollView style={styles.scrollView}>
        <HeroSection
          balance={balance}
          estimatedValue={estimatedValue.toFixed(2)}
        />
        <QuickActions />

        <StatsCard
          becoins={balance}
          bottlesRecycled={userStats?.bottlesRecycled ?? 0}
          estimatedValue={estimatedValue.toFixed(2)}
        />

        <FeatureCard
          type="recycling"
          data={{ bottlesRecycled: userStats?.bottlesRecycled ?? 0 }}
          onPress={navigateRecyclingMapPress}
        />
        <FeatureCard type="community" onPress={navigateCommunity} />

        <RecentTransactions transactions={transactions ?? []} />

        <ActivitySection
          activities={activities}
          onViewHistory={navigateViewHistory}
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
});
