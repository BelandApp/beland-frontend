/**
 * PayphoneSuccessScreen - Pantalla de confirmación de transacciones Payphone
 *
 * Esta pantalla maneja la confirmación de pagos y recargas a través de Payphone.
 * Soporta tanto recargas de wallet como pagos QR.
 */

import React from "react";
import { usePayphoneConfirmation } from "./hooks/usePayphoneConfirmation";
import {
  LoadingSpinner,
  StatusTitle,
  StatusInfo,
  TransactionInfo,
  WalletBalanceBadge,
  RedirectMessage,
} from "./components";
import { styles } from "./styles";
import { Button, Card, ThemedHeader } from "src/components";
import { View } from "react-native";
import { useCustomNavigation } from "src/hooks";

export default function PayphoneSuccessScreen() {
  const { id, clientTxId, status, loading, walletBalance } =
    usePayphoneConfirmation();
  const { navigate } = useCustomNavigation();

  return (
    <View className="min-h-screen">
      <ThemedHeader canGoBack />
      <div>
        <Card style={styles.card}>
          {/* Título */}
          <StatusTitle status={status} loading={loading} />

          {/* Spinner de carga */}
          {loading && <LoadingSpinner />}

          {/* Estado de la transacción */}
          <StatusInfo status={status} loading={loading} />

          {/* Información de transacción */}
          <TransactionInfo id={id} clientTxId={clientTxId} />

          {/* Badge de saldo actualizado */}
          <WalletBalanceBadge balance={walletBalance} />

          {/* Mensaje de redirección */}
          <RedirectMessage status={status} />
        </Card>
        <Button
          title="Volver"
          onPress={() => navigate("MainTabs", { screen: "Home" })}
          style={{ margin: "auto" }}
        />
      </div>
    </View>
  );
}
