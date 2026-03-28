/**
 * Componente para mostrar información de transacción
 */

import React from "react";
import { styles } from "../styles";
import { View, Text } from "react-native";

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
      <View style={styles.infoSection}>
        <Text className="text-beland-green-400 font-medium">
          ID de transacción:
        </Text>
        <br />
        <Text style={styles.infoValue}>{id ?? "No disponible"}</Text>
      </View>
      <View style={styles.infoSection}>
        <Text className="text-beland-green-400 font-medium">
          Client Transaction ID:
        </Text>
        <br />
        <Text style={styles.infoValue}>{clientTxId ?? "No disponible"}</Text>
      </View>
    </>
  );
};
