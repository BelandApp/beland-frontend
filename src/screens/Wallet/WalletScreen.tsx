import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  Text,
  TouchableOpacity,
  StyleSheet,
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

export const WalletScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, isAuthenticated, loginWithAuth0, canPerformAction } = useAuth();

  const { walletData, refetch: refetchWallet } = useWalletData();
  const { mainWalletActions } = useWalletActions();
  const {
    transactions,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useWalletTransactions();

  // Actualizar transacciones al volver a la pantalla
  const nav = useNavigation();
  useEffect(() => {
    const unsubscribe = nav.addListener("focus", () => {
      // Si venimos de una recarga exitosa, forzar refetch del saldo y transacciones
      if (canPerformAction) {
        refetchWallet();
        refetchTransactions();
      }
    });
    return unsubscribe;
  }, [nav, refetchWallet, refetchTransactions, canPerformAction]);

  // Si no está autenticado, mostrar pantalla de login amigable
  if (!isAuthenticated) {
    return (
      <View style={styles.authRequiredContainer}>
        <View style={styles.authRequiredContent}>
          <Text style={styles.authRequiredTitle}>💰 Tu Billetera Digital</Text>
          <Text style={styles.authRequiredSubtitle}>
            Gestiona tus BeCoins, realiza recargas y transacciones de forma
            segura
          </Text>

          <View style={styles.authRequiredFeatures}>
            <Text style={styles.authRequiredFeature}>
              • Consulta tu saldo en tiempo real
            </Text>
            <Text style={styles.authRequiredFeature}>
              • Recarga monedas fácilmente
            </Text>
            <Text style={styles.authRequiredFeature}>
              • Historial de transacciones completo
            </Text>
            <Text style={styles.authRequiredFeature}>
              • Transferencias seguras
            </Text>
          </View>

          <TouchableOpacity
            style={styles.authRequiredButton}
            onPress={loginWithAuth0}
          >
            <Text style={styles.authRequiredButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <Text style={styles.authRequiredFooter}>
            Crea tu cuenta gratuita y comienza a usar tu billetera digital
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, backgroundColor: "#fff" }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={containerStyles.content}>
            <WalletHeader />
            <WalletBalanceCard
              walletData={walletData}
              avatarUrl={user?.picture}
            />
            <WalletActions actions={mainWalletActions} />

            {/* Transacciones recientes */}
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

const styles = StyleSheet.create({
  authRequiredContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  authRequiredContent: {
    alignItems: "center",
    maxWidth: 300,
  },
  authRequiredTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B35",
    textAlign: "center",
    marginBottom: 16,
  },
  authRequiredSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  authRequiredFeatures: {
    alignSelf: "stretch",
    marginBottom: 32,
  },
  authRequiredFeature: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
  authRequiredButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
  },
  authRequiredButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  authRequiredFooter: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
});
