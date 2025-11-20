/**
 * Componente para mostrar el balance actualizado
 */

import React from "react";
import { styles } from "../styles";

interface WalletBalanceBadgeProps {
  balance: number | null;
}

export const WalletBalanceBadge: React.FC<WalletBalanceBadgeProps> = ({
  balance,
}) => {
  if (balance === null) return null;

  return (
    <div style={styles.balanceBadge}>
      <b>Saldo actualizado: {balance} BeCoins</b>
    </div>
  );
};
