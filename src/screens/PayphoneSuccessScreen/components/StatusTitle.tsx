/**
 * Componente para mostrar el título según el estado
 */

import React from "react";
import { styles } from "../styles";
import type { TransactionStatus } from "../types";
import { STATUS_MESSAGES } from "../constants";
import { Text } from "react-native";

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

  return (
    <Text
      className={`font-semibold text-lg ${isSuccess ? "text-green-500" : "text-red-500"}`}
    >
      {status}
    </Text>
  );
};
