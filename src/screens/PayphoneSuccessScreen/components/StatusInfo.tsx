/**
 * Componente para mostrar la información de estado
 */

import React from "react";
import { styles } from "../styles";
import { STATUS_MESSAGES } from "../constants";

interface StatusInfoProps {
  status: string;
  loading: boolean;
}

export const StatusInfo: React.FC<StatusInfoProps> = ({ status, loading }) => {
  const isSuccess =
    status === STATUS_MESSAGES.PAYMENT_SUCCESS ||
    status === STATUS_MESSAGES.RECHARGE_SUCCESS;

  const isError = !isSuccess && status !== STATUS_MESSAGES.PENDING && !loading;

  const displayStatus = loading
    ? STATUS_MESSAGES.PENDING
    : isSuccess
    ? status
    : status;

  return (
    <div style={styles.statusSection}>
      <span style={styles.statusLabel}>Estado:</span>
      <br />
      <span style={styles.statusValue(loading, isSuccess, isError)}>
        {displayStatus}
      </span>
    </div>
  );
};
