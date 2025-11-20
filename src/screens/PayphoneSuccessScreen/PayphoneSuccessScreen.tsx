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

export default function PayphoneSuccessScreen() {
  const { id, clientTxId, status, loading, walletBalance } =
    usePayphoneConfirmation();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
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
      </div>
    </div>
  );
}
