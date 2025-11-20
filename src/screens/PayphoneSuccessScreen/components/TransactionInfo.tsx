/**
 * Componente para mostrar información de transacción
 */

import React from "react";
import { styles } from "../styles";

interface TransactionInfoProps {
  id: string | null;
  clientTxId: string | null;
}

export const TransactionInfo: React.FC<TransactionInfoProps> = ({
  id,
  clientTxId,
}) => {
  return (
    <>
      <div style={styles.infoSection}>
        <span style={styles.infoLabel}>ID de transacción:</span>
        <br />
        <span style={styles.infoValue}>{id ?? "No disponible"}</span>
      </div>
      <div style={styles.infoSection}>
        <span style={styles.infoLabel}>Client Transaction ID:</span>
        <br />
        <span style={styles.infoValue}>{clientTxId ?? "No disponible"}</span>
      </div>
    </>
  );
};
