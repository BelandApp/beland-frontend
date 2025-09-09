import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { WaveBottomGray } from "../../components/icons";
import {
  WalletHeader,
  WalletBalanceCard,
  WalletActions,
  RecentTransactions,
} from "./components";
import { useAuth } from "../../hooks/AuthContext";

import {
  useWalletData,
  useWalletActions,
  useWalletTransactions,
} from "./hooks";
import { containerStyles } from "./styles";
import { AuthenticationModal } from "../AuthenticationModal";

export const WalletScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const { walletData, refetch: refetchWallet } = useWalletData();
  const { mainWalletActions } = useWalletActions();
  const {
    transactions,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useWalletTransactions();

  const nav = useNavigation();

  useEffect(() => {
    const unsubscribe = nav.addListener("focus", () => {
      if (!isAuthenticated) {
        setAuthModalVisible(true);
        return;
      }
      refetchWallet();
      refetchTransactions();
    });
    return unsubscribe;
  }, [nav, refetchWallet, refetchTransactions, isAuthenticated]);

  // Si no está autenticado, no mostrar la UI sensible
  if (!isAuthenticated) {
    return (
      <>
        <AuthenticationModal
          visible={authModalVisible}
          onClose={() => setAuthModalVisible(false)}
          message="Para ver tu billetera y transacciones, necesitas iniciar sesión."
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}>
          <Text style={{ fontSize: 18, textAlign: "center" }}>
            Debes iniciar sesión para acceder a tu billetera.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setAuthModalVisible(true);
            }}
            style={{
              marginTop: 20,
              backgroundColor: "#FF6B35",
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
            }}>
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Iniciar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  // Si está autenticado, mostrar la UI completa
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, backgroundColor: "#fff" }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled">
          <View style={containerStyles.content}>
            <WalletHeader />
            <WalletBalanceCard
              walletData={walletData}
              avatarUrl={user?.picture}
            />
            <WalletActions actions={mainWalletActions} />

            <RecentTransactions
              transactions={transactions ?? []}
              isLoading={transactionsLoading}
            />
          </View>
          <View style={containerStyles.waveContainer}>
            <WaveBottomGray
              width={Dimensions.get("window").width}
              height={120}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};
