/**
 * Componente para mostrar el título según el estado
 */

import React from "react";
import { styles } from "../styles";
import type { TransactionStatus } from "../types";
import { STATUS_MESSAGES } from "../constants";

interface StatusTitleProps {
  status: string;
  loading: boolean;
}

export const StatusTitle: React.FC<StatusTitleProps> = ({
  status,
  loading,
}) => {
  if (loading) return null;

  const isSuccess =
    status === STATUS_MESSAGES.PAYMENT_SUCCESS ||
    status === STATUS_MESSAGES.RECHARGE_SUCCESS;

  const isError = !isSuccess;

  return (
    <h2 style={isSuccess ? styles.title.success : styles.title.error}>
      {status}
    </h2>
  );
};
