import React, { useEffect } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { WaveBottomGray, ThemedHeader } from "@/components";
import { useAuth } from "@/context";
import {
  WalletBalanceCard,
  WalletActions,
  RecentTransactions,
} from "./components";
import { useWalletActions } from "./hooks";
import { containerStyles } from "./styles";
import { useWallet } from "./hooks/useWalletData";
import WithdrawAccounts from "./components/WithdrawAccounts";
import { colors } from "src/design-system";

export const WalletScreen = () => {
  const { isAuthenticated } = useAuth();

  const { walletData, transactions, loadingTransactions, refreshAll } =
    useWallet();

  const { mainWalletActions } = useWalletActions();

  // Actualizar transacciones al volver a la pantalla
  const nav = useNavigation();
  useEffect(() => {
    const unsubscribe = nav.addListener("focus", () => {
      // Si venimos de una recarga exitosa, forzar refetch del saldo y transacciones
      if (isAuthenticated) {
        refreshAll();
      }
    });
    return unsubscribe;
  }, [nav, isAuthenticated]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <ThemedHeader title="Mis Becoins" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: "#fff" }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={containerStyles.content}>
            <WalletBalanceCard walletData={walletData} />
            <WalletActions
              actions={mainWalletActions}
              backgroundColor={colors.brand.orange[500]}
            />
            {/* Preferencias de pago */}

            <WithdrawAccounts />
            {/* Transacciones recientes */}
            <RecentTransactions
              transactions={transactions ?? []}
              isLoading={loadingTransactions}
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
