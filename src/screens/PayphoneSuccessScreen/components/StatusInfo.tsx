/**
 * Componente para mostrar la información de estado
 */

import React from "react";
import { styles } from "../styles";
import { STATUS_MESSAGES } from "../constants";
import { Text, View } from "react-native";
import { colors } from "src/design-system";

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
    <View style={styles.statusSection} className="mb-7 flex-row">
      <Text className="font-semibold">Estado:</Text>

      <Text
        className={`font-semibold text-lg ${loading && colors.text.secondary} ${isSuccess && colors.semantic.success[500]} ${isError && colors.semantic.error[500]}`}
      >
        {displayStatus}
      </Text>
    </View>
  );
};
