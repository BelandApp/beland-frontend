import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Button, ThemedHeader } from "src/components";
import { useAuth } from "src/context";

export const WalletGuestScreen = () => {
  const { handleAuth0Login } = useAuth();
  return (
    <>
      <ThemedHeader title="Billetera" />
      <View style={styles.authRequiredContainer}>
        <View style={styles.authRequiredContent}>
          <Text style={styles.authRequiredTitle}>💰 Tus Becoins</Text>
          <Text style={styles.authRequiredSubtitle}>
            Aqui vas a poder Gestionar tus BeCoins, realiza recargas y
            transacciones de forma segura
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
          <Button title="Iniciar sesión" onPress={handleAuth0Login} />
          <Text style={styles.authRequiredFooter}>
            Crea tu cuenta gratuita y comienza a usar tus becoins
          </Text>
        </View>
      </View>
    </>
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
