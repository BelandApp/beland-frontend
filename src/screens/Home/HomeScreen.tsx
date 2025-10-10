import React from "react";
import {
  View,
  ScrollView,
  Platform,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { AppHeader } from "../../components/layout/AppHeader";
import {
  HeroSection,
  QuickActions,
  FeatureCard,
  StatsCard,
  ActivitySection,
} from "./components";
import { RecentTransactions } from "../Wallet/components/RecentTransactions";
import {
  useDashboardNavigation,
  useDashboardData,
  useResponsiveLayout,
} from "./hooks";
import { useWalletTransactions } from "../Wallet/hooks";
import { useBeCoinsStore } from "../../stores/useBeCoinsStore";
import { LoginWave } from "src/components/ui/waves/Login.wave";
import { HomeWave } from "src/components/ui/waves/Home.wave";

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
  const estimatedValue = getBeCoinsInUSD(balance);

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
    navigation.navigate("Catalog" as never);
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
        <AppHeader variant="home" />
        <ScrollView style={webStyles.scrollView}>
          <View style={dynamicStyles.content}>
            <HeroSection
              balance={balance}
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
    <SafeAreaView style={styles.safeArea}>
      <AppHeader variant="home" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
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
        </View>
        <HomeWave />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
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
