/**
 * Componente para mostrar el balance actualizado
 */

import React from "react";
import { styles } from "../styles";
import { View, Text } from "react-native";

interface WalletBalanceBadgeProps {
  balance: number | null;
}

export const WalletBalanceBadge: React.FC<WalletBalanceBadgeProps> = ({
  balance,
}) => {
  if (balance === null) return null;

  return (
    <View style={styles.balanceBadge}>
      <Text className="font-bold">Saldo actualizado: {balance} BeCoins</Text>
    </View>
  );
};
