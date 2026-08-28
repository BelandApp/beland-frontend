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
import { Button, Card, CustomLoader, ThemedHeader } from "src/components";
import { View } from "react-native";
import { useCustomNavigation } from "src/hooks";
import { PhoneCall } from "lucide-react-native";
import { DIEGO_NUMBER, shareTextOnWhatsApp } from "src/utils/shareHelper";
import { STATUS_MESSAGES } from "./constants";

export default function PayphoneSuccessScreen() {
  const { id, clientTxId, status, loading, walletBalance } =
    usePayphoneConfirmation();
  const comeFromRecharge = localStorage.getItem("comeFromRecharge");
  const { navigate } = useCustomNavigation();
  const isTrouble = STATUS_MESSAGES.REJECTED_OR_CANCELLED;
  return (
    <View className="min-h-screen">
      <ThemedHeader canGoBack />
      <View>
        <Card style={styles.card}>
          {/* Título */}
          <StatusTitle status={status} loading={loading} />

          {/* Spinner de carga */}
          {loading && <CustomLoader />}

          {/* Estado de la transacción */}
          {/* <StatusInfo status={status} loading={loading} /> */}

          {/* Información de transacción */}
          <TransactionInfo id={id} clientTxId={clientTxId} />

          {/* Badge de saldo actualizado */}
          <WalletBalanceBadge balance={walletBalance} />

          {/* Mensaje de redirección */}
          <RedirectMessage status={status} />
        </Card>
        <View className="flex-row">
          <Button
            title="Volver"
            onPress={() => {
              localStorage.removeItem("comeFromRecharge");
              localStorage.removeItem("payphone_token");
              navigate("MainTabs", { screen: "Home" });
            }}
            style={{ margin: "auto" }}
          />
          {!isTrouble && comeFromRecharge && (
            <Button
              title="Terminar de comprar"
              onPress={() => {
                localStorage.removeItem("comeFromRecharge");
                localStorage.removeItem("payphone_token");
                navigate("MainTabs", {
                  screen: "Catalog",
                  params: { comeFromRecharge: true },
                });
              }}
              style={{ margin: "auto" }}
            />
          )}
          {isTrouble && !loading && (
            <Button
              title="Tengo problemas"
              icon={<PhoneCall />}
              onPress={() => {
                localStorage.removeItem("comeFromRecharge");
                localStorage.removeItem("payphone_token");
                shareTextOnWhatsApp({
                  message: `Tengo problemas con mi recarga de payphone, id:${id} clientTxId: ${clientTxId}`,
                  phone: DIEGO_NUMBER,
                });
              }}
              style={{ margin: "auto" }}
              variant="secondary"
            />
          )}
        </View>
      </View>
    </View>
  );
}
